import { prisma } from '@customarc/db'

export type FulfillmentOrder = {
  id: string
  userId: string
  state: string
  totalMinor: number
  currency: string
  partner: string | null
  partnerOrderId: string | null
  items: {
    id: string
    blankVariant: { partnerSku: string }
    printFile: {
      storageKey: string
      widthPx: number
      heightPx: number
      dpi: number
      format: string
    } | null
  }[]
}

export const fulfillmentRepo = {
  async getOrder(orderId: string): Promise<FulfillmentOrder | null> {
    return prisma.order.findUnique({
      where: { id: orderId },
      select: {
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
      },
    })
  },

  async markInProduction(
    orderId: string,
    partner: string,
    partnerOrderId: string,
  ): Promise<FulfillmentOrder> {
    return prisma.order.update({
      where: { id: orderId },
      data: { state: 'in_production', partner, partnerOrderId },
      select: {
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
      },
    })
  },
}
