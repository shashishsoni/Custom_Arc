import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { err } from '@customarc/shared'
import { WEB_BASE_URL, LOG_LEVEL, API_HEALTH } from '@customarc/shared/constants'
import { logger } from './logger.ts'
import { ApiError } from './errors.ts'
import { authPlugin } from './modules/auth/plugin.ts'
import { catalogRoutes } from './modules/catalog/routes.ts'
import { designerRoutes } from './modules/designer/routes.ts'
import { creditsRoutes } from './modules/credits/routes.ts'
import { leadRoutes } from './modules/leads/routes.ts'
import { uploadRoutes } from './modules/uploads/routes.ts'
import { orderRoutes } from './modules/orders/routes.ts'
import { billingRoutes } from './modules/billing/routes.ts'
import { printFileRoutes } from './modules/print-files/routes.ts'

/** The composed API. Routes are thin adapters over module services; errors map to one envelope. */
export const app = new Elysia()
  .use(
    cors({
      origin: WEB_BASE_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  )
  .use(authPlugin)
  .use(catalogRoutes)
  .use(designerRoutes)
  .use(creditsRoutes)
  .use(leadRoutes)
  .use(uploadRoutes)
  .use(orderRoutes)
  .use(billingRoutes)
  .use(printFileRoutes)
  .get(API_HEALTH, () => ({ status: 'ok', service: 'customarc-api', env: LOG_LEVEL }))
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
