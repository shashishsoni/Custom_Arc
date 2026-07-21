import type { CheckoutSession, ConfirmPaymentRequest, OrderSummary } from '@customarc/shared'
import { badRequest, forbidden, notFound } from '../../errors.ts'
import { billingService } from '../billing/service.ts'
import { designerService } from '../designer/service.ts'
import { fulfillmentService } from '../fulfillment/service.ts'
import { printFilesService } from '../print-files/service.ts'
import { logger } from '../../logger.ts'
import { ordersRepo, type OrderRow } from './repo.ts'
import { assertTransition } from './transitions.ts'

export type { OrderState } from './transitions.ts'
export { assertTransition } from './transitions.ts'

function toSummary(row: OrderRow): OrderSummary {
  return {
    id: row.id,
    state: row.state,
    totalMinor: row.totalMinor,
    currency: row.currency,
    razorpayOrderId: row.razorpayOrderId,
    partner: row.partner,
    partnerOrderId: row.partnerOrderId,
  }
}

/** Checkout for a saved design (issue 14/16). AI generation is not required. */
export class OrderService {
  constructor(
    private readonly repo = ordersRepo,
    private readonly billing = billingService,
    private readonly designs = designerService,
    private readonly printFiles = printFilesService,
    private readonly fulfillment = fulfillmentService,
  ) {}

  async createFromCheckout(input: {
    userId: string
    designId: string
    blankVariantId: string
  }): Promise<OrderSummary> {
    const design = await this.designs.getByIdForUser(input.designId, input.userId)
    const variant = await this.repo.getVariant(input.blankVariantId)
    if (!variant || !variant.isActive) throw notFound('Blank variant not found')
    if (variant.blankId !== design.blankId) {
      throw badRequest('Variant does not belong to this design’s blank')
    }

    const row = await this.repo.create({
      userId: input.userId,
      designId: input.designId,
      blankVariantId: input.blankVariantId,
      unitPriceMinor: variant.priceMinor,
      totalMinor: variant.priceMinor,
      currency: variant.currency,
    })
    return toSummary(row)
  }

  async getForUser(orderId: string, userId: string): Promise<OrderSummary> {
    return toSummary(await this.requireOwned(orderId, userId))
  }

  async startCheckout(orderId: string, userId: string): Promise<CheckoutSession> {
    const order = await this.requireOwned(orderId, userId)
    if (order.state !== 'designing') throw badRequest('Order is not awaiting payment')

    const session = await this.billing.createCheckoutSession({
      orderId: order.id,
      amountMinor: order.totalMinor,
      currency: order.currency,
    })

    await this.repo.setRazorpayOrderId(order.id, session.razorpayOrderId)

    return {
      orderId: order.id,
      mode: session.mode,
      amountMinor: order.totalMinor,
      currency: order.currency,
      razorpayOrderId: session.razorpayOrderId,
      ...(session.razorpayKeyId ? { razorpayKeyId: session.razorpayKeyId } : {}),
    }
  }

  async confirmPayment(
    orderId: string,
    userId: string,
    body: ConfirmPaymentRequest,
  ): Promise<OrderSummary> {
    const order = await this.requireOwned(orderId, userId)
    if (order.state === 'paid' || order.state === 'in_production') return toSummary(order)
    if (order.state !== 'designing') throw badRequest('Order cannot be paid in this state')

    if (body.mode === 'mock') {
      if (!order.razorpayOrderId?.startsWith('mock_')) {
        throw badRequest('Mock confirm only allowed for mock checkout sessions')
      }
      assertTransition(order.state, 'paid')
      const paid = await this.repo.markPaid(order.id, `mock_pay_${order.id}`)
      await this.afterPaid(paid.id)
      return toSummary((await this.repo.getById(paid.id))!)
    }

    if (order.razorpayOrderId !== body.razorpayOrderId) {
      throw badRequest('Razorpay order id mismatch')
    }
    if (
      !this.billing.verifyPaymentSignature({
        razorpayOrderId: body.razorpayOrderId,
        razorpayPaymentId: body.razorpayPaymentId,
        razorpaySignature: body.razorpaySignature,
      })
    ) {
      throw badRequest('Invalid payment signature')
    }

    assertTransition(order.state, 'paid')
    const paid = await this.repo.markPaid(order.id, body.razorpayPaymentId)
    await this.afterPaid(paid.id)
    return toSummary((await this.repo.getById(paid.id))!)
  }

  /** Print file → partner submit. Errors are logged; payment stays succeeded. */
  async afterPaid(orderId: string): Promise<void> {
    try {
      await this.printFiles.generateForOrder(orderId)
      await this.fulfillment.submitForOrder(orderId)
    } catch (error) {
      logger.error('post-payment fulfillment failed', error, { orderId })
    }
  }

  private async requireOwned(orderId: string, userId: string): Promise<OrderRow> {
    const order = await this.repo.getById(orderId)
    if (!order) throw notFound('Order not found')
    if (order.userId !== userId) throw forbidden()
    return order
  }
}

export const orderService = new OrderService()
