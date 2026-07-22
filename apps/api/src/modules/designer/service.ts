import type { Design, Prisma } from '@customarc/db'
import { parseDesignDocument } from '@customarc/shared'
import { forbidden, notFound } from '../../errors.ts'
import { designerRepo } from './repo.ts'

/** Save/Load designs. The Design document is validated through the shared zod schema on every write. */
export class DesignerService {
  constructor(private readonly repo = designerRepo) {}

  async listForUser(userId: string): Promise<Design[]> {
    return this.repo.listByUser(userId)
  }

  async getByIdForUser(id: string, userId: string): Promise<Design> {
    const design = await this.repo.getById(id)
    if (!design) throw notFound('Design not found')
    if (design.userId !== userId) throw forbidden()
    return design
  }

  async save(input: {
    userId: string
    blankId: string
    document: unknown
    name?: string
  }): Promise<Design> {
    const blankId = await this.repo.resolveBlankId(input.blankId)
    if (!blankId) throw notFound('Blank not found')
    const document = parseDesignDocument(input.document) as Prisma.InputJsonValue
    return this.repo.create({
      userId: input.userId,
      blankId,
      document,
      ...(input.name !== undefined ? { name: input.name } : {}),
    })
  }

  async updateForUser(
    id: string,
    userId: string,
    document: unknown,
    name?: string,
  ): Promise<Design> {
    await this.getByIdForUser(id, userId)
    const parsed = parseDesignDocument(document) as Prisma.InputJsonValue
    return this.repo.update(id, parsed, name)
  }
}

export const designerService = new DesignerService()
