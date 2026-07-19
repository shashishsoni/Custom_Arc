import { createHmac, timingSafeEqual } from 'node:crypto'
import { AUTH_SECRET, API_BASE_URL } from '../../env.ts'

const TTL_SEC = 60 * 60 // 1h

export function signUploadAccess(uploadId: string, expSec: number): string {
  return createHmac('sha256', AUTH_SECRET).update(`${uploadId}.${expSec}`).digest('hex')
}

export function verifyUploadAccess(uploadId: string, expSec: number, sig: string): boolean {
  if (Date.now() / 1000 > expSec) return false
  const expected = signUploadAccess(uploadId, expSec)
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(sig))
  } catch {
    return false
  }
}

/** Absolute signed URL the browser can use as <img> / CanvasTexture source. */
export function signedPreviewUrl(uploadId: string): string {
  const exp = Math.floor(Date.now() / 1000) + TTL_SEC
  const sig = signUploadAccess(uploadId, exp)
  return `${API_BASE_URL}/uploads/${uploadId}/content?exp=${exp}&sig=${sig}`
}
