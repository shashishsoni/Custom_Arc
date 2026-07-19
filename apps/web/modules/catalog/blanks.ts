import { blankSchema, blankSummarySchema, type Blank, type BlankSummary } from '@customarc/shared'
import { API_CATALOG_BLANKS, apiUrl } from '@customarc/shared/constants'

/** Thin HTTP to API catalog routes — catalog CRUD/business stays in apps/api. */
async function request<T>(path: string, schema: { parse: (v: unknown) => T }): Promise<T> {
  const res = await fetch(apiUrl(path), { cache: 'no-store' })
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`)
  const body = (await res.json()) as { success: boolean; data?: T; error?: string }
  if (!body.success || body.data === undefined) {
    throw new Error(body.error ?? `API error: ${path}`)
  }
  return schema.parse(body.data)
}

export function listBlanks(): Promise<BlankSummary[]> {
  return request(API_CATALOG_BLANKS, blankSummarySchema.array())
}

export function getBlank(slug: string): Promise<Blank> {
  return request(`${API_CATALOG_BLANKS}/${slug}`, blankSchema)
}

export type { Blank, BlankSummary }
