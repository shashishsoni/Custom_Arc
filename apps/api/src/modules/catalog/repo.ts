import { prisma } from '@customarc/db'
import type { Blank, BlankSummary } from '@customarc/shared'

/** Data access only. No business rules, no HTTP. */
export interface CatalogRepo {
  list(): Promise<BlankSummary[]>
  getBySlug(slug: string): Promise<Blank | null>
}

export const catalogRepo: CatalogRepo = {
  async list() {
    const rows = await prisma.blank.findMany({
      where: { isActive: true },
      select: { slug: true, name: true, category: true },
      orderBy: { createdAt: 'asc' },
    })
    return rows as BlankSummary[]
  },

  async getBySlug(slug: string) {
    const row = await prisma.blank.findUnique({ where: { slug } })
    return (row as Blank | null) ?? null
  },
}
