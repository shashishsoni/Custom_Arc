import type { Order } from '@customarc/db'
import { prisma } from '@customarc/db'

/** Thin Prisma access — typed with Prisma `Order`, no casts. */
export const trackingRepo = {
  getById(id: string): Promise<Order | null> {
    return prisma.order.findUnique({ where: { id } })
  },

  getByPartnerOrderId(partnerOrderId: string): Promise<Order | null> {
    return prisma.order.findFirst({ where: { partnerOrderId } })
  },

  markShipped(
    id: string,
    input: { trackingNumber?: string; carrier?: string },
  ): Promise<Order> {
    return prisma.order.update({
      where: { id },
      data: {
        state: 'shipped',
        shippedAt: new Date(),
        ...(input.trackingNumber ? { trackingNumber: input.trackingNumber } : {}),
        ...(input.carrier ? { carrier: input.carrier } : {}),
      },
    })
  },

  markDelivered(id: string): Promise<Order> {
    return prisma.order.update({
      where: { id },
      data: {
        state: 'delivered',
        deliveredAt: new Date(),
      },
    })
  },
}
