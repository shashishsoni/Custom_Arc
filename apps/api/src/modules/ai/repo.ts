import type { Generation, GenerationStatus, ModerationFlag } from '@customarc/db'
import { prisma } from '@customarc/db'

export const aiRepo = {
  create(input: {
    userId: string
    designId: string
    prompt: string
    creditsCost: number
    provider: string
    status?: GenerationStatus
  }): Promise<Generation> {
    return prisma.generation.create({
      data: {
        userId: input.userId,
        designId: input.designId,
        prompt: input.prompt,
        creditsCost: input.creditsCost,
        provider: input.provider,
        status: input.status ?? 'pending',
      },
    })
  },

  update(
    id: string,
    data: {
      status?: GenerationStatus
      provider?: string
      outputAssetKey?: string | null
    },
  ): Promise<Generation> {
    return prisma.generation.update({ where: { id }, data })
  },

  getById(id: string): Promise<Generation | null> {
    return prisma.generation.findUnique({ where: { id } })
  },

  createOutputFlag(input: {
    generationId: string
    verdict: 'approved' | 'blocked' | 'flagged' | 'pending'
    reasons: string[]
  }): Promise<ModerationFlag> {
    return prisma.moderationFlag.create({
      data: {
        subjectType: 'generation_output',
        generationId: input.generationId,
        verdict: input.verdict,
        reasons: input.reasons,
      },
    })
  },
}
