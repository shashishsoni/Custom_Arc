import type { Prisma } from '@customarc/db'
import { prisma } from '@customarc/db'

const fulfillmentSelect = {
  id: true,
  userId: true,
  state: true,
  totalMinor: true,
  currency: true,
  partner: true,
  partnerOrderId: true,
  items: {
    select: {
      id: true,
      blankVariant: { select: { partnerSku: true } },
      printFile: {
        select: {
          storageKey: true,
          widthPx: true,
          heightPx: true,
          dpi: true,
          format: true,
        },
      },
    },
  },
} satisfies Prisma.OrderSelect

export type FulfillmentOrder = Prisma.OrderGetPayload<{ select: typeof fulfillmentSelect }>

export const fulfillmentRepo = {
  getOrder(orderId: string): Promise<FulfillmentOrder | null> {
    return prisma.order.findUnique({
      where: { id: orderId },
      select: fulfillmentSelect,
    })
  },

  markInProduction(
    orderId: string,
    partner: string,
    partnerOrderId: string,
  ): Promise<FulfillmentOrder> {
    return prisma.order.update({
      where: { id: orderId },
      data: { state: 'in_production', partner, partnerOrderId },
      select: fulfillmentSelect,
    })
  },
}
