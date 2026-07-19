import { z } from 'zod'

/**
 * Blank = a base product offered for customization, modeled as data + assets (decision 03).
 * Not code: adding a blank is config, not a release.
 */

/** Absolute URL or root-relative path (`/model/mug.glb`) — public web assets or CDN. */
export const assetRefSchema = z
  .string()
  .min(1)
  .refine(
    (v) => v.startsWith('/') || /^https?:\/\//i.test(v),
    'expected URL or root-relative path',
  )

export const blankTemplateSpecSchema = z.object({
  /** Printable area in mm. */
  printableAreaMm: z.object({
    widthMm: z.number().positive(),
    heightMm: z.number().positive(),
    /** Inset of the safe margin from each edge, in mm. */
    safeMarginMm: z.number().nonnegative(),
  }),
  /** Output pixel dimensions at 300 DPI (spec §5). */
  printPixels: z.object({
    widthPx: z.number().int().positive(),
    heightPx: z.number().int().positive(),
  }),
  /** UV aspect ratio of the printable surface = printPixels ratio. */
  uvAspectRatio: z.number().positive(),
  /** GLB with a clean single-island UV matching the template. */
  modelUrl: assetRefSchema,
  /** Flat template preview image (partner dieline), optional. */
  templateImageUrl: assetRefSchema.optional(),
  /**
   * Cylindrical / wrap products: layers that cross the left/right seam continue
   * on the other side (mug). Flat products (phone case) leave this false.
   */
  wrapHorizontal: z.boolean().default(false),
})
export type BlankTemplateSpec = z.infer<typeof blankTemplateSpecSchema>

export const blankVariantSchema = z.object({
  id: z.string().min(1),
  /** e.g. "11oz" for mug, "iphone-15" for phone case. */
  name: z.string().min(1),
  /** Partner SKU used at fulfillment. */
  partnerSku: z.string().min(1),
  /** Retail price in minor units (paise for INR). */
  priceMinor: z.number().int().nonnegative(),
  currency: z.enum(['INR', 'USD']),
})
export type BlankVariant = z.infer<typeof blankVariantSchema>

export const blankSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(['mug', 'phone_case']),
  template: blankTemplateSpecSchema,
  variants: z.array(blankVariantSchema).min(1),
})
export type Blank = z.infer<typeof blankSchema>

export const blankSummarySchema = blankSchema.pick({
  slug: true,
  name: true,
  category: true,
})
export type BlankSummary = z.infer<typeof blankSummarySchema>
