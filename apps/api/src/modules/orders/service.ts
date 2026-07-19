import type { CheckoutSession, ConfirmPaymentRequest, OrderSummary } from '@customarc/shared'
import { badRequest, conflict, forbidden, notFound } from '../../errors.ts'
import { billingService } from '../billing/service.ts'
import { designerService } from '../designer/service.ts'
import { ordersRepo, type OrderRow } from './repo.ts'

export type OrderState = OrderSummary['state']

const LEGAL: Record<OrderState, OrderState[]> = {
  designing: ['paid', 'cancelled'],
  paid: ['in_production', 'cancelled'],
  in_production: ['shipped'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
}

export function assertTransition(from: OrderState, to: OrderState): void {
  if (!LEGAL[from].includes(to)) {
    throw conflict(`Illegal order transition: ${from} → ${to}`)
  }
}

function toSummary(row: OrderRow): OrderSummary {
  return {
    id: row.id,
    state: row.state,
    totalMinor: row.totalMinor,
    currency: row.currency,
    razorpayOrderId: row.razorpayOrderId,
  }
}

/** Checkout for a saved design (issue 14/16). AI generation is not required. */
export class OrderService {
  constructor(
    private readonly repo = ordersRepo,
    private readonly billing = billingService,
    private readonly designs = designerService,
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
    if (order.state === 'paid') return toSummary(order)
    if (order.state !== 'designing') throw badRequest('Order cannot be paid in this state')

    if (body.mode === 'mock') {
      if (!order.razorpayOrderId?.startsWith('mock_')) {
        throw badRequest('Mock confirm only allowed for mock checkout sessions')
      }
      assertTransition(order.state, 'paid')
      return toSummary(await this.repo.markPaid(order.id, `mock_pay_${order.id}`))
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
    return toSummary(await this.repo.markPaid(order.id, body.razorpayPaymentId))
  }

  private async requireOwned(orderId: string, userId: string): Promise<OrderRow> {
    const order = await this.repo.getById(orderId)
    if (!order) throw notFound('Order not found')
    if (order.userId !== userId) throw forbidden()
    return order
  }
}

export const orderService = new OrderService()
