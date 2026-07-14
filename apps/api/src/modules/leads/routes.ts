import { Elysia, t } from 'elysia'
import { ok } from '@customarc/shared'
import { leadService } from './service.ts'

export const leadRoutes = new Elysia({ prefix: '/leads' }).post(
  '/bulk',
  async ({ body }) => ok(await leadService.capture(body)),
  { body: t.Object({ email: t.String({ format: 'email' }), note: t.String({ minLength: 1 }) }) },
)
