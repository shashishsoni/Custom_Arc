import { Elysia, t } from 'elysia'
import { ok } from '@customarc/shared'
import { withAuth } from '../auth/plugin.ts'
import { creditsService } from './service.ts'

/**
 * Balance is public to the signed-in user; spend is an internal operation invoked by
 * other modules (e.g. AI generation) with a correlationId. Exposed here for the
 * account page and for manual/integration testing.
 */
export const creditsRoutes = new Elysia({ prefix: '/credits' })
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
