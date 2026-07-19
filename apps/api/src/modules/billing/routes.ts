import { Elysia } from 'elysia'
import { ok } from '@customarc/shared'
import { API_BILLING } from '@customarc/shared/constants'
import { badRequest } from '../../errors.ts'
import { billingService } from './service.ts'
import { ordersRepo } from '../orders/repo.ts'
import { assertTransition } from '../orders/service.ts'

/**
 * Razorpay webhooks are a settlement source of truth for async payment events.
 * Browser `POST /orders/:id/confirm` covers the happy path.
 */
export const billingRoutes = new Elysia({ prefix: API_BILLING }).post('/webhook', async ({ request }) => {
  const raw = await request.text()
  const signature = request.headers.get('x-razorpay-signature') ?? ''
  if (!billingService.verifyWebhookSignature(raw, signature)) {
    throw badRequest('Invalid webhook signature')
  }

  const event = JSON.parse(raw) as {
    event?: string
    payload?: { payment?: { entity?: { order_id?: string; id?: string } } }
  }

  if (event.event === 'payment.captured') {
    const rzOrderId = event.payload?.payment?.entity?.order_id
    const paymentId = event.payload?.payment?.entity?.id
    if (rzOrderId && paymentId) {
      const order = await ordersRepo.getByRazorpayOrderId(rzOrderId)
      if (order?.state === 'designing') {
        assertTransition(order.state, 'paid')
        await ordersRepo.markPaid(order.id, paymentId)
      }
    }
  }

  return ok({ received: true })
})
