import { Elysia, t } from 'elysia'
import { confirmPaymentRequestSchema, ok } from '@customarc/shared'
import { API_ORDERS } from '@customarc/shared/constants'
import { withAuth } from '../auth/plugin.ts'
import { orderService } from './service.ts'

export const orderRoutes = new Elysia({ prefix: API_ORDERS })
  .use(withAuth)
  .post(
    '/',
    async ({ body, user }) => ok(await orderService.createFromCheckout({ userId: user.id, ...body })),
    {
      body: t.Object({
        designId: t.String({ minLength: 1 }),
        blankVariantId: t.String({ minLength: 1 }),
      }),
    },
  )
  .get('/:id', async ({ params, user }) => ok(await orderService.getForUser(params.id, user.id)))
  .post('/:id/checkout', async ({ params, user }) =>
    ok(await orderService.startCheckout(params.id, user.id)),
  )
  .post(
    '/:id/confirm',
    async ({ params, body, user }) => {
      const parsed = confirmPaymentRequestSchema.parse(body)
      return ok(await orderService.confirmPayment(params.id, user.id, parsed))
    },
    {
      body: t.Union([
        t.Object({
          mode: t.Literal('razorpay'),
          razorpayOrderId: t.String({ minLength: 1 }),
          razorpayPaymentId: t.String({ minLength: 1 }),
          razorpaySignature: t.String({ minLength: 1 }),
        }),
        t.Object({ mode: t.Literal('mock') }),
      ]),
    },
  )
