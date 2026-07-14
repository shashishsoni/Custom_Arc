import { z } from 'zod'

/**
 * Blank = a base product offered for customization, modeled as data + assets (decision 03).
 * Not code: adding a blank is config, not a release.
 */

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
  /** GLB asset URL with a clean single-island UV matching the template. */
  modelUrl: z.url(),
  /** Flat template preview image (the partner dieline), for reference. */
  templateImageUrl: z.url().optional(),
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
