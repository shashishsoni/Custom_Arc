import sharp from 'sharp'
import { badRequest } from '../../errors.ts'

const MAX_BYTES = 8 * 1024 * 1024
const MAX_EDGE = 2048
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp'])

export type ReencodedImage = {
  buffer: Buffer
  mimeType: 'image/jpeg'
  widthPx: number
  heightPx: number
}

/** Validate mime/size and re-encode to sRGB JPEG (spec §7.4). */
export async function reencodeUpload(file: File): Promise<ReencodedImage> {
  if (!ALLOWED.has(file.type)) throw badRequest('Only JPEG, PNG, or WebP images are allowed')
  if (file.size > MAX_BYTES) throw badRequest('Image must be under 8MB')

  const input = Buffer.from(await file.arrayBuffer())
  try {
    const pipeline = sharp(input).rotate().resize({
      width: MAX_EDGE,
      height: MAX_EDGE,
      fit: 'inside',
      withoutEnlargement: true,
    })
    const { data, info } = await pipeline
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer({ resolveWithObject: true })

    return {
      buffer: data,
      mimeType: 'image/jpeg',
      widthPx: info.width,
      heightPx: info.height,
    }
  } catch {
    throw badRequest('Could not decode image')
  }
}
