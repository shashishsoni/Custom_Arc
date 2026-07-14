import {
  blankSchema,
  blankSummarySchema,
  type Blank,
  type BlankSummary,
} from '@customarc/shared'
import { notFound } from '../../errors.ts'
import { catalogRepo } from './repo.ts'

/** Business logic over the repo. Validates raw Prisma JSON against the shared contracts. */
export class CatalogService {
  constructor(private readonly repo = catalogRepo) {}

  async list(): Promise<BlankSummary[]> {
    return blankSummarySchema.array().parse(await this.repo.list())
  }

  async getBySlug(slug: string): Promise<Blank> {
    const raw = await this.repo.getBySlug(slug)
    if (!raw) throw notFound(`Blank "${slug}" not found`)
    return blankSchema.parse(raw)
  }
}

export const catalogService = new CatalogService()
