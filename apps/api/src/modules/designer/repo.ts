import { prisma } from '@customarc/db'

export interface DesignRow {
  id: string
  userId: string
  blankId: string
  document: unknown
  name: string | null
  createdAt: Date
  updatedAt: Date
}

export interface DesignerRepo {
  listByUser(userId: string): Promise<DesignRow[]>
  getById(id: string): Promise<DesignRow | null>
  create(input: {
    userId: string
    blankId: string
    document: unknown
    name?: string | undefined
  }): Promise<DesignRow>
  update(id: string, document: unknown, name?: string | undefined): Promise<DesignRow>
}

export const designerRepo: DesignerRepo = {
  async listByUser(userId) {
    return prisma.design.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    }) as Promise<DesignRow[]>
  },

  async getById(id) {
    return (await prisma.design.findUnique({ where: { id } })) as DesignRow | null
  },

  async create(input) {
    return prisma.design.create({
      data: {
        userId: input.userId,
        blankId: input.blankId,
        document: input.document as object,
        name: input.name ?? null,
      },
    }) as Promise<DesignRow>
  },

  async update(id, document, name) {
    return prisma.design.update({
      where: { id },
      data: { document: document as object, ...(name !== undefined ? { name } : {}) },
    }) as Promise<DesignRow>
  },
}
