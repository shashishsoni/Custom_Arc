import { Elysia } from 'elysia'
import { confirmPaymentRequestSchema, createOrderRequestSchema, ok } from '@customarc/shared'
import { API_ORDERS } from '@customarc/shared/constants'
import { withAuth } from '../auth/plugin.ts'
import { fulfillmentService } from '../fulfillment/service.ts'
import { printFilesService } from '../print-files/service.ts'
import { orderService } from './service.ts'

export const orderRoutes = new Elysia({ prefix: API_ORDERS })
  .use(withAuth)
  .post('/', async ({ body, user }) => {
    const parsed = createOrderRequestSchema.parse(body)
    return ok(await orderService.createFromCheckout({ userId: user.id, ...parsed }))
  })
  .get('/:id', async ({ params, user }) => ok(await orderService.getForUser(params.id, user.id)))
  .post('/:id/checkout', async ({ params, user }) =>
    ok(await orderService.startCheckout(params.id, user.id)),
  )
  .post('/:id/confirm', async ({ params, body, user }) => {
    const parsed = confirmPaymentRequestSchema.parse(body)
    return ok(await orderService.confirmPayment(params.id, user.id, parsed))
  })
  .get('/:id/print-files', async ({ params, user }) =>
    ok(await printFilesService.listForOwnedOrder(params.id, user.id)),
  )
  .post('/:id/print-files', async ({ params, user }) =>
    ok(await printFilesService.generateForOwnedOrder(params.id, user.id)),
  )
  .post('/:id/fulfill', async ({ params, user }) =>
    ok(await fulfillmentService.submitForOwnedOrder(params.id, user.id)),
  )
