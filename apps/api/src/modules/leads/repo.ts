import { prisma } from '@customarc/db'

export interface BulkLeadRepo {
  create(input: { email: string; note: string; userId?: string | undefined }): Promise<{ id: string }>
}

export const bulkLeadRepo: BulkLeadRepo = {
  async create(input) {
    const row = await prisma.bulkLead.create({
      data: { email: input.email, note: input.note, userId: input.userId ?? null },
      select: { id: true },
    })
    return { id: row.id }
  },
}
