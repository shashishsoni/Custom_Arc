import type { Order } from '@customarc/db'
import type { OrderState } from '@customarc/shared'
import {
  FULFILLMENT_WEBHOOK_SECRET,
  IS_DEVELOPMENT,
  PRINT_PARTNER_SANDBOX,
} from '@customarc/shared/constants'
import { badRequest, forbidden, notFound, unauthorized } from '../../errors.ts'
import { logger } from '../../logger.ts'
import { assertTransition } from '../orders/transitions.ts'
import { trackingRepo } from './repo.ts'

export type PartnerTrackingEvent = {
  event: 'shipped' | 'delivered'
  partnerOrderId: string
  trackingNumber?: string
  carrier?: string
}

export type OrderTrackingStatus = {
  id: string
  state: OrderState
  totalMinor: number
  currency: string
  partner: string | null
  partnerOrderId: string | null
  trackingNumber: string | null
  carrier: string | null
  shippedAt: string | null
  deliveredAt: string | null
  updatedAt: string
}

/** Issue 18 — partner shipment callbacks → order status for the status page. */
export class TrackingService {
  constructor(private readonly repo = trackingRepo) {}

  async getForUser(orderId: string, userId: string): Promise<OrderTrackingStatus> {
    const order = await this.repo.getById(orderId)
    if (!order) throw notFound('Order not found')
    if (order.userId !== userId) throw forbidden()
    return toStatus(order)
  }

  /** Partner webhook (sandbox or live). Auth via shared secret when configured. */
  async applyPartnerEvent(
    event: PartnerTrackingEvent,
    secretHeader: string,
  ): Promise<OrderTrackingStatus> {
    assertWebhookSecret(secretHeader)

    const order = await this.repo.getByPartnerOrderId(event.partnerOrderId)
    if (!order) throw notFound('Order not found for partner order id')
    return this.applyEvent(order, event)
  }

  /** Owner-only sandbox helper to advance status without a real partner. */
  async sandboxAdvance(orderId: string, userId: string): Promise<OrderTrackingStatus> {
    if (!PRINT_PARTNER_SANDBOX) throw badRequest('Sandbox advance only when partner key unset')
    const order = await this.repo.getById(orderId)
    if (!order) throw notFound('Order not found')
    if (order.userId !== userId) throw forbidden()
    if (!order.partnerOrderId) throw badRequest('Order has no partner submit yet')

    if (order.state === 'in_production') {
      return this.applyEvent(order, {
        event: 'shipped',
        partnerOrderId: order.partnerOrderId,
        trackingNumber: `SBX-${order.id.slice(-6).toUpperCase()}`,
        carrier: 'sandbox',
      })
    }
    if (order.state === 'shipped') {
      return this.applyEvent(order, {
        event: 'delivered',
        partnerOrderId: order.partnerOrderId,
      })
    }
    throw badRequest(`Cannot advance from state ${order.state}`)
  }

  private async applyEvent(order: Order, event: PartnerTrackingEvent): Promise<OrderTrackingStatus> {
    if (event.event === 'shipped') {
      if (order.state === 'shipped' || order.state === 'delivered') return toStatus(order)
      assertTransition(order.state, 'shipped')
      const updated = await this.repo.markShipped(order.id, {
        trackingNumber: event.trackingNumber ?? `TRK-${order.id.slice(-8).toUpperCase()}`,
        carrier: event.carrier ?? order.partner ?? 'sandbox',
      })
      logger.info('order shipped', {
        orderId: order.id,
        partnerOrderId: event.partnerOrderId,
        trackingNumber: updated.trackingNumber,
      })
      return toStatus(updated)
    }

    if (order.state === 'delivered') return toStatus(order)
    let current = order
    if (current.state === 'in_production') {
      assertTransition(current.state, 'shipped')
      current = await this.repo.markShipped(current.id, {
        trackingNumber: event.trackingNumber ?? `TRK-${current.id.slice(-8).toUpperCase()}`,
        carrier: event.carrier ?? current.partner ?? 'sandbox',
      })
    }
    assertTransition(current.state, 'delivered')
    const delivered = await this.repo.markDelivered(current.id)
    logger.info('order delivered', { orderId: order.id, partnerOrderId: event.partnerOrderId })
    return toStatus(delivered)
  }
}

function assertWebhookSecret(header: string): void {
  const expected = FULFILLMENT_WEBHOOK_SECRET
  if (expected) {
    if (header !== expected) throw unauthorized('Invalid fulfillment webhook secret')
    return
  }
  if (!IS_DEVELOPMENT && !PRINT_PARTNER_SANDBOX) {
    throw unauthorized('Fulfillment webhook secret not configured')
  }
}

function toStatus(row: Order): OrderTrackingStatus {
  return {
    id: row.id,
    state: row.state,
    totalMinor: row.totalMinor,
    currency: row.currency,
    partner: row.partner,
    partnerOrderId: row.partnerOrderId,
    trackingNumber: row.trackingNumber,
    carrier: row.carrier,
    shippedAt: row.shippedAt?.toISOString() ?? null,
    deliveredAt: row.deliveredAt?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString(),
  }
}

export const trackingService = new TrackingService()
