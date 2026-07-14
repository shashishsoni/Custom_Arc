import { Elysia } from 'elysia'
import { err } from '@customarc/shared'
import { env } from './env.ts'
import { logger } from './logger.ts'
import { ApiError } from './errors.ts'
import { catalogRoutes } from './modules/catalog/routes.ts'
import { designerRoutes } from './modules/designer/routes.ts'
import { creditsRoutes } from './modules/credits/routes.ts'
import { leadRoutes } from './modules/leads/routes.ts'

/** The composed API. Routes are thin adapters over module services; errors map to one envelope. */
export const app = new Elysia()
  .use(catalogRoutes)
  .use(designerRoutes)
  .use(creditsRoutes)
  .use(leadRoutes)
  .get('/health', () => ({ status: 'ok', service: 'customarc-api', env: env.logLevel }))
  .onError(({ code, error, set }) => {
    if (error instanceof ApiError) {
      set.status = error.statusCode
      return err(error.message, error.details)
    }
    if (code === 'VALIDATION') {
      set.status = 400
      return err('Validation failed', error.message)
    }
    logger.error('unhandled error', error)
    set.status = 500
    return err('Internal server error')
  })
