import { ApiError } from '../../errors.ts'

/**
 * AI text→texture (spec §6, issue 12). Server-side only. Prompt is moderated first.
 * Primary: FLUX.1 schnell via fal.ai + Real-ESRGAN upscale. Fallback: Cloudflare Workers AI.
 */
export interface ImageGenerator {
  generate(prompt: string): Promise<{ imageUrl: string; meta: Record<string, unknown> }>
}

export class AiService {
  async generateFromPrompt(_input: { userId: string; designId: string; prompt: string }): Promise<never> {
    throw new ApiError(501, 'AI generation not implemented (issue 12)')
  }
}

export const aiService = new AiService()
