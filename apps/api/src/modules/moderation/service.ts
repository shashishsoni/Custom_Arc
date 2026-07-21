import { parseDesignDocument, type DesignDocument } from '@customarc/shared'
import {
  MODERATION_AUTO_APPROVE,
  MODERATION_REVIEWER_IDS,
} from '@customarc/shared/constants'
import { badRequest, forbidden, notFound } from '../../errors.ts'
import { logger } from '../../logger.ts'
import { designerRepo } from '../designer/repo.ts'
import { scanText } from './blocklist.ts'
import { moderationRepo, type ModerationFlagRow, type ModerationVerdict } from './repo.ts'

export type { ModerationVerdict }

export type PrintGateResult = {
  ok: boolean
  designId: string
  reasons: string[]
}

/** Issue 13 + 19 — moderate content; hard-block print until approved. */
export class ModerationService {
  constructor(
    private readonly repo = moderationRepo,
    private readonly designs = designerRepo,
  ) {}

  async reviewPrompt(prompt: string): Promise<ModerationVerdict> {
    const text = prompt.trim()
    if (!text) throw badRequest('Prompt is empty')

    const scan = scanText(text)
    const verdict: ModerationVerdict = scan.ok ? 'approved' : 'blocked'
    const reasons = scan.ok ? [] : scan.reasons

    await this.repo.createPromptFlag({ prompt: text, verdict, reasons })
    if (!scan.ok) logger.warn('prompt blocked', { reasons })
    return verdict
  }

  /** Called after upload create — records flag + upload status. */
  async reviewUpload(uploadId: string): Promise<ModerationFlagRow> {
    const verdict: ModerationVerdict = MODERATION_AUTO_APPROVE ? 'approved' : 'pending'
    const flag = await this.repo.createUploadFlag({
      uploadId,
      verdict,
      reasons: verdict === 'pending' ? ['awaiting_review'] : [],
    })
    if (verdict === 'approved') await this.repo.setUploadStatus(uploadId, 'approved')
    return flag
  }

  /** Issue 19 — must pass before print file / partner submit. */
  async canPrint(designId: string): Promise<boolean> {
    return (await this.checkPrintGate(designId)).ok
  }

  async assertCanPrint(designId: string): Promise<void> {
    const gate = await this.checkPrintGate(designId)
    if (!gate.ok) {
      throw forbidden(`Design failed moderation print gate: ${gate.reasons.join('; ') || 'blocked'}`)
    }
  }

  async checkPrintGate(designId: string): Promise<PrintGateResult> {
    const design = await this.designs.getById(designId)
    if (!design) throw notFound('Design not found')

    const doc = parseDesignDocument(design.document) as DesignDocument
    const reasons: string[] = []

    for (const layer of doc.layers) {
      if (layer.type === 'text') {
        const scan = scanText(layer.text)
        if (!scan.ok) reasons.push(...scan.reasons.map((r) => `text:${layer.id}:${r}`))
      }
      if (layer.type === 'image') {
        if (layer.uploadId.startsWith('local-')) {
          reasons.push(`upload:${layer.uploadId}:local_only`)
          continue
        }
        const flag = await this.ensureUploadFlag(layer.uploadId)
        if (flag.verdict !== 'approved') {
          reasons.push(`upload:${layer.uploadId}:${flag.verdict}`)
        }
      }
    }

    return { ok: reasons.length === 0, designId, reasons }
  }

  async checkPrintGateForUser(designId: string, userId: string): Promise<PrintGateResult> {
    const design = await this.designs.getById(designId)
    if (!design) throw notFound('Design not found')
    if (design.userId !== userId) throw forbidden()
    return this.checkPrintGate(designId)
  }

  async reviewFlag(
    flagId: string,
    reviewerId: string,
    verdict: 'approved' | 'blocked' | 'flagged',
  ): Promise<ModerationFlagRow> {
    if (!isReviewer(reviewerId)) throw forbidden('Not a moderation reviewer')
    const existing = await this.repo.getById(flagId)
    if (!existing) throw notFound('Moderation flag not found')

    const updated = await this.repo.setVerdict(flagId, {
      verdict,
      reviewedById: reviewerId,
      reasons: [...existing.reasons, `reviewed:${verdict}`],
    })

    if (existing.uploadId) {
      await this.repo.setUploadStatus(
        existing.uploadId,
        verdict === 'approved' ? 'approved' : 'flagged',
      )
    }
    return updated
  }
  /** Backfill missing flags (pre-moderation uploads) when auto-approve is on. */
  private async ensureUploadFlag(uploadId: string): Promise<ModerationFlagRow> {
    const existing = await this.repo.getByUploadId(uploadId)
    if (existing) return existing
    if (!MODERATION_AUTO_APPROVE) {
      return {
        id: '',
        subjectType: 'upload',
        generationId: null,
        uploadId,
        prompt: null,
        verdict: 'pending',
        reasons: ['unreviewed'],
        reviewedById: null,
        reviewedAt: null,
      }
    }
    return this.reviewUpload(uploadId)
  }
}

function isReviewer(userId: string): boolean {
  if (MODERATION_REVIEWER_IDS.length === 0) return false
  return MODERATION_REVIEWER_IDS.includes(userId)
}

export const moderationService = new ModerationService()
