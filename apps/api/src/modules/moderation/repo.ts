import type { ModerationFlag, ModerationVerdict } from '@customarc/db'
import { prisma } from '@customarc/db'

export type { ModerationVerdict }

export const moderationRepo = {
  createUploadFlag(input: {
    uploadId: string
    verdict: ModerationVerdict
    reasons: string[]
  }): Promise<ModerationFlag> {
    return prisma.moderationFlag.create({
      data: {
        subjectType: 'upload',
        uploadId: input.uploadId,
        verdict: input.verdict,
        reasons: input.reasons,
      },
    })
  },

  createPromptFlag(input: {
    prompt: string
    verdict: ModerationVerdict
    reasons: string[]
  }): Promise<ModerationFlag> {
    return prisma.moderationFlag.create({
      data: {
        subjectType: 'prompt',
        prompt: input.prompt,
        verdict: input.verdict,
        reasons: input.reasons,
      },
    })
  },

  getByUploadId(uploadId: string): Promise<ModerationFlag | null> {
    return prisma.moderationFlag.findUnique({ where: { uploadId } })
  },

  getById(id: string): Promise<ModerationFlag | null> {
    return prisma.moderationFlag.findUnique({ where: { id } })
  },

  setVerdict(
    id: string,
    input: { verdict: ModerationVerdict; reviewedById: string; reasons?: string[] },
  ): Promise<ModerationFlag> {
    return prisma.moderationFlag.update({
      where: { id },
      data: {
        verdict: input.verdict,
        reviewedById: input.reviewedById,
        reviewedAt: new Date(),
        ...(input.reasons ? { reasons: input.reasons } : {}),
      },
    })
  },

  async setUploadStatus(uploadId: string, status: 'flagged' | 'approved' | 'reencoded'): Promise<void> {
    await prisma.upload.update({ where: { id: uploadId }, data: { status } })
  },
}
