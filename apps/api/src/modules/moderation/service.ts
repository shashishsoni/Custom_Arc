import { ApiError } from '../../errors.ts'

/**
 * Layered moderation (spec §6, issue 13):
 *   keyword blocklist → LLM semantic check → provider safety filter
 *   → OpenAI image moderation → founder review before print (issue 19 hard gate).
 */
export type ModerationVerdict = 'pending' | 'approved' | 'flagged' | 'blocked'

export class ModerationService {
  async reviewPrompt(_prompt: string): Promise<ModerationVerdict> {
    throw new ApiError(501, 'Moderation not implemented (issue 13)')
  }
  async canPrint(_designId: string): Promise<boolean> {
    throw new ApiError(501, 'Print gate not implemented (issue 19)')
  }
}

export const moderationService = new ModerationService()
