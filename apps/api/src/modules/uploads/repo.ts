import type { Upload } from '@customarc/db'
import { prisma } from '@customarc/db'

export const uploadsRepo = {
  create(input: {
    userId: string
    storageKey: string
    mimeType: string
    sizeBytes: number
    widthPx: number
    heightPx: number
  }): Promise<Upload> {
    return prisma.upload.create({
      data: {
        userId: input.userId,
        storageKey: input.storageKey,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
        widthPx: input.widthPx,
        heightPx: input.heightPx,
        status: 'reencoded',
      },
    })
  },

  getById(id: string): Promise<Upload | null> {
    return prisma.upload.findUnique({ where: { id } })
  },
}
