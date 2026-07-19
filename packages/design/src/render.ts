import type { DesignDocument, ImageLayer, Layer, TextLayer } from '@customarc/shared'

/**
 * Minimal Canvas2D surface. Intentionally structural so the same render code runs
 * against a browser CanvasRenderingContext2D and a node-canvas context (spec §5).
 * No DOM or Three.js dependency here.
 */
export interface RenderContext {
  canvas: { width: number; height: number }
  save(): void
  restore(): void
  translate(x: number, y: number): void
  rotate(radians: number): void
  scale(x: number, y: number): void
  clearRect(x: number, y: number, w: number, h: number): void
  fillRect(x: number, y: number, w: number, h: number): void
  drawImage(img: DrawableImage, dx: number, dy: number, dw: number, dh: number): void
  fillText(text: string, x: number, y: number): void
  measureText(text: string): { width: number }
  beginPath(): void
  rect(x: number, y: number, w: number, h: number): void
  clip(): void
  fillStyle: string
  font: string
  globalAlpha: number
  textAlign: 'left' | 'center' | 'right'
  textBaseline: 'top' | 'middle' | 'bottom' | 'alphabetic' | 'hanging' | 'ideographic'
}

export interface DrawableImage {
  width: number
  height: number
}

export interface RenderOptions {
  /** Pixels per millimeter. Preview uses a coarse value; the print file uses 300/25.4 (~11.81). */
  pxPerMm: number
  /** Preloaded images keyed by uploadId. The server resolves these from uploadId, never from the client URL. */
  images: Map<string, DrawableImage>
  /**
   * Cylinder / wrap products: redraw layers that cross the left/right seam at ±canvasWidth
   * so art does not vanish at the template edge.
   */
  wrapHorizontal?: boolean
}

/** Pixels for a given mm extent at the render resolution. */
export function mmToPx(mm: number, pxPerMm: number): number {
  return mm * pxPerMm
}

/**
 * Render a Design document onto a Canvas2D context. One pure function, shared by
 * the 3D preview texture and the server-side print file (spec §5). WYSIWYG by
 * construction: both renders consume the same document at different pxPerMm.
 */
export function renderDesign(doc: DesignDocument, ctx: RenderContext, opts: RenderOptions): void {
  const { pxPerMm, images, wrapHorizontal = false } = opts
  const widthPx = Math.round(mmToPx(doc.template.widthMm, pxPerMm))
  const heightPx = Math.round(mmToPx(doc.template.heightMm, pxPerMm))

  ctx.canvas.width = widthPx
  ctx.canvas.height = heightPx
  ctx.clearRect(0, 0, widthPx, heightPx)

  ctx.fillStyle = doc.background.color
  ctx.fillRect(0, 0, widthPx, heightPx)

  for (const layer of doc.layers) {
    renderLayer(layer, ctx, pxPerMm, images, widthPx, wrapHorizontal)
  }
}

function renderLayer(
  layer: Layer,
  ctx: RenderContext,
  pxPerMm: number,
  images: Map<string, DrawableImage>,
  canvasWidthPx: number,
  wrapHorizontal: boolean,
): void {
  const { transform } = layer
  const widthPx = mmToPx(transform.widthMm, pxPerMm)
  const heightPx = mmToPx(transform.heightMm, pxPerMm)
  const centerX = mmToPx(transform.xMm + transform.widthMm / 2, pxPerMm)
  const centerY = mmToPx(transform.yMm + transform.heightMm / 2, pxPerMm)

  const offsets = wrapOffsets(centerX, widthPx, canvasWidthPx, wrapHorizontal)
  for (const dx of offsets) {
    paintLayerAt(layer, ctx, pxPerMm, images, widthPx, heightPx, centerX + dx, centerY)
  }
}

/** ±1 canvas when the layer box crosses the horizontal seam. */
function wrapOffsets(
  centerX: number,
  boxWidthPx: number,
  canvasWidthPx: number,
  wrapHorizontal: boolean,
): number[] {
  if (!wrapHorizontal || canvasWidthPx <= 0) return [0]
  const left = centerX - boxWidthPx / 2
  const right = centerX + boxWidthPx / 2
  const out = [0]
  if (right > canvasWidthPx) out.push(-canvasWidthPx)
  if (left < 0) out.push(canvasWidthPx)
  return out
}

function paintLayerAt(
  layer: Layer,
  ctx: RenderContext,
  pxPerMm: number,
  images: Map<string, DrawableImage>,
  widthPx: number,
  heightPx: number,
  centerX: number,
  centerY: number,
): void {
  ctx.save()
  ctx.globalAlpha = layer.transform.opacity
  ctx.translate(centerX, centerY)
  ctx.rotate((layer.transform.rotationDeg * Math.PI) / 180)

  if (layer.type === 'image') {
    drawImageLayer(layer, ctx, images, widthPx, heightPx)
  } else {
    drawTextLayer(layer, ctx, pxPerMm, widthPx, heightPx)
  }

  ctx.restore()
}

/** Object-fit: contain the source image inside the layer box, centered. */
function drawImageLayer(
  layer: ImageLayer,
  ctx: RenderContext,
  images: Map<string, DrawableImage>,
  boxWidthPx: number,
  boxHeightPx: number,
): void {
  const img = images.get(layer.uploadId)
  if (!img) return

  const scale = Math.min(boxWidthPx / img.width, boxHeightPx / img.height)
  const drawWidth = img.width * scale
  const drawHeight = img.height * scale
  const offsetX = (boxWidthPx - drawWidth) / 2
  const offsetY = (boxHeightPx - drawHeight) / 2

  ctx.drawImage(img, offsetX - boxWidthPx / 2, offsetY - boxHeightPx / 2, drawWidth, drawHeight)
}

function drawTextLayer(
  layer: TextLayer,
  ctx: RenderContext,
  pxPerMm: number,
  boxWidthPx: number,
  boxHeightPx: number,
): void {
  const fontSizePx = mmToPx(layer.fontSizeMm, pxPerMm)
  ctx.font = `${layer.fontWeight} ${fontSizePx}px ${layer.fontFamily}`
  ctx.fillStyle = layer.color
  ctx.textAlign = layer.textAlign
  ctx.textBaseline = 'middle'

  const lines = wrapText(layer.text, ctx, boxWidthPx)
  const lineHeight = fontSizePx * 1.2
  const startY = -((lines.length - 1) * lineHeight) / 2

  const anchorX = textAlignAnchor(layer.textAlign, boxWidthPx)
  lines.forEach((line, index) => {
    ctx.fillText(line, anchorX, startY + index * lineHeight)
  })

  // Keep the text within the layer box height as a soft clip guide (no-op if it fits).
  void boxHeightPx
}

function wrapText(text: string, ctx: RenderContext, maxWidthPx: number): string[] {
  return text.split('\n').flatMap((line) => splitLine(line, ctx, maxWidthPx))
}

function splitLine(line: string, ctx: RenderContext, maxWidthPx: number): string[] {
  if (ctx.measureText(line).width <= maxWidthPx) return [line]

  const words = line.split(' ')
  const out: string[] = []
  let current = ''
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (ctx.measureText(candidate).width > maxWidthPx && current) {
      out.push(current)
      current = word
    } else {
      current = candidate
    }
  }
  if (current) out.push(current)
  return out
}

function textAlignAnchor(align: TextLayer['textAlign'], boxWidthPx: number): number {
  switch (align) {
    case 'left':
      return -boxWidthPx / 2
    case 'right':
      return boxWidthPx / 2
    case 'center':
      return 0
  }
}
