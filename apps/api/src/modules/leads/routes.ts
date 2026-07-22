import { Elysia } from 'elysia'
import { bulkLeadRequestSchema, ok } from '@customarc/shared'
import { API_LEADS } from '@customarc/shared/constants'
import { leadService } from './service.ts'

export const leadRoutes = new Elysia({ prefix: API_LEADS }).post('/bulk', async ({ body }) => {
  const parsed = bulkLeadRequestSchema.parse(body)
  return ok(await leadService.capture(parsed))
})
