import { Elysia, t } from 'elysia'
import { ok } from '@customarc/shared'
import { API_AI } from '@customarc/shared/constants'
import { withAuth } from '../auth/plugin.ts'
import { aiService } from './service.ts'

export const aiRoutes = new Elysia({ prefix: API_AI })
  .use(withAuth)
  .post(
    '/generate',
    async ({ body, user }) =>
      ok(
        await aiService.generateFromPrompt({
          userId: user.id,
          designId: body.designId,
          prompt: body.prompt,
        }),
      ),
    {
      body: t.Object({
        designId: t.String({ minLength: 1 }),
        prompt: t.String({ minLength: 1, maxLength: 1000 }),
      }),
    },
  )
