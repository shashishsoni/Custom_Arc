import { prisma } from '@customarc/db'

export type UploadRow = {
  id: string
  userId: string
  storageKey: string
  mimeType: string
  sizeBytes: number
  widthPx: number | null
  heightPx: number | null
  status: string
}

export const uploadsRepo = {
  create(input: {
    userId: string
    storageKey: string
    mimeType: string
    sizeBytes: number
    widthPx: number
    heightPx: number
  }): Promise<UploadRow> {
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
    }) as Promise<UploadRow>
  },

  getById(id: string): Promise<UploadRow | null> {
    return prisma.upload.findUnique({ where: { id } }) as Promise<UploadRow | null>
  },
}
