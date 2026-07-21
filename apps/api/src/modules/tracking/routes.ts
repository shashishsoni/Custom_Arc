import { Elysia, t } from 'elysia'
import { ok } from '@customarc/shared'
import { API_FULFILLMENT, API_ORDERS } from '@customarc/shared/constants'
import { withAuth } from '../auth/plugin.ts'
import { trackingService } from './service.ts'

/** Authenticated order status (issue 18 status page). */
export const orderTrackingRoutes = new Elysia({ prefix: API_ORDERS })
  .use(withAuth)
  .get('/:id/tracking', async ({ params, user }) =>
    ok(await trackingService.getForUser(params.id, user.id)),
  )
  .post('/:id/tracking/advance', async ({ params, user }) =>
    ok(await trackingService.sandboxAdvance(params.id, user.id)),
  )

/**
 * Partner callbacks — no user session.
 * Header: `x-fulfillment-secret` when FULFILLMENT_WEBHOOK_SECRET is set.
 */
export const fulfillmentWebhookRoutes = new Elysia({ prefix: API_FULFILLMENT }).post(
  '/webhook',
  async ({ request, body }) => {
    const secret = request.headers.get('x-fulfillment-secret') ?? ''
    return ok(await trackingService.applyPartnerEvent(body, secret))
  },
  {
    body: t.Object({
      event: t.Union([t.Literal('shipped'), t.Literal('delivered')]),
      partnerOrderId: t.String({ minLength: 1 }),
      trackingNumber: t.Optional(t.String()),
      carrier: t.Optional(t.String()),
    }),
  },
)
