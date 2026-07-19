import { Elysia, t } from 'elysia'
import { ok } from '@customarc/shared'
import { API_CATALOG } from '@customarc/shared/constants'
import { catalogService } from './service.ts'

/** Thin HTTP adapter over the service. No business logic here. */
export const catalogRoutes = new Elysia({ prefix: API_CATALOG })
  .get('/blanks', async () => ok(await catalogService.list()))
  .get(
    '/blanks/:slug',
    async ({ params }) => ok(await catalogService.getBySlug(params.slug)),
    { params: t.Object({ slug: t.String() }) },
  )
