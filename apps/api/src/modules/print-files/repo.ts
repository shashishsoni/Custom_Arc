import { prisma } from '@customarc/db'

export type PrintFileRow = {
  id: string
  orderItemId: string
  storageKey: string
  widthPx: number
  heightPx: number
  dpi: number
  format: string
  validated: boolean
  createdAt: Date
}

export type OrderItemForPrint = {
  id: string
  orderId: string
  designId: string
  design: {
    id: string
    userId: string
    blankId: string
    document: unknown
    blank: {
      id: string
      slug: string
      template: unknown
    }
  }
}

export const printFilesRepo = {
  async listOrderItems(orderId: string): Promise<OrderItemForPrint[]> {
    return prisma.orderItem.findMany({
      where: { orderId },
      include: {
        design: {
          include: {
            blank: { select: { id: true, slug: true, template: true } },
          },
        },
      },
    }) as Promise<OrderItemForPrint[]>
  },

  async listByOrderId(orderId: string): Promise<PrintFileRow[]> {
    return prisma.printFile.findMany({
      where: { orderItem: { orderId } },
      orderBy: { createdAt: 'asc' },
    }) as unknown as Promise<PrintFileRow[]>
  },

  async getById(id: string): Promise<(PrintFileRow & { orderItem: { order: { userId: string; id: string } } }) | null> {
    return prisma.printFile.findUnique({
      where: { id },
      include: { orderItem: { include: { order: { select: { userId: true, id: true } } } } },
    }) as unknown as Promise<
      (PrintFileRow & { orderItem: { order: { userId: string; id: string } } }) | null
    >
  },

  async upsertForItem(input: {
    orderItemId: string
    storageKey: string
    widthPx: number
    heightPx: number
    dpi: number
    format: string
  }): Promise<PrintFileRow> {
    return prisma.printFile.upsert({
      where: { orderItemId: input.orderItemId },
      create: {
        orderItemId: input.orderItemId,
        storageKey: input.storageKey,
        widthPx: input.widthPx,
        heightPx: input.heightPx,
        dpi: input.dpi,
        format: input.format,
        validated: true,
      },
      update: {
        storageKey: input.storageKey,
        widthPx: input.widthPx,
        heightPx: input.heightPx,
        dpi: input.dpi,
        format: input.format,
        validated: true,
      },
    }) as unknown as Promise<PrintFileRow>
  },
}
