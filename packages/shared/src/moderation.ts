import { z } from 'zod'

/**
 * Shared moderation contracts — used by OpenAI + NVIDIA providers (issue 13).
 * `pending` is DB-only (awaiting human review); AI layers return approved|flagged|blocked.
 */

export const moderationAiVerdictSchema = z.enum(['approved', 'flagged', 'blocked'])
export type ModerationAiVerdict = z.infer<typeof moderationAiVerdictSchema>

export const moderationAiResultSchema = z.object({
  verdict: moderationAiVerdictSchema,
  reasons: z.array(z.string()),
})
export type ModerationAiResult = z.infer<typeof moderationAiResultSchema>

/** System prompt for prompt/text IP + policy semantic screen (OpenAI + NVIDIA). */
export const SEMANTIC_MODERATION_SYSTEM =
  'Classify whether the user prompt for a print-on-demand design references real brands, celebrities, copyrighted characters/franchises, logos, slogans, or NSFW/illegal content. Reply JSON only: {"risk":"none"|"flag"|"block","reason":"short"}. Use block for clear NSFW/illegal; flag when IP is likely or uncertain; none when original/generic.'

/**
 * Parse LLM JSON `{"risk":"none"|"flag"|"block","reason":"..."}` into a moderation result.
 * Tolerates prose wrapping around the JSON object.
 */
export function parseSemanticModerationJson(
  raw: string,
  provider: string,
): ModerationAiResult {
  try {
    const start = raw.indexOf('{')
    const end = raw.lastIndexOf('}')
    const json = start >= 0 && end > start ? raw.slice(start, end + 1) : raw
    const parsed = JSON.parse(json) as { risk?: string; reason?: string }
    const risk = parsed.risk ?? 'flag'
    const reason = parsed.reason
      ? `semantic:${provider}:${parsed.reason}`
      : `semantic:${provider}:${risk}`
    if (risk === 'block') return { verdict: 'blocked', reasons: [reason] }
    if (risk === 'flag') return { verdict: 'flagged', reasons: [reason] }
    if (risk === 'none') return { verdict: 'approved', reasons: [] }
    return { verdict: 'flagged', reasons: [reason] }
  } catch {
    return { verdict: 'flagged', reasons: [`semantic:${provider}:parse`] }
  }
}
