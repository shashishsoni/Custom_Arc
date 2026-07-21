import { createCanvas, loadImage, type SKRSContext2D } from '@napi-rs/canvas'
import { mmToPx, renderDesign, type DrawableImage, type RenderContext } from '@customarc/design'
import type { DesignDocument } from '@customarc/shared'

/** Print resolution — spec §5 (300 DPI). */
export const PRINT_DPI = 300
export const PRINT_PX_PER_MM = PRINT_DPI / 25.4

/**
 * Render Design JSON → PNG buffer at 300 DPI (issue 15).
 * Same `renderDesign` as the browser preview — WYSIWYG by construction.
 */
export async function renderPrintPng(input: {
  doc: DesignDocument
  images: Map<string, DrawableImage>
  wrapHorizontal: boolean
}): Promise<{ png: Buffer; widthPx: number; heightPx: number }> {
  const widthPx = Math.round(mmToPx(input.doc.template.widthMm, PRINT_PX_PER_MM))
  const heightPx = Math.round(mmToPx(input.doc.template.heightMm, PRINT_PX_PER_MM))

  const canvas = createCanvas(widthPx, heightPx)
  const ctx = canvas.getContext('2d')
  renderDesign(input.doc, asRenderContext(ctx), {
    pxPerMm: PRINT_PX_PER_MM,
    images: input.images,
    wrapHorizontal: input.wrapHorizontal,
  })

  return { png: Buffer.from(canvas.toBuffer('image/png')), widthPx, heightPx }
}

export async function loadDrawableImage(bytes: Buffer): Promise<DrawableImage> {
  return loadImage(bytes)
}

function asRenderContext(ctx: SKRSContext2D): RenderContext {
  return ctx as unknown as RenderContext
}
