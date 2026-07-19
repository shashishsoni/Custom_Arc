import { R2_PUBLIC_BASE_URL } from '@customarc/shared/constants'

/** Object keys in the R2 bucket (no leading slash). */
export const r2Keys = {
  premiumProVideo: 'CustomArc-Local/CustomArc-video/Create_a_second_premium_pro.mp4',
} as const

export type R2KeyName = keyof typeof r2Keys

/** Public CDN base for browser media (`NEXT_PUBLIC_R2_PUBLIC_BASE_URL`). */
export function getR2PublicBaseUrl(): string {
  const raw = R2_PUBLIC_BASE_URL
  if (!raw) return ''
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
  return withProtocol.replace(/\/+$/, '')
}

/** Absolute URL for an R2 object key. */
export function r2Url(key: string): string {
  const base = getR2PublicBaseUrl()
  const path = key.replace(/^\/+/, '')
  if (!base) {
    throw new Error(
      'NEXT_PUBLIC_R2_PUBLIC_BASE_URL missing in root .env (---- frontend ----). Restart pnpm dev after changing it.',
    )
  }
  return `${base}/${path}`
}

export function r2MediaUrl(name: R2KeyName): string {
  return r2Url(r2Keys[name])
}

/** Same as `r2MediaUrl`, but returns `null` when env is not configured. */
export function tryR2MediaUrl(name: R2KeyName): string | null {
  const base = getR2PublicBaseUrl()
  if (!base) return null
  return `${base}/${r2Keys[name]}`
}
