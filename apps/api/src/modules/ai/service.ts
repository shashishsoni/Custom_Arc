import type { GenerationResult, UploadResult } from '@customarc/shared'
import { AI_GENERATION_CREDIT_COST } from '@customarc/shared/constants'
import { prisma } from '@customarc/db'
import { badRequest, forbidden, notFound } from '../../errors.ts'
import { logger } from '../../logger.ts'
import { creditsService } from '../credits/service.ts'
import { designerRepo } from '../designer/repo.ts'
import { moderationService } from '../moderation/service.ts'
import { reencodeBytes } from '../uploads/reencode.ts'
import { signedPreviewUrl } from '../uploads/sign.ts'
import { buildUploadObjectKey, putUploadObject } from '../uploads/storage.ts'
import { uploadsRepo } from '../uploads/repo.ts'
import { createImageGenerator, type ImageGenerator } from './provider.ts'
import { aiRepo } from './repo.ts'

/** Issue 12 — prompt → FLUX image → Upload; credits spent once (correlationId = generation id). */
export class AiService {
  constructor(
    private readonly repo = aiRepo,
    private readonly designs = designerRepo,
    private readonly credits = creditsService,
    private readonly generatorFactory: () => ImageGenerator = createImageGenerator,
  ) {}

  async generateFromPrompt(input: {
    userId: string
    designId: string
    prompt: string
  }): Promise<GenerationResult> {
    const prompt = input.prompt.trim()
    if (!prompt) throw badRequest('Prompt is empty')

    const design = await this.designs.getById(input.designId)
    if (!design) throw notFound('Design not found')
    if (design.userId !== input.userId) throw forbidden()

    const blank = await prisma.blank.findUnique({
      where: { id: design.blankId },
      select: { slug: true, category: true },
    })
    if (!blank) throw notFound('Blank not found')

    const cost = Math.max(1, AI_GENERATION_CREDIT_COST)

    const verdict = await moderationService.reviewPrompt(prompt)
    if (verdict !== 'approved') {
      await this.repo.create({
        userId: input.userId,
        designId: input.designId,
        prompt,
        creditsCost: 0,
        provider: 'none',
        status: 'rejected',
      })
      throw forbidden('Prompt rejected by moderation')
    }

    const balance = await this.credits.getBalance(input.userId)
    if (balance.balance < cost) throw badRequest('Insufficient credits')

    const row = await this.repo.create({
      userId: input.userId,
      designId: input.designId,
      prompt,
      creditsCost: cost,
      provider: 'pending',
      status: 'generating',
    })

    await this.credits.spend({
      userId: input.userId,
      correlationId: `generation:${row.id}`,
      amount: cost,
      reason: `AI generation ${row.id}`,
    })

    try {
      const generated = await this.generatorFactory().generate(prompt)
      const image = await reencodeBytes(generated.bytes)
      const key = buildUploadObjectKey({
        category: blank.category,
        productSlug: blank.slug,
        originalFileName: `ai-${row.id}.jpg`,
        imageType: 'jpg',
      })
      const storageKey = await putUploadObject(key, image.buffer, image.mimeType)
      const upload = await uploadsRepo.create({
        userId: input.userId,
        storageKey,
        mimeType: image.mimeType,
        sizeBytes: image.buffer.byteLength,
        widthPx: image.widthPx,
        heightPx: image.heightPx,
      })

      const flag = await moderationService.reviewUpload(upload.id)
      await this.repo.createOutputFlag({
        generationId: row.id,
        verdict: flag.verdict,
        reasons: flag.reasons.length ? flag.reasons : [`upload:${flag.verdict}`],
      })

      if (flag.verdict !== 'approved') {
        await this.repo.update(row.id, {
          status: 'rejected',
          provider: generated.provider,
          outputAssetKey: storageKey,
        })
        throw forbidden('Generated image rejected by moderation')
      }

      await this.repo.update(row.id, {
        status: 'completed',
        provider: generated.provider,
        outputAssetKey: storageKey,
      })

      const after = await this.credits.getBalance(input.userId)
      const uploadResult: UploadResult = {
        id: upload.id,
        previewUrl: signedPreviewUrl(upload.id),
        mimeType: upload.mimeType,
        widthPx: image.widthPx,
        heightPx: image.heightPx,
        sizeBytes: upload.sizeBytes,
      }

      logger.info('ai generation completed', {
        generationId: row.id,
        provider: generated.provider,
        creditsCost: cost,
      })

      return {
        id: row.id,
        prompt,
        provider: generated.provider,
        creditsCost: cost,
        balance: after.balance,
        upload: uploadResult,
      }
    } catch (e) {
      if (e && typeof e === 'object' && 'statusCode' in e) throw e
      await this.repo.update(row.id, { status: 'failed' }).catch(() => undefined)
      logger.error('ai generation failed', e)
      throw badRequest(e instanceof Error ? e.message : 'AI generation failed')
    }
  }
}

export const aiService = new AiService()
