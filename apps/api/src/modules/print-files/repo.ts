import type { PrintFile, Prisma } from '@customarc/db'
import { prisma } from '@customarc/db'

const orderItemForPrint = {
  include: {
    design: {
      include: {
        blank: { select: { id: true, slug: true, template: true } },
      },
    },
  },
} satisfies Prisma.OrderItemDefaultArgs

export type OrderItemForPrint = Prisma.OrderItemGetPayload<typeof orderItemForPrint>

const printFileWithOwner = {
  include: {
    orderItem: { include: { order: { select: { userId: true, id: true } } } },
  },
} satisfies Prisma.PrintFileDefaultArgs

export type PrintFileWithOwner = Prisma.PrintFileGetPayload<typeof printFileWithOwner>

export const printFilesRepo = {
  listOrderItems(orderId: string): Promise<OrderItemForPrint[]> {
    return prisma.orderItem.findMany({
      where: { orderId },
      ...orderItemForPrint,
    })
  },

  listByOrderId(orderId: string): Promise<PrintFile[]> {
    return prisma.printFile.findMany({
      where: { orderItem: { orderId } },
      orderBy: { createdAt: 'asc' },
    })
  },

  getById(id: string): Promise<PrintFileWithOwner | null> {
    return prisma.printFile.findUnique({
      where: { id },
      ...printFileWithOwner,
    })
  },

  upsertForItem(input: {
    orderItemId: string
    storageKey: string
    widthPx: number
    heightPx: number
    dpi: number
    format: string
    validated: boolean
  }): Promise<PrintFile> {
    return prisma.printFile.upsert({
      where: { orderItemId: input.orderItemId },
      create: {
        orderItemId: input.orderItemId,
        storageKey: input.storageKey,
        widthPx: input.widthPx,
        heightPx: input.heightPx,
        dpi: input.dpi,
        format: input.format,
        validated: input.validated,
      },
      update: {
        storageKey: input.storageKey,
        widthPx: input.widthPx,
        heightPx: input.heightPx,
        dpi: input.dpi,
        format: input.format,
        validated: input.validated,
      },
    })
  },
}
