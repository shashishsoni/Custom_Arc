import type { UploadCreateMeta, UploadResult } from '@customarc/shared'
import { notFound } from '../../errors.ts'
import { moderationService } from '../moderation/service.ts'
import { reencodeUpload } from './reencode.ts'
import { uploadsRepo } from './repo.ts'
import { signedPreviewUrl } from './sign.ts'
import { buildUploadObjectKey, putUploadObject, readUploadObject } from './storage.ts'

export class UploadsService {
  constructor(private readonly repo = uploadsRepo) {}

  async createForUser(
    userId: string,
    file: File,
    ctx: UploadCreateMeta,
  ): Promise<UploadResult> {
    const image = await reencodeUpload(file)
    const imageType = image.mimeType.split('/')[1] ?? 'jpeg'
    const key = buildUploadObjectKey({
      category: ctx.category,
      productSlug: ctx.productSlug,
      originalFileName: file.name || 'image.jpg',
      imageType: imageType === 'jpeg' ? 'jpg' : imageType,
    })
    const storageKey = await putUploadObject(key, image.buffer, image.mimeType)
    const row = await this.repo.create({
      userId,
      storageKey,
      mimeType: image.mimeType,
      sizeBytes: image.buffer.byteLength,
      widthPx: image.widthPx,
      heightPx: image.heightPx,
    })

    await moderationService.reviewUpload(row.id)

    return {
      id: row.id,
      previewUrl: signedPreviewUrl(row.id),
      mimeType: row.mimeType,
      widthPx: image.widthPx,
      heightPx: image.heightPx,
      sizeBytes: row.sizeBytes,
    }
  }

  async readContent(uploadId: string): Promise<{ body: Buffer; contentType: string }> {
    const row = await this.repo.getById(uploadId)
    if (!row) throw notFound('Upload not found')
    return readUploadObject(row.storageKey)
  }
}

export const uploadsService = new UploadsService()
