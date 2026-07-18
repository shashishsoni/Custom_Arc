import * as THREE from 'three'
import { drawTestGrid } from './test-grid'

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

/** Hidden 2D canvas → CanvasTexture for the printable material (spec §5). */
export function createDesignTexture(widthMm: number, heightMm: number): DesignTexture {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2d context unavailable')

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.flipY = false
  texture.anisotropy = 4

  const paint = (marker: { xMm: number; yMm: number; widthMm: number; heightMm: number }) => {
    drawTestGrid(ctx, widthMm, heightMm, PREVIEW_PX_PER_MM)

    const x = marker.xMm * PREVIEW_PX_PER_MM
    const y = marker.yMm * PREVIEW_PX_PER_MM
    const w = marker.widthMm * PREVIEW_PX_PER_MM
    const h = marker.heightMm * PREVIEW_PX_PER_MM
    const primary = cssVar('--primary', '#c45c6a')

    ctx.fillStyle = primary
    ctx.fillRect(x, y, w, h)
    ctx.fillStyle = cssVar('--primary-foreground', '#fff')
    ctx.font = `bold ${Math.max(12, h * 0.35)}px system-ui`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('ART', x + w / 2, y + h / 2)

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
