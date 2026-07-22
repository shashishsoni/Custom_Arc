import { Elysia } from 'elysia'
import {
  creditCheckoutRequestSchema,
  creditConfirmRequestSchema,
  ok,
  spendCreditsRequestSchema,
} from '@customarc/shared'
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
  .post('/spend', async ({ body, user }) => {
    const parsed = spendCreditsRequestSchema.parse(body)
    return ok(await creditsService.spend({ userId: user.id, ...parsed }))
  })
  .post('/checkout', async ({ body, user }) => {
    const { packId } = creditCheckoutRequestSchema.parse(body)
    return ok(await creditsService.startPackCheckout(user.id, packId))
  })
  .post('/confirm', async ({ body, user }) =>
    ok(await creditsService.confirmPackPurchase(user.id, creditConfirmRequestSchema.parse(body))),
  )
