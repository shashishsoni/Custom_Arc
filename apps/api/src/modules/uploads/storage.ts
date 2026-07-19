import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import {
  R2_ACCESS_KEY_ID,
  R2_ACCOUNT_ID,
  R2_BUCKET,
  R2_ENABLED,
  R2_SECRET_ACCESS_KEY,
} from '../../env.ts'

/**
 * Bucket layout (matches CustomArc-Local/ marketing assets):
 * CustomArc-Local/uploadimage/{category}/{productSlug}/{originalFileName}
 * e.g. CustomArc-Local/uploadimage/mug/mug/my-art.jpg
 *      CustomArc-Local/uploadimage/phone_case/phone-case/cover.webp → stored as cover.jpg after re-encode
 */
const ROOT = 'CustomArc-Local/uploadimage'

const localRoot = join(fileURLToPath(new URL('.', import.meta.url)), '../../../../.data/uploads')

function r2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  })
}

function sanitizeSegment(value: string): string {
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return cleaned || 'unknown'
}

/** Keep the user filename stem; safe path segment only. */
export function sanitizeOriginalFileName(fileName: string, forcedExt?: string): string {
  const base = (fileName.split(/[/\\]/).pop() ?? 'image').trim()
  const dot = base.lastIndexOf('.')
  const stemRaw = dot > 0 ? base.slice(0, dot) : base
  const extRaw = forcedExt ?? (dot > 0 ? base.slice(dot + 1) : 'jpg')
  const stem = sanitizeSegment(stemRaw) || 'image'
  const ext = sanitizeSegment(extRaw).replace(/[^a-z0-9]/g, '') || 'jpg'
  return `${stem}.${ext}`
}

export type UploadPathParts = {
  category: string
  productSlug: string
  /** Original client filename (extension may be replaced after re-encode). */
  originalFileName: string
  /** Extension without dot after re-encode, e.g. jpg */
  imageType: string
}

/** Category → product → same original name (safe), not a generated label. */
export function buildUploadObjectKey(parts: UploadPathParts): string {
  const category = sanitizeSegment(parts.category)
  const product = sanitizeSegment(parts.productSlug)
  const fileName = sanitizeOriginalFileName(parts.originalFileName, parts.imageType)
  return `${ROOT}/${category}/${product}/${fileName}`
}

/** Persist bytes; returns opaque storageKey (`r2://…` or `local://…`). */
export async function putUploadObject(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<string> {
  if (R2_ENABLED) {
    await r2Client().send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    )
    return `r2://${R2_BUCKET}/${key}`
  }

  const path = join(localRoot, key)
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, body)
  return `local://${key}`
}

export async function readUploadObject(
  storageKey: string,
): Promise<{ body: Buffer; contentType: string }> {
  if (storageKey.startsWith('r2://')) {
    const without = storageKey.slice('r2://'.length)
    const slash = without.indexOf('/')
    const bucket = without.slice(0, slash)
    const key = without.slice(slash + 1)
    const out = await r2Client().send(
      new GetObjectCommand({ Bucket: bucket || R2_BUCKET, Key: key }),
    )
    const bytes = await out.Body?.transformToByteArray()
    if (!bytes) throw new Error('Empty R2 object')
    return { body: Buffer.from(bytes), contentType: out.ContentType ?? 'image/jpeg' }
  }

  const key = storageKey.replace(/^local:\/\//, '')
  const body = await readFile(join(localRoot, key))
  return { body, contentType: sniffMime(body) }
}

function sniffMime(buf: Buffer): string {
  if (buf[0] === 0xff && buf[1] === 0xd8) return 'image/jpeg'
  if (buf[0] === 0x89 && buf[1] === 0x50) return 'image/png'
  if (buf[0] === 0x52 && buf[1] === 0x49) return 'image/webp'
  return 'application/octet-stream'
}
