import type { ModerationFlag, ModerationVerdict } from '@customarc/db'
import { parseDesignDocument, type DesignDocument } from '@customarc/shared'
import { MODERATION_REVIEWER_IDS } from '@customarc/shared/constants'
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

/**
 * AI auto-moderation (issues 13 + 19).
 * Clean → approved · negative → flagged/blocked with reasons in DB.
 * No manual queue — scale-safe. Founder review route remains for rare overrides.
 */
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

  /** Upload create — AI scores image; auto approve or reject + store reasons. */
  async reviewUpload(uploadId: string): Promise<ModerationFlag> {
    const upload = await uploadsRepo.getById(uploadId)
    if (!upload) throw notFound('Upload not found')

    const { verdict, reasons } = await this.scoreUpload(upload.storageKey, upload.mimeType)
    const flag = await this.repo.createUploadFlag({ uploadId, verdict, reasons })

    if (verdict === 'approved') {
      await this.repo.setUploadStatus(uploadId, 'approved')
    } else {
      await this.repo.setUploadStatus(uploadId, 'flagged')
      logger.warn('upload rejected by moderation', { uploadId, verdict, reasons })
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
        const textResult = await this.runTextPipeline(layer.text, { semantic: true })
        if (textResult.verdict !== 'approved') {
          reasons.push(
            ...(textResult.reasons.length
              ? textResult.reasons.map((r) => `text:${layer.id}:${r}`)
              : [`text:${layer.id}:${textResult.verdict}`]),
          )
        }
      }
      if (layer.type === 'image') {
        if (layer.uploadId.startsWith('local-')) {
          reasons.push(`upload:${layer.uploadId}:local_only`)
          continue
        }
        const flag = await this.ensureUploadFlag(layer.uploadId)
        if (!flag || flag.verdict !== 'approved') {
          reasons.push(`upload:${layer.uploadId}:${flag?.verdict ?? 'missing'}`)
          if (flag?.reasons.length) {
            reasons.push(...flag.reasons.map((r) => `upload:${layer.uploadId}:${r}`))
          }
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

  /** Rare override — false-positive rescue only. */
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

  private async scoreUpload(
    storageKey: string,
    mimeType: string,
  ): Promise<LayerVerdict> {
    try {
      const { body, contentType } = await readUploadObject(storageKey)
      const ai = await moderateContent({
        image: { bytes: body, mimeType: contentType || mimeType },
      })
      if (!ai) {
        return { verdict: 'flagged', reasons: ['ai:unavailable'] }
      }
      if (ai.verdict === 'approved') {
        return { verdict: 'approved', reasons: ai.reasons.length ? ai.reasons : ['ai:clean'] }
      }
      return { verdict: ai.verdict, reasons: ai.reasons }
    } catch (e) {
      logger.warn('upload moderation read failed', {
        err: e instanceof Error ? e.message : String(e),
      })
      return { verdict: 'flagged', reasons: ['upload:unreadable'] }
    }
  }

  /** Blocklist (hard only) → semantic (block NSFW only) → content-safety. */
  private async runTextPipeline(
    text: string,
    opts: { semantic: boolean },
  ): Promise<LayerVerdict> {
    const scan = scanText(text)
    if (!scan.ok) return { verdict: 'blocked', reasons: scan.reasons }

    if (opts.semantic) {
      const semantic = await semanticPromptCheck(text)
      // Soft flags are already mapped to approved; only hard blocks stop generation.
      if (semantic?.verdict === 'blocked') return semantic
    }

    const ai = await moderateContent({ text })
    if (ai && ai.verdict !== 'approved') return ai

    return { verdict: 'approved', reasons: [] }
  }

  private async ensureUploadFlag(uploadId: string): Promise<ModerationFlag | null> {
    const existing = await this.repo.getByUploadId(uploadId)
    if (existing) return existing
    return this.reviewUpload(uploadId)
  }
}

function isReviewer(userId: string): boolean {
  if (MODERATION_REVIEWER_IDS.length === 0) return false
  return MODERATION_REVIEWER_IDS.includes(userId)
}

export const moderationService = new ModerationService()
