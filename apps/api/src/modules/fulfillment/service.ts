import { badRequest, forbidden, notFound } from '../../errors.ts'
import { logger } from '../../logger.ts'
import { assertTransition } from '../orders/transitions.ts'
import { printPartner, type PartnerSubmitResult } from './partner.ts'
import { fulfillmentRepo, type FulfillmentOrder } from './repo.ts'

/** Sandbox shipping — real address capture is a later checkout step. */
const SANDBOX_SHIPPING = {
  name: 'CustomArc Sandbox',
  line1: '1 Proof Lane',
  city: 'Mumbai',
  postalCode: '400001',
  country: 'IN',
}

export type FulfillmentSummary = {
  orderId: string
  state: string
  partner: string
  partnerOrderId: string
  mode: 'sandbox' | 'live'
}

/** Issue 17 — submit print files to the print partner (sandbox for first proof). */
export class FulfillmentService {
  constructor(
    private readonly repo = fulfillmentRepo,
    private readonly partner = printPartner,
  ) {}

  async submitForOrder(orderId: string): Promise<FulfillmentSummary> {
    const order = await this.repo.getOrder(orderId)
    if (!order) throw notFound('Order not found')
    return this.submit(order)
  }

  async submitForOwnedOrder(orderId: string, userId: string): Promise<FulfillmentSummary> {
    const order = await this.repo.getOrder(orderId)
    if (!order) throw notFound('Order not found')
    if (order.userId !== userId) throw forbidden()
    return this.submit(order)
  }

  private async submit(order: FulfillmentOrder): Promise<FulfillmentSummary> {
    if (order.partnerOrderId && order.partner) {
      return {
        orderId: order.id,
        state: order.state,
        partner: order.partner,
        partnerOrderId: order.partnerOrderId,
        mode: order.partnerOrderId.startsWith('sandbox_') ? 'sandbox' : 'live',
      }
    }

    if (order.state !== 'paid' && order.state !== 'in_production') {
      throw badRequest('Order must be paid before partner submit')
    }

    const items = order.items
      .map((item) => {
        if (!item.printFile) return null
        return {
          partnerSku: item.blankVariant.partnerSku,
          storageKey: item.printFile.storageKey,
          widthPx: item.printFile.widthPx,
          heightPx: item.printFile.heightPx,
          dpi: item.printFile.dpi,
          format: item.printFile.format,
        }
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)

    if (items.length === 0) throw badRequest('No print files to submit')

    const result: PartnerSubmitResult = await this.partner.submitOrder({
      orderId: order.id,
      currency: order.currency,
      totalMinor: order.totalMinor,
      items,
      shipping: SANDBOX_SHIPPING,
    })

    if (order.state === 'paid') {
      assertTransition('paid', 'in_production')
    }

    const updated = await this.repo.markInProduction(
      order.id,
      result.partner,
      result.partnerOrderId,
    )

    logger.info('order sent to partner', {
      orderId: order.id,
      partner: result.partner,
      partnerOrderId: result.partnerOrderId,
      mode: result.mode,
    })

    return {
      orderId: updated.id,
      state: updated.state,
      partner: result.partner,
      partnerOrderId: result.partnerOrderId,
      mode: result.mode,
    }
  }
}

export const fulfillmentService = new FulfillmentService()
