import type { Order } from '@customarc/db'
import { prisma } from '@customarc/db'

export const ordersRepo = {
  create(input: {
    userId: string
    totalMinor: number
    currency: string
    designId: string
    blankVariantId: string
    unitPriceMinor: number
  }): Promise<Order> {
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
    })
  },

  getById(id: string): Promise<Order | null> {
    return prisma.order.findUnique({ where: { id } })
  },

  setRazorpayOrderId(id: string, razorpayOrderId: string): Promise<Order> {
    return prisma.order.update({
      where: { id },
      data: { razorpayOrderId },
    })
  },

  markPaid(id: string, razorpayPaymentId: string | null): Promise<Order> {
    return prisma.order.update({
      where: { id },
      data: { state: 'paid', razorpayPaymentId },
    })
  },

  getByRazorpayOrderId(razorpayOrderId: string): Promise<Order | null> {
    return prisma.order.findFirst({ where: { razorpayOrderId } })
  },

  getVariant(id: string): Promise<{
    id: string
    blankId: string
    name: string
    partnerSku: string
    priceMinor: number
    currency: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    blank: { id: string; slug: string }
  } | null> {
    return prisma.blankVariant.findUnique({
      where: { id },
      include: { blank: { select: { id: true, slug: true } } },
    })
  },
}
