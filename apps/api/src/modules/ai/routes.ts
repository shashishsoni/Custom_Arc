import { Elysia } from 'elysia'
import { generationRequestSchema, ok } from '@customarc/shared'
import { API_AI } from '@customarc/shared/constants'
import { withAuth } from '../auth/plugin.ts'
import { aiService } from './service.ts'

export const aiRoutes = new Elysia({ prefix: API_AI })
  .use(withAuth)
  .post('/generate', async ({ body, user }) => {
    const parsed = generationRequestSchema.parse(body)
    return ok(
      await aiService.generateFromPrompt({
        userId: user.id,
        designId: parsed.designId,
        prompt: parsed.prompt,
      }),
    )
  })
