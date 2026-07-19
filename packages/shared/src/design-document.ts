import { z } from 'zod'

/**
 * Design document — the single source of truth for a customization.
 * Layers carry transforms in the print template's physical coordinate space (mm),
 * so the 3D preview and the print file are two renders of the same document (spec §5).
 * Saved as JSONB on the Design row.
 */

export const designDocumentVersionSchema = z.literal(1)
export type DesignDocumentVersion = z.infer<typeof designDocumentVersionSchema>

export const millimetersSchema = z.number().finite().nonnegative()
export const colorHexSchema = z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)

export const templateSizeSchema = z.object({
  widthMm: millimetersSchema,
  heightMm: millimetersSchema,
})
export type TemplateSize = z.infer<typeof templateSizeSchema>

/** Transform in template-mm space. x/y is the layer's top-left; rotation is about the center. */
export const layerTransformSchema = z.object({
  xMm: z.number(),
  yMm: z.number(),
  widthMm: millimetersSchema,
  heightMm: millimetersSchema,
  rotationDeg: z.number(),
  opacity: z.number().min(0).max(1),
})
export type LayerTransform = z.infer<typeof layerTransformSchema>

export const baseLayerSchema = z.object({
  id: z.string().min(1),
  transform: layerTransformSchema,
})

export const imageLayerSchema = baseLayerSchema.extend({
  type: z.literal('image'),
  uploadId: z.string().min(1),
  /** Signed URL for preview only; the server re-resolves from uploadId for the print file. */
  previewUrl: z.url(),
  naturalWidthPx: z.number().int().positive(),
  naturalHeightPx: z.number().int().positive(),
})
export type ImageLayer = z.infer<typeof imageLayerSchema>

export const textLayerSchema = baseLayerSchema.extend({
  type: z.literal('text'),
  text: z.string().min(1).max(200),
  fontFamily: z.string().min(1),
  fontSizeMm: millimetersSchema.positive(),
  color: colorHexSchema,
  fontWeight: z.enum(['normal', 'bold']),
  textAlign: z.enum(['left', 'center', 'right']),
})
export type TextLayer = z.infer<typeof textLayerSchema>

export const layerSchema = z.discriminatedUnion('type', [imageLayerSchema, textLayerSchema])
export type Layer = z.infer<typeof layerSchema>

export const designDocumentSchema = z.object({
  version: designDocumentVersionSchema,
  blankSlug: z.string().min(1),
  template: templateSizeSchema,
  background: z.object({ color: colorHexSchema }),
  layers: z.array(layerSchema).max(16),
})
export type DesignDocument = z.infer<typeof designDocumentSchema>

export function parseDesignDocument(input: unknown): DesignDocument {
  return designDocumentSchema.parse(input)
}

/** Empty design for a blank — white background, no layers (P1-08 tools fill layers). */
export function createEmptyDesign(blankSlug: string, widthMm: number, heightMm: number): DesignDocument {
  return {
    version: 1,
    blankSlug,
    template: { widthMm, heightMm },
    background: { color: '#ffffff' },
    layers: [],
  }
}
