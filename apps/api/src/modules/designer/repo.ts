import type { Design, Prisma } from '@customarc/db'
import { prisma } from '@customarc/db'

export const designerRepo = {
  listByUser(userId: string): Promise<Design[]> {
    return prisma.design.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    })
  },

  getById(id: string): Promise<Design | null> {
    return prisma.design.findUnique({ where: { id } })
  },

  /** Accepts Blank.id or Blank.slug (web sends slug). */
  async resolveBlankId(idOrSlug: string): Promise<string | null> {
    const byId = await prisma.blank.findUnique({
      where: { id: idOrSlug },
      select: { id: true },
    })
    if (byId) return byId.id
    const bySlug = await prisma.blank.findUnique({
      where: { slug: idOrSlug },
      select: { id: true },
    })
    return bySlug?.id ?? null
  },

  create(input: {
    userId: string
    blankId: string
    document: Prisma.InputJsonValue
    name?: string
  }): Promise<Design> {
    return prisma.design.create({
      data: {
        userId: input.userId,
        blankId: input.blankId,
        document: input.document,
        name: input.name ?? null,
      },
    })
  },

  update(id: string, document: Prisma.InputJsonValue, name?: string): Promise<Design> {
    return prisma.design.update({
      where: { id },
      data: { document, ...(name !== undefined ? { name } : {}) },
    })
  },
}
