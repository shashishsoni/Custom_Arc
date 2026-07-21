import type { ModerationAiResult } from '@customarc/shared'
import { moderateOpenAi, semanticOpenAi, type ModerateInput } from './openai.ts'
import { moderateNvidia, semanticNvidia } from './nvidia.ts'

export type { ModerateInput, ModerationAiResult }

/** Prefer OpenAI when keyed; else NVIDIA NIM. */
export async function moderateContent(input: ModerateInput): Promise<ModerationAiResult | null> {
  const openai = await moderateOpenAi(input)
  if (openai) return openai
  return moderateNvidia(input)
}

/** Prefer OpenAI gpt-4o-mini; else NVIDIA Llama instruct. */
export async function semanticPromptCheck(prompt: string): Promise<ModerationAiResult | null> {
  const text = prompt.trim()
  if (!text) return { verdict: 'approved', reasons: [] }

  const openai = await semanticOpenAi(text)
  if (openai) return openai
  return semanticNvidia(text)
}
