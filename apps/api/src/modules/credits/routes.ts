import { Elysia, t } from 'elysia'
import { creditConfirmRequestSchema, ok } from '@customarc/shared'
import { API_CREDITS } from '@customarc/shared/constants'
import { withAuth } from '../auth/plugin.ts'
import { creditsService } from './service.ts'

/**
 * Balance is public to the signed-in user; spend is an internal operation invoked by
 * other modules (e.g. AI generation) with a correlationId. Pack checkout mirrors product
 * Razorpay / mock confirm (issue 14).
 */
export const creditsRoutes = new Elysia({ prefix: API_CREDITS })
  .get('/packs', () => ok(creditsService.listPacks()))
  .use(withAuth)
  .get('/balance', async ({ user }) => ok(await creditsService.getBalance(user.id)))
  .post(
    '/spend',
    async ({ body, user }) => ok(await creditsService.spend({ userId: user.id, ...body })),
    {
      body: t.Object({
        correlationId: t.String(),
        amount: t.Integer({ minimum: 1 }),
        reason: t.String(),
      }),
    },
  )
  .post(
    '/checkout',
    async ({ body, user }) => ok(await creditsService.startPackCheckout(user.id, body.packId)),
    { body: t.Object({ packId: t.String() }) },
  )
  .post('/confirm', async ({ body, user }) =>
    ok(await creditsService.confirmPackPurchase(user.id, creditConfirmRequestSchema.parse(body))),
  )
