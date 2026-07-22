import { Elysia } from 'elysia'
import { ok, saveDesignRequestSchema, updateDesignRequestSchema } from '@customarc/shared'
import { API_DESIGNS } from '@customarc/shared/constants'
import { withAuth } from '../auth/plugin.ts'
import { designerService } from './service.ts'

export const designerRoutes = new Elysia({ prefix: API_DESIGNS })
  .use(withAuth)
  .get('/', async ({ user }) => ok(await designerService.listForUser(user.id)))
  .get('/:id', async ({ params, user }) =>
    ok(await designerService.getByIdForUser(params.id, user.id)),
  )
  .post('/', async ({ body, user }) => {
    const parsed = saveDesignRequestSchema.parse(body)
    return ok(await designerService.save({ userId: user.id, ...parsed }))
  })
  .patch('/:id', async ({ params, body, user }) => {
    const parsed = updateDesignRequestSchema.parse(body)
    return ok(await designerService.updateForUser(params.id, user.id, parsed))
  })
