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

export const orderStateSchema = z.enum([
  'designing',
  'paid',
  'in_production',
  'shipped',
  'delivered',
  'cancelled',
])
export type OrderState = z.infer<typeof orderStateSchema>

/** POST /orders — create order for a saved design (no AI). */
export const createOrderRequestSchema = z.object({
  designId: z.string().min(1),
  blankVariantId: z.string().min(1),
})
export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>

export const orderSummarySchema = z.object({
  id: z.string().min(1),
  state: orderStateSchema,
  totalMinor: z.number().int().nonnegative(),
  currency: z.string().min(1),
  razorpayOrderId: z.string().nullable(),
  partner: z.string().nullable().optional(),
  partnerOrderId: z.string().nullable().optional(),
})
export type OrderSummary = z.infer<typeof orderSummarySchema>

/** GET /orders/:id/tracking */
export const orderTrackingStatusSchema = z.object({
  id: z.string().min(1),
  state: orderStateSchema,
  totalMinor: z.number().int().nonnegative(),
  currency: z.string().min(1),
  partner: z.string().nullable(),
  partnerOrderId: z.string().nullable(),
  trackingNumber: z.string().nullable(),
  carrier: z.string().nullable(),
  shippedAt: z.string().nullable(),
  deliveredAt: z.string().nullable(),
  updatedAt: z.string().min(1),
})
export type OrderTrackingStatus = z.infer<typeof orderTrackingStatusSchema>

/** POST /orders/:id/fulfill — partner submit result */
export const fulfillmentSummarySchema = z.object({
  orderId: z.string().min(1),
  state: z.string().min(1),
  partner: z.string().min(1),
  partnerOrderId: z.string().min(1),
  mode: z.enum(['sandbox', 'live']),
})
export type FulfillmentSummary = z.infer<typeof fulfillmentSummarySchema>

/** POST /orders/:id/checkout */
export const checkoutSessionSchema = z.object({
  orderId: z.string().min(1),
  mode: z.enum(['razorpay', 'mock']),
  amountMinor: z.number().int().positive(),
  currency: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayKeyId: z.string().optional(),
})
export type CheckoutSession = z.infer<typeof checkoutSessionSchema>

/** POST /orders/:id/confirm — Razorpay success payload or mock. */
export const confirmPaymentRequestSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('razorpay'),
    razorpayOrderId: z.string().min(1),
    razorpayPaymentId: z.string().min(1),
    razorpaySignature: z.string().min(1),
  }),
  z.object({ mode: z.literal('mock') }),
])
export type ConfirmPaymentRequest = z.infer<typeof confirmPaymentRequestSchema>

/** GET /orders/:id/print-files */
export const printFileSummarySchema = z.object({
  id: z.string().min(1),
  orderItemId: z.string().min(1),
  widthPx: z.number().int().positive(),
  heightPx: z.number().int().positive(),
  dpi: z.number().int().positive(),
  format: z.string().min(1),
  validated: z.boolean(),
})
export type PrintFileSummary = z.infer<typeof printFileSummarySchema>

/** GET /moderation/designs/:id/gate */
export const printGateResultSchema = z.object({
  ok: z.boolean(),
  designId: z.string().min(1),
  reasons: z.array(z.string()),
})
export type PrintGateResult = z.infer<typeof printGateResultSchema>

