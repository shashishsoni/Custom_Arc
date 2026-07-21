import type { ModerationFlag, ModerationVerdict } from '@customarc/db'
import { parseDesignDocument, type DesignDocument } from '@customarc/shared'
import {
  MODERATION_AUTO_APPROVE,
  MODERATION_REVIEWER_IDS,
} from '@customarc/shared/constants'
import { badRequest, forbidden, notFound } from '../../errors.ts'
import { logger } from '../../logger.ts'
import { designerRepo } from '../designer/repo.ts'
import { readUploadObject } from '../uploads/storage.ts'
import { uploadsRepo } from '../uploads/repo.ts'
import { scanText } from './blocklist.ts'
import { notifyFounderHold } from './notify.ts'
import { moderateContent, semanticPromptCheck } from './providers.ts'
import { moderationRepo } from './repo.ts'

export type { ModerationVerdict }

export type PrintGateResult = {
  ok: boolean
  designId: string
  reasons: string[]
}

type LayerVerdict = { verdict: ModerationVerdict; reasons: string[] }

/** Issue 13 + 19 — layered moderation; hard-block print until approved. */
export class ModerationService {
  constructor(
    private readonly repo = moderationRepo,
    private readonly designs = designerRepo,
  ) {}

  async reviewPrompt(prompt: string): Promise<ModerationVerdict> {
    const text = prompt.trim()
    if (!text) throw badRequest('Prompt is empty')

    const result = await this.runTextPipeline(text, { semantic: true })
    await this.repo.createPromptFlag({
      prompt: text,
      verdict: result.verdict,
      reasons: result.reasons,
    })
    if (result.verdict !== 'approved') {
      logger.warn('prompt moderated', { verdict: result.verdict, reasons: result.reasons })
    }
    return result.verdict
  }

  /** Called after upload create — blocklist N/A; OpenAI image when keyed. */
  async reviewUpload(uploadId: string): Promise<ModerationFlag> {
    const upload = await uploadsRepo.getById(uploadId)
    if (!upload) throw notFound('Upload not found')

    let verdict: ModerationVerdict = MODERATION_AUTO_APPROVE ? 'approved' : 'pending'
    const reasons: string[] = []

    try {
      const { body, contentType } = await readUploadObject(upload.storageKey)
      const ai = await moderateContent({
        image: { bytes: body, mimeType: contentType || upload.mimeType },
      })
      if (ai) {
        verdict = ai.verdict === 'approved' && !MODERATION_AUTO_APPROVE ? 'pending' : ai.verdict
        reasons.push(...ai.reasons)
        if (ai.verdict === 'approved' && !MODERATION_AUTO_APPROVE) {
          reasons.push('awaiting_review')
        }
      } else if (!MODERATION_AUTO_APPROVE) {
        reasons.push('awaiting_review')
      }
    } catch (e) {
      logger.warn('upload moderation read failed', {
        uploadId,
        err: e instanceof Error ? e.message : String(e),
      })
      verdict = 'flagged'
      reasons.push('upload:unreadable')
    }

    const flag = await this.repo.createUploadFlag({ uploadId, verdict, reasons })
    if (verdict === 'approved') await this.repo.setUploadStatus(uploadId, 'approved')
    else if (verdict === 'blocked' || verdict === 'flagged') {
      await this.repo.setUploadStatus(uploadId, 'flagged')
      void notifyFounderHold({
        designId: `upload:${uploadId}`,
        reasons: reasons.length ? reasons : [verdict],
      })
    }
    return flag
  }

  async canPrint(designId: string): Promise<boolean> {
    return (await this.checkPrintGate(designId)).ok
  }

  async assertCanPrint(designId: string, ctx?: { orderId?: string }): Promise<void> {
    const gate = await this.checkPrintGate(designId)
    if (gate.ok) return
    await notifyFounderHold({
      designId,
      ...(ctx?.orderId !== undefined ? { orderId: ctx.orderId } : {}),
      reasons: gate.reasons,
    })
    throw forbidden(
      `Design failed moderation print gate: ${gate.reasons.join('; ') || 'blocked'}`,
    )
  }

  async checkPrintGate(designId: string): Promise<PrintGateResult> {
    const design = await this.designs.getById(designId)
    if (!design) throw notFound('Design not found')

    const doc = parseDesignDocument(design.document) as DesignDocument
    const reasons: string[] = []

    for (const layer of doc.layers) {
      if (layer.type === 'text') {
        const textResult = await this.runTextPipeline(layer.text, { semantic: false })
        if (textResult.verdict !== 'approved') {
          const tagged =
            textResult.reasons.length > 0
              ? textResult.reasons.map((r) => `text:${layer.id}:${r}`)
              : [`text:${layer.id}:${textResult.verdict}`]
          reasons.push(...tagged)
        }
      }
      if (layer.type === 'image') {
        if (layer.uploadId.startsWith('local-')) {
          reasons.push(`upload:${layer.uploadId}:local_only`)
          continue
        }
        const flag = await this.ensureUploadFlag(layer.uploadId)
        if (!flag || flag.verdict !== 'approved') {
          reasons.push(`upload:${layer.uploadId}:${flag?.verdict ?? 'pending'}`)
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
  ): Promise<ModerationFlag> {
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

  /** Layer 1 blocklist → optional semantic → OpenAI text moderation. */
  private async runTextPipeline(
    text: string,
    opts: { semantic: boolean },
  ): Promise<LayerVerdict> {
    const scan = scanText(text)
    if (!scan.ok) return { verdict: 'blocked', reasons: scan.reasons }

    if (opts.semantic) {
      const semantic = await semanticPromptCheck(text)
      if (semantic && semantic.verdict !== 'approved') return semantic
    }

    const ai = await moderateContent({ text })
    if (ai && ai.verdict !== 'approved') return ai

    return { verdict: 'approved', reasons: [] }
  }

  private async ensureUploadFlag(uploadId: string): Promise<ModerationFlag | null> {
    const existing = await this.repo.getByUploadId(uploadId)
    if (existing) return existing
    if (!MODERATION_AUTO_APPROVE) return null
    return this.reviewUpload(uploadId)
  }
}

function isReviewer(userId: string): boolean {
  if (MODERATION_REVIEWER_IDS.length === 0) return false
  return MODERATION_REVIEWER_IDS.includes(userId)
}

export const moderationService = new ModerationService()
