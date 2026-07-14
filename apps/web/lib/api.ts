import { blankSchema, blankSummarySchema, type Blank, type BlankSummary } from '@customarc/shared'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001'

async function request<T>(path: string, schema: { parse: (v: unknown) => T }): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`)
  const body = (await res.json()) as { success: boolean; data?: T; error?: string }
  if (!body.success || body.data === undefined) {
    throw new Error(body.error ?? `API error: ${path}`)
  }
  return schema.parse(body.data)
}

export function listBlanks(): Promise<BlankSummary[]> {
  return request('/catalog/blanks', blankSummarySchema.array())
}

export function getBlank(slug: string): Promise<Blank> {
  return request(`/catalog/blanks/${slug}`, blankSchema)
}

export type { Blank, BlankSummary }
