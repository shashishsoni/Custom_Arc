import {
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_AI_ENABLED,
  CLOUDFLARE_AI_TOKEN,
  FAL_ENABLED,
  FAL_KEY,
} from '@customarc/shared/constants'
import { badRequest } from '../../errors.ts'
import { logger } from '../../logger.ts'

export type GeneratedImage = {
  bytes: Buffer
  provider: string
  meta: Record<string, unknown>
}

export interface ImageGenerator {
  generate(prompt: string): Promise<GeneratedImage>
}

/** FLUX.1 schnell via fal.ai (+ optional ESRGAN). Spec §6. */
export class FalFluxGenerator implements ImageGenerator {
  async generate(prompt: string): Promise<GeneratedImage> {
    if (!FAL_KEY) throw badRequest('FAL_KEY is not configured')

    const flux = await falRun<{ images?: { url?: string }[] }>('fal-ai/flux/schnell', {
      prompt,
      image_size: 'square_hd',
      num_images: 1,
      enable_safety_checker: true,
    })
    const url = flux.images?.[0]?.url
    if (!url) throw badRequest('fal returned no image')

    let imageUrl = url
    try {
      const up = await falRun<{ image?: { url?: string } }>('fal-ai/esrgan', {
        image_url: url,
        scale: 2,
      })
      if (up.image?.url) imageUrl = up.image.url
    } catch (e) {
      logger.warn('fal esrgan skipped', { err: e instanceof Error ? e.message : String(e) })
    }

    const bytes = await downloadBytes(imageUrl)
    return { bytes, provider: 'fal:flux-schnell', meta: { imageUrl } }
  }
}

/** Cloudflare Workers AI FLUX.1 schnell (primary / free-tier). */
export class CloudflareFluxGenerator implements ImageGenerator {
  async generate(prompt: string): Promise<GeneratedImage> {
    if (!CLOUDFLARE_AI_ENABLED) throw badRequest('Cloudflare AI is not configured')

    const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_AI_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      logger.warn('cloudflare ai failed', { status: res.status, body: body.slice(0, 200) })
      throw badRequest('Cloudflare AI generation failed')
    }

    const ct = res.headers.get('content-type') ?? ''
    if (ct.includes('application/json')) {
      const json = (await res.json()) as {
        result?: { image?: string } | string
        success?: boolean
      }
      const b64 =
        typeof json.result === 'string'
          ? json.result
          : typeof json.result?.image === 'string'
            ? json.result.image
            : null
      if (!b64) throw badRequest('Cloudflare AI returned no image')
      return {
        bytes: Buffer.from(b64, 'base64'),
        provider: 'cloudflare:flux-schnell',
        meta: {},
      }
    }

    return {
      bytes: Buffer.from(await res.arrayBuffer()),
      provider: 'cloudflare:flux-schnell',
      meta: {},
    }
  }
}

/** Prefer Cloudflare Workers AI (free tier); fall back to fal on failure. */
export function createImageGenerator(): ImageGenerator {
  if (!FAL_ENABLED && !CLOUDFLARE_AI_ENABLED) {
    throw badRequest('No AI provider configured (set FAL_KEY or Cloudflare AI env)')
  }
  return {
    async generate(prompt: string) {
      if (CLOUDFLARE_AI_ENABLED) {
        try {
          return await new CloudflareFluxGenerator().generate(prompt)
        } catch (e) {
          if (!FAL_ENABLED) throw e
          logger.warn('Cloudflare AI failed — trying fal', {
            err: e instanceof Error ? e.message : String(e),
          })
        }
      }
      return new FalFluxGenerator().generate(prompt)
    },
  }
}

async function falRun<T>(model: string, input: Record<string, unknown>): Promise<T> {
  const res = await fetch(`https://fal.run/${model}`, {
    method: 'POST',
    headers: {
      Authorization: `Key ${FAL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    logger.warn('fal run failed', { model, status: res.status, body: body.slice(0, 200) })
    throw badRequest(`fal ${model} failed`)
  }
  return (await res.json()) as T
}

async function downloadBytes(url: string): Promise<Buffer> {
  const res = await fetch(url)
  if (!res.ok) throw badRequest('Could not download generated image')
  return Buffer.from(await res.arrayBuffer())
}
