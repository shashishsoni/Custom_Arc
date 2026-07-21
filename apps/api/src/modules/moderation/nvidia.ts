import {
  parseSemanticModerationJson,
  SEMANTIC_MODERATION_SYSTEM,
  type ModerationAiResult,
} from '@customarc/shared'
import {
  NVIDIA_API_KEY,
  NVIDIA_MODERATION_MODEL,
  NVIDIA_SEMANTIC_MODEL,
} from '@customarc/shared/constants'
import { logger } from '../../logger.ts'
import type { ModerateInput } from './openai.ts'

const CHAT_URL = 'https://integrate.api.nvidia.com/v1/chat/completions'

const HARD_CATEGORY = [/child/i, /minor/i, /csam/i, /sexual.?minor/i]

/**
 * NVIDIA NIM — `nvidia/nemotron-3.5-content-safety` (multimodal; replaces EOL nemotron-3).
 * https://build.nvidia.com/nvidia/nemotron-3.5-content-safety
 */
export async function moderateNvidia(input: ModerateInput): Promise<ModerationAiResult | null> {
  if (!NVIDIA_API_KEY) return null

  const content: unknown[] = []
  const text = input.text?.trim() || (input.image ? 'Classify this image for content safety.' : '')
  if (text) content.push({ type: 'text', text })
  if (input.image) {
    const b64 = input.image.bytes.toString('base64')
    const mime = input.image.mimeType || 'image/jpeg'
    content.push({
      type: 'image_url',
      image_url: { url: `data:${mime};base64,${b64}` },
    })
  }
  if (content.length === 0) return { verdict: 'approved', reasons: [] }

  try {
    const res = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        model: NVIDIA_MODERATION_MODEL,
        messages: [{ role: 'user', content }],
        temperature: 0.01,
        max_tokens: 200,
        top_p: 0.95,
        chat_template_kwargs: { request_categories: '/categories' },
      }),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      logger.warn('nvidia moderation http error', {
        status: res.status,
        body: body.slice(0, 200),
        model: NVIDIA_MODERATION_MODEL,
      })
      return null
    }
    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    return mapNvidiaSafety(json.choices?.[0]?.message?.content ?? '')
  } catch (e) {
    logger.warn('nvidia moderation failed', { err: e instanceof Error ? e.message : String(e) })
    return null
  }
}

/** NVIDIA Llama instruct — semantic IP screen (gpt-4o-mini alternative). */
export async function semanticNvidia(prompt: string): Promise<ModerationAiResult | null> {
  if (!NVIDIA_API_KEY) return null
  const text = prompt.trim()
  if (!text) return { verdict: 'approved', reasons: [] }

  try {
    const res = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        model: NVIDIA_SEMANTIC_MODEL,
        temperature: 0,
        max_tokens: 120,
        messages: [
          { role: 'system', content: SEMANTIC_MODERATION_SYSTEM },
          { role: 'user', content: text },
        ],
      }),
    })
    if (!res.ok) {
      logger.warn('nvidia semantic http error', {
        status: res.status,
        model: NVIDIA_SEMANTIC_MODEL,
      })
      return { verdict: 'flagged', reasons: ['semantic:nvidia:unavailable'] }
    }
    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    return parseSemanticModerationJson(json.choices?.[0]?.message?.content ?? '{}', 'nvidia')
  } catch (e) {
    logger.warn('nvidia semantic failed', { err: e instanceof Error ? e.message : String(e) })
    return { verdict: 'flagged', reasons: ['semantic:nvidia:error'] }
  }
}

function mapNvidiaSafety(raw: string): ModerationAiResult {
  const text = raw.replace(/<\/?think>/gi, '').trim()
  const unsafe = /User Safety:\s*unsafe/i.test(text)
  const catsLine = text.match(/Safety Categories:\s*(.+)/i)?.[1]?.trim() ?? ''
  const cats = catsLine
    ? catsLine
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : []

  if (!unsafe && !/User Safety:\s*safe/i.test(text) && text.length > 0) {
    logger.warn('nvidia safety parse ambiguous', { sample: text.slice(0, 160) })
    return { verdict: 'flagged', reasons: ['nvidia:parse'] }
  }

  if (!unsafe) return { verdict: 'approved', reasons: [] }

  const hard = cats.filter((c) => HARD_CATEGORY.some((re) => re.test(c)))
  if (hard.length) {
    return { verdict: 'blocked', reasons: hard.map((c) => `nvidia:${c}`) }
  }
  const reasons = cats.length ? cats.map((c) => `nvidia:${c}`) : ['nvidia:unsafe']
  return { verdict: 'flagged', reasons }
}
