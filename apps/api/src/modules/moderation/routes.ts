import { Elysia, t } from 'elysia'
import { ok } from '@customarc/shared'
import { API_MODERATION } from '@customarc/shared/constants'
import { withAuth } from '../auth/plugin.ts'
import { moderationService } from './service.ts'

export const moderationRoutes = new Elysia({ prefix: API_MODERATION })
  .use(withAuth)
  .post(
    '/prompts',
    async ({ body }) => {
      const verdict = await moderationService.reviewPrompt(body.prompt)
      return ok({ verdict })
    },
    { body: t.Object({ prompt: t.String({ minLength: 1 }) }) },
  )
  .get('/designs/:id/gate', async ({ params, user }) =>
    ok(await moderationService.checkPrintGateForUser(params.id, user.id)),
  )
  .post(
    '/flags/:id/review',
    async ({ params, body, user }) =>
      ok(await moderationService.reviewFlag(params.id, user.id, body.verdict)),
    {
      body: t.Object({
        verdict: t.Union([t.Literal('approved'), t.Literal('blocked'), t.Literal('flagged')]),
      }),
    },
  )
