import { Elysia } from 'elysia'
import { ok } from '@customarc/shared'
import { API_PRINT_FILES } from '@customarc/shared/constants'
import { withAuth } from '../auth/plugin.ts'
import { printFilesService } from './service.ts'

/** Authenticated download of a generated print PNG (owner only). */
export const printFileRoutes = new Elysia({ prefix: API_PRINT_FILES })
  .use(withAuth)
  .get('/:id/content', async ({ params, user }) => {
    const { body, contentType } = await printFilesService.readContentForUser(params.id, user.id)
    return new Response(new Uint8Array(body), {
      headers: {
        'content-type': contentType,
        'cache-control': 'private, max-age=60',
        'content-disposition': `inline; filename="print-${params.id}.png"`,
      },
    })
  })
