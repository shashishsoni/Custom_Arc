import { Elysia, t } from 'elysia'
import { ok } from '@customarc/shared'
import { withAuth } from '../auth/plugin.ts'
import { designerService } from './service.ts'

export const designerRoutes = new Elysia({ prefix: '/designs' })
  .use(withAuth)
  .get('/', async ({ user }) => ok(await designerService.listForUser(user.id)))
  .get('/:id', async ({ params, user }) =>
    ok(await designerService.getByIdForUser(params.id, user.id)),
  )
  .post(
    '/',
    async ({ body, user }) => ok(await designerService.save({ userId: user.id, ...body })),
    {
      body: t.Object({
        blankId: t.String(),
        document: t.Unknown(),
        name: t.Optional(t.String()),
      }),
    },
  )
  .patch(
    '/:id',
    async ({ params, body, user }) =>
      ok(await designerService.updateForUser(params.id, user.id, body.document, body.name)),
    {
      body: t.Object({ document: t.Unknown(), name: t.Optional(t.String()) }),
    },
  )
