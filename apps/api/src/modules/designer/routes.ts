import { Elysia, t } from 'elysia'
import { ok } from '@customarc/shared'
import { unauthorized } from '../../errors.ts'
import { designerService } from './service.ts'

export const designerRoutes = new Elysia({ prefix: '/designs' })
  .get('/', async ({ headers }) => ok(await designerService.listForUser(requireUser(headers))))
  .get('/:id', async ({ params, headers }) =>
    ok(await designerService.getByIdForUser(params.id, requireUser(headers))),
  )
  .post(
    '/',
    async ({ body, headers }) =>
      ok(await designerService.save({ userId: requireUser(headers), ...body })),
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
    async ({ params, body, headers }) =>
      ok(
        await designerService.updateForUser(
          params.id,
          requireUser(headers),
          body.document,
          body.name,
        ),
      ),
    {
      body: t.Object({ document: t.Unknown(), name: t.Optional(t.String()) }),
    },
  )

function requireUser(headers: Record<string, string | undefined>): string {
  const userId = headers['x-user-id']
  if (!userId) throw unauthorized()
  return userId
}
