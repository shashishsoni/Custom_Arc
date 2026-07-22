import type { Design, Prisma } from '@customarc/db'
import type { DesignDocument, SaveDesignRequest, UpdateDesignRequest } from '@customarc/shared'
import { forbidden, notFound } from '../../errors.ts'
import { designerRepo } from './repo.ts'

/** Save/Load designs. Document shape is validated at the route with shared Zod schemas. */
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

  async save(input: { userId: string } & SaveDesignRequest): Promise<Design> {
    const blankId = await this.repo.resolveBlankId(input.blankId)
    if (!blankId) throw notFound('Blank not found')
    return this.repo.create({
      userId: input.userId,
      blankId,
      document: toJson(input.document),
      ...(input.name !== undefined ? { name: input.name } : {}),
    })
  }

  async updateForUser(
    id: string,
    userId: string,
    input: UpdateDesignRequest,
  ): Promise<Design> {
    await this.getByIdForUser(id, userId)
    return this.repo.update(id, toJson(input.document), input.name)
  }
}

function toJson(document: DesignDocument): Prisma.InputJsonValue {
  return document as Prisma.InputJsonValue
}

export const designerService = new DesignerService()
