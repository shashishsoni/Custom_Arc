import { z } from 'zod'

/** API envelope + cross-cutting request/response contracts (spec §7.5 — strict validation at boundaries). */

export const apiErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z.unknown().optional(),
})
export type ApiError = z.infer<typeof apiErrorSchema>

export function ok<T>(data: T): { success: true; data: T } {
  return { success: true, data }
}
export function err(error: string, details?: unknown): ApiError {
  return { success: false, error, details }
}

export const bulkLeadRequestSchema = z.object({
  email: z.email(),
  note: z.string().min(1).max(2000),
})
export type BulkLeadRequest = z.infer<typeof bulkLeadRequestSchema>

export const generationRequestSchema = z.object({
  designId: z.string().min(1),
  prompt: z.string().min(1).max(1000),
})
export type GenerationRequest = z.infer<typeof generationRequestSchema>

/** POST /uploads response — previewUrl is a short-lived signed URL (spec §7.4). */
export const uploadResultSchema = z.object({
  id: z.string().min(1),
  previewUrl: z.url(),
  mimeType: z.string().min(1),
  widthPx: z.number().int().positive(),
  heightPx: z.number().int().positive(),
  sizeBytes: z.number().int().nonnegative(),
})
export type UploadResult = z.infer<typeof uploadResultSchema>

/** POST/PATCH /designs — id used for subsequent patches. */
export const savedDesignSchema = z.object({
  id: z.string().min(1),
  blankId: z.string().min(1),
  name: z.string().nullable(),
})
export type SavedDesign = z.infer<typeof savedDesignSchema>
