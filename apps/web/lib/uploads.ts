import type { Blank, UploadResult } from '@customarc/shared'
import { uploadResultSchema } from '@customarc/shared'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001'

async function naturalSize(file: File): Promise<{ widthPx: number; heightPx: number }> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error('Could not read image'))
      el.src = url
    })
    return { widthPx: img.naturalWidth, heightPx: img.naturalHeight }
  } finally {
    URL.revokeObjectURL(url)
  }
}

export type UploadBlankRef = Pick<Blank, 'slug' | 'category'>

/**
 * Prefer authenticated server upload (re-encode + private storage).
 * If signed out, fall back to a local blob preview so tools still work while exploring.
 */
export async function uploadDesignImage(
  file: File,
  blank: UploadBlankRef,
): Promise<UploadResult> {
  const form = new FormData()
  form.append('file', file)
  form.append('category', blank.category)
  form.append('productSlug', blank.slug)

  const res = await fetch(`${API_BASE}/uploads`, {
    method: 'POST',
    body: form,
    credentials: 'include',
  })

  if (res.ok) {
    const body = (await res.json()) as { success: boolean; data?: unknown; error?: string }
    if (!body.success || body.data === undefined) throw new Error(body.error ?? 'Upload failed')
    return uploadResultSchema.parse(body.data)
  }

  if (res.status === 401) {
    const { widthPx, heightPx } = await naturalSize(file)
    return {
      id: `local-${crypto.randomUUID()}`,
      previewUrl: URL.createObjectURL(file),
      mimeType: file.type || 'image/jpeg',
      widthPx,
      heightPx,
      sizeBytes: file.size,
    }
  }

  const body = (await res.json().catch(() => null)) as { error?: string } | null
  throw new Error(body?.error ?? `Upload failed (${res.status})`)
}
