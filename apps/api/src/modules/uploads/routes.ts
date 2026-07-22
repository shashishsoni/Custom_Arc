import { Elysia, t } from 'elysia'
import { ok, uploadCreateMetaSchema } from '@customarc/shared'
import { API_UPLOADS } from '@customarc/shared/constants'
import { badRequest, unauthorized } from '../../errors.ts'
import { withAuth } from '../auth/plugin.ts'
import { uploadsService } from './service.ts'
import { verifyUploadAccess } from './sign.ts'

function requireUploadFile(body: object): File {
  if (!('file' in body) || !(body.file instanceof File)) throw badRequest('file is required')
  return body.file
}

/** Content is HMAC-signed (no session). Create requires auth. */
export const uploadRoutes = new Elysia({ prefix: API_UPLOADS })
  .get(
    '/:id/content',
    async ({ params, query }) => {
      const exp = Number(query.exp)
      const sig = String(query.sig ?? '')
      if (!Number.isFinite(exp) || !verifyUploadAccess(params.id, exp, sig)) {
        throw unauthorized('Invalid or expired upload URL')
      }
      const { body, contentType } = await uploadsService.readContent(params.id)
      return new Response(new Uint8Array(body), {
        headers: {
          'content-type': contentType,
          'cache-control': 'private, max-age=300',
          'access-control-allow-origin': '*',
        },
      })
    },
    {
      query: t.Object({
        exp: t.String(),
        sig: t.String(),
      }),
    },
  )
  .use(withAuth)
  .post(
    '/',
    async ({ body, user }) => {
      if (typeof body !== 'object' || body === null) throw badRequest('Invalid body')
      const file = requireUploadFile(body)
      const meta = uploadCreateMetaSchema.parse(body)
      return ok(await uploadsService.createForUser(user.id, file, meta))
    },
    {
      body: t.Object({
        file: t.File({ type: ['image/jpeg', 'image/png', 'image/webp'], maxSize: '8m' }),
        category: t.Union([t.Literal('mug'), t.Literal('phone_case')]),
        productSlug: t.String({ minLength: 1 }),
      }),
    },
  )
