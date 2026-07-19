import * as THREE from 'three'
import { drawTestGrid } from './test-grid'
import { wrapMm } from './uv'

const PREVIEW_PX_PER_MM = 4

function cssVar(name: string, fallback: string) {
  if (typeof document === 'undefined') return fallback
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}

export type DesignTexture = {
  canvas: HTMLCanvasElement
  texture: THREE.CanvasTexture
  pxPerMm: number
  paint: (marker: { xMm: number; yMm: number; widthMm: number; heightMm: number }) => void
  dispose: () => void
}

/** Draw fill + label at x and again at x±canvasW when the card straddles the seam. */
function paintWrappedCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  canvasW: number,
  fill: string,
  label: string,
  labelColor: string,
) {
  const drawAt = (ox: number) => {
    ctx.fillStyle = fill
    ctx.fillRect(ox, y, w, h)
    ctx.fillStyle = labelColor
    ctx.font = `bold ${Math.max(12, h * 0.35)}px system-ui`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, ox + w / 2, y + h / 2)
  }

  drawAt(x)
  if (x + w > canvasW) drawAt(x - canvasW)
  if (x < 0) drawAt(x + canvasW)
}

/** Hidden 2D canvas → CanvasTexture for the printable material (spec §5). */
export function createDesignTexture(widthMm: number, heightMm: number): DesignTexture {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2d context unavailable')

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.flipY = false
  // Mug UV unwrap reads mirrored from outside — flip U so ART matches flat template.
  texture.wrapS = THREE.RepeatWrapping
  texture.repeat.x = -1
  texture.offset.x = 1
  texture.anisotropy = 4

  const paint = (marker: { xMm: number; yMm: number; widthMm: number; heightMm: number }) => {
    drawTestGrid(ctx, widthMm, heightMm, PREVIEW_PX_PER_MM)

    const canvasW = Math.round(widthMm * PREVIEW_PX_PER_MM)
    const x = wrapMm(marker.xMm, widthMm) * PREVIEW_PX_PER_MM
    const y = marker.yMm * PREVIEW_PX_PER_MM
    const w = marker.widthMm * PREVIEW_PX_PER_MM
    const h = marker.heightMm * PREVIEW_PX_PER_MM

    paintWrappedCard(
      ctx,
      x,
      y,
      w,
      h,
      canvasW,
      cssVar('--primary', '#c45c6a'),
      'ART',
      cssVar('--primary-foreground', '#fff'),
    )

    texture.needsUpdate = true
  }

  paint({
    xMm: widthMm * 0.35,
    yMm: heightMm * 0.3,
    widthMm: widthMm * 0.3,
    heightMm: heightMm * 0.4,
  })

  return {
    canvas,
    texture,
    pxPerMm: PREVIEW_PX_PER_MM,
    paint,
    dispose: () => texture.dispose(),
  }
}
