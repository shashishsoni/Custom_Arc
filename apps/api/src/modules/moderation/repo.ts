import { prisma } from '@customarc/db'

export type ModerationVerdict = 'pending' | 'approved' | 'flagged' | 'blocked'

export type ModerationFlagRow = {
  id: string
  subjectType: 'prompt' | 'upload' | 'generation_output'
  generationId: string | null
  uploadId: string | null
  prompt: string | null
  verdict: ModerationVerdict
  reasons: string[]
  reviewedById: string | null
  reviewedAt: Date | null
}

export const moderationRepo = {
  async createUploadFlag(input: {
    uploadId: string
    verdict: ModerationVerdict
    reasons: string[]
  }): Promise<ModerationFlagRow> {
    return prisma.moderationFlag.create({
      data: {
        subjectType: 'upload',
        uploadId: input.uploadId,
        verdict: input.verdict,
        reasons: input.reasons,
      },
    }) as unknown as Promise<ModerationFlagRow>
  },

  async createPromptFlag(input: {
    prompt: string
    verdict: ModerationVerdict
    reasons: string[]
  }): Promise<ModerationFlagRow> {
    return prisma.moderationFlag.create({
      data: {
        subjectType: 'prompt',
        prompt: input.prompt,
        verdict: input.verdict,
        reasons: input.reasons,
      },
    }) as unknown as Promise<ModerationFlagRow>
  },

  async getByUploadId(uploadId: string): Promise<ModerationFlagRow | null> {
    return prisma.moderationFlag.findUnique({
      where: { uploadId },
    }) as unknown as Promise<ModerationFlagRow | null>
  },

  async getById(id: string): Promise<ModerationFlagRow | null> {
    return prisma.moderationFlag.findUnique({ where: { id } }) as unknown as Promise<ModerationFlagRow | null>
  },

  async setVerdict(
    id: string,
    input: { verdict: ModerationVerdict; reviewedById: string; reasons?: string[] },
  ): Promise<ModerationFlagRow> {
    return prisma.moderationFlag.update({
      where: { id },
      data: {
        verdict: input.verdict,
        reviewedById: input.reviewedById,
        reviewedAt: new Date(),
        ...(input.reasons ? { reasons: input.reasons } : {}),
      },
    }) as unknown as Promise<ModerationFlagRow>
  },

  async setUploadStatus(uploadId: string, status: 'flagged' | 'approved' | 'reencoded'): Promise<void> {
    await prisma.upload.update({ where: { id: uploadId }, data: { status } })
  },
}
