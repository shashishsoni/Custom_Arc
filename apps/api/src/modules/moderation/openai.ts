import {
  parseSemanticModerationJson,
  SEMANTIC_MODERATION_SYSTEM,
  type ModerationAiResult,
} from '@customarc/shared'
import { OPENAI_API_KEY } from '@customarc/shared/constants'
import { logger } from '../../logger.ts'

/** Node-only image bytes — stays in API (not shared; Buffer). */
export type ModerateInput = {
  text?: string
  image?: { bytes: Buffer; mimeType: string }
}

const MODERATION_URL = 'https://api.openai.com/v1/moderations'
const CHAT_URL = 'https://api.openai.com/v1/chat/completions'
const MODERATION_MODEL = 'omni-moderation-latest'
const SEMANTIC_MODEL = 'gpt-4o-mini'

const HARD_BLOCK = new Set(['sexual/minors', 'self-harm/intent'])

type ModerationResult = {
  flagged: boolean
  categories: Record<string, boolean>
  category_scores: Record<string, number>
}

/** Free OpenAI Moderations API — text and/or image (issue 13). No-op when key unset. */
export async function moderateOpenAi(input: ModerateInput): Promise<ModerationAiResult | null> {
  if (!OPENAI_API_KEY) return null

  const parts: unknown[] = []
  if (input.text?.trim()) {
    parts.push({ type: 'text', text: input.text.trim() })
  }
  if (input.image) {
    const b64 = input.image.bytes.toString('base64')
    const mime = input.image.mimeType || 'image/jpeg'
    parts.push({
      type: 'image_url',
      image_url: { url: `data:${mime};base64,${b64}` },
    })
  }
  if (parts.length === 0) return { verdict: 'approved', reasons: [] }

  try {
    const res = await fetch(MODERATION_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: MODERATION_MODEL, input: parts }),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      logger.warn('openai moderation http error', { status: res.status, body: body.slice(0, 200) })
      return null
    }
    const json = (await res.json()) as { results?: ModerationResult[] }
    const result = json.results?.[0]
    if (!result) {
      logger.warn('openai moderation empty result')
      return null
    }
    return mapModeration(result)
  } catch (e) {
    logger.warn('openai moderation failed', { err: e instanceof Error ? e.message : String(e) })
    return null
  }
}

/** gpt-4o-mini semantic IP / policy screen. No-op when key unset. */
export async function semanticOpenAi(prompt: string): Promise<ModerationAiResult | null> {
  if (!OPENAI_API_KEY) return null
  const text = prompt.trim()
  if (!text) return { verdict: 'approved', reasons: [] }

  try {
    const res = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: SEMANTIC_MODEL,
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SEMANTIC_MODERATION_SYSTEM },
          { role: 'user', content: text },
        ],
      }),
    })
    if (!res.ok) {
      logger.warn('openai semantic http error', { status: res.status })
      return null
    }
    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    return parseSemanticModerationJson(json.choices?.[0]?.message?.content ?? '{}', 'openai')
  } catch (e) {
    logger.warn('openai semantic failed', { err: e instanceof Error ? e.message : String(e) })
    return null
  }
}

function mapModeration(result: ModerationResult): ModerationAiResult {
  const hit = Object.entries(result.categories)
    .filter(([, on]) => on)
    .map(([k]) => k)

  const hard = hit.filter((k) => HARD_BLOCK.has(k))
  if (hard.length) {
    return { verdict: 'blocked', reasons: hard.map((k) => `openai:${k}`) }
  }
  if (result.flagged || hit.length) {
    return {
      verdict: 'flagged',
      reasons: (hit.length ? hit : ['flagged']).map((k) => `openai:${k}`),
    }
  }
  return { verdict: 'approved', reasons: [] }
}
