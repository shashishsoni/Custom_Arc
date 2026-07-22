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

/** System prompt for prompt/text safety screen (OpenAI + NVIDIA). Lenient for fan-style POD art. */
export const SEMANTIC_MODERATION_SYSTEM =
  'You moderate user prompts for print-on-demand mug/phone-case designs. Reply JSON only: {"risk":"none"|"flag"|"block","reason":"short"}. ' +
  'Use block ONLY for clear NSFW sexual content, child exploitation, extreme violence, hate/terror instructions, or other illegal content. ' +
  'Use none for pets, animals, landscapes, abstract art, anime/game/toy/character styles (e.g. Beyblade, Pokémon-like, cartoon heroes), fan-art vibes, and generic brand-adjacent aesthetics. ' +
  'Do NOT flag copyrighted characters, franchises, celebrities, or logos by themselves — this product allows stylized fan designs for personal prints. ' +
  'Use flag only when content is borderline NSFW or clearly intends real trademark counterfeit packaging (not character art). Prefer none when unsure.'

/**
 * Parse LLM JSON `{"risk":"none"|"flag"|"block","reason":"..."}` into a moderation result.
 * Tolerates prose wrapping around the JSON object. Parse failure → approve (fail-open).
 */
export function parseSemanticModerationJson(
  raw: string,
  provider: string,
): ModerationAiResult {
  try {
    const cleaned = raw.replace(/```(?:json)?/gi, '').replace(/<\/?think>/gi, '').trim()
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    const json = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned
    const parsed = JSON.parse(json) as { risk?: string; reason?: string }
    const risk = (parsed.risk ?? 'none').toLowerCase()
    const reason = parsed.reason
      ? `semantic:${provider}:${parsed.reason}`
      : `semantic:${provider}:${risk}`
    if (risk === 'block') return { verdict: 'blocked', reasons: [reason] }
    // Soft flags (IP-ish) are allowed through for Phase-1 POD fan art.
    if (risk === 'flag') return { verdict: 'approved', reasons: [`semantic:${provider}:soft:${parsed.reason ?? 'flag'}`] }
    return { verdict: 'approved', reasons: [] }
  } catch {
    // Fail-open on unparseable model output — do not block cats / benign prompts.
    return { verdict: 'approved', reasons: [`semantic:${provider}:parse-skip`] }
  }
}
