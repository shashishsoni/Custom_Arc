import { Elysia, t } from 'elysia'
import { ok } from '@customarc/shared'
import { unauthorized } from '../../errors.ts'
import { creditsService } from './service.ts'

/**
 * Balance is public to the signed-in user; spend is an internal operation invoked by
 * other modules (e.g. AI generation) with a correlationId. Exposed here for the
 * account page and for manual/integration testing.
 */
export const creditsRoutes = new Elysia({ prefix: '/credits' })
  .get('/balance', async ({ headers }) => {
    const userId = requireUser(headers)
    return ok(await creditsService.getBalance(userId))
  })
  .post(
    '/spend',
    async ({ body, headers }) => {
      const userId = requireUser(headers)
      const result = await creditsService.spend({ userId, ...body })
      return ok(result)
    },
    {
      body: t.Object({
        correlationId: t.String(),
        amount: t.Integer({ minimum: 1 }),
        reason: t.String(),
      }),
    },
  )

function requireUser(headers: Record<string, string | undefined>): string {
  const userId = headers['x-user-id']
  if (!userId) throw unauthorized()
  return userId
}
