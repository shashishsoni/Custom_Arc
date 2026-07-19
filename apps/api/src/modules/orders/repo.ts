import type { OrderState } from '@customarc/shared'
import { prisma } from '@customarc/db'

export type OrderRow = {
  id: string
  userId: string
  state: OrderState
  totalMinor: number
  currency: string
  razorpayOrderId: string | null
  razorpayPaymentId: string | null
  createdAt: Date
  updatedAt: Date
}

export const ordersRepo = {
  async create(input: {
    userId: string
    totalMinor: number
    currency: string
    designId: string
    blankVariantId: string
    unitPriceMinor: number
  }): Promise<OrderRow> {
    return prisma.order.create({
      data: {
        userId: input.userId,
        totalMinor: input.totalMinor,
        currency: input.currency,
        state: 'designing',
        items: {
          create: {
            designId: input.designId,
            blankVariantId: input.blankVariantId,
            unitPriceMinor: input.unitPriceMinor,
          },
        },
      },
    }) as unknown as Promise<OrderRow>
  },

  async getById(id: string): Promise<OrderRow | null> {
    return prisma.order.findUnique({ where: { id } }) as unknown as Promise<OrderRow | null>
  },

  async setRazorpayOrderId(id: string, razorpayOrderId: string): Promise<OrderRow> {
    return prisma.order.update({
      where: { id },
      data: { razorpayOrderId },
    }) as unknown as Promise<OrderRow>
  },

  async markPaid(id: string, razorpayPaymentId: string | null): Promise<OrderRow> {
    return prisma.order.update({
      where: { id },
      data: { state: 'paid', razorpayPaymentId },
    }) as unknown as Promise<OrderRow>
  },

  async getByRazorpayOrderId(razorpayOrderId: string): Promise<OrderRow | null> {
    return prisma.order.findFirst({
      where: { razorpayOrderId },
    }) as unknown as Promise<OrderRow | null>
  },

  async getVariant(id: string) {
    return prisma.blankVariant.findUnique({
      where: { id },
      include: { blank: { select: { id: true, slug: true } } },
    })
  },
}
