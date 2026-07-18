import { prisma, type Blank as DbBlank, type BlankVariant as DbVariant } from '@customarc/db'
import type { Blank, BlankSummary, BlankVariant } from '@customarc/shared'

type BlankRow = DbBlank & { variants: DbVariant[] }

function toVariant(v: DbVariant): BlankVariant {
  return {
    id: v.id,
    name: v.name,
    partnerSku: v.partnerSku,
    priceMinor: v.priceMinor,
    currency: v.currency as BlankVariant['currency'],
  }
}

/** Map Prisma row → shared Blank contract (template JSON + active variants). */
function toBlank(row: BlankRow): Blank {
  return {
    slug: row.slug,
    name: row.name,
    category: row.category,
    template: row.template as Blank['template'],
    variants: row.variants.filter((v) => v.isActive).map(toVariant),
  }
}

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
    return rows
  },

  async getBySlug(slug: string) {
    const row = await prisma.blank.findUnique({
      where: { slug },
      include: { variants: { where: { isActive: true }, orderBy: { createdAt: 'asc' } } },
    })
    if (!row || !row.isActive) return null
    return toBlank(row)
  },
}
