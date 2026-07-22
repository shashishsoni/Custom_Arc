import { Elysia } from 'elysia'
import { ok, reviewFlagRequestSchema, reviewPromptRequestSchema } from '@customarc/shared'
import { API_MODERATION } from '@customarc/shared/constants'
import { withAuth } from '../auth/plugin.ts'
import { moderationService } from './service.ts'

export const moderationRoutes = new Elysia({ prefix: API_MODERATION })
  .use(withAuth)
  .post('/prompts', async ({ body }) => {
    const { prompt } = reviewPromptRequestSchema.parse(body)
    const verdict = await moderationService.reviewPrompt(prompt)
    return ok({ verdict })
  })
  .get('/designs/:id/gate', async ({ params, user }) =>
    ok(await moderationService.checkPrintGateForUser(params.id, user.id)),
  )
  .post('/flags/:id/review', async ({ params, body, user }) => {
    const { verdict } = reviewFlagRequestSchema.parse(body)
    return ok(await moderationService.reviewFlag(params.id, user.id, verdict))
  })
