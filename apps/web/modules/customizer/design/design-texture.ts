import * as THREE from 'three'
import type { DesignDocument } from '@customarc/shared'
import { renderDesign, type DrawableImage, type RenderContext } from '@customarc/design'

/**
 * Preview density. Was 4 (~840×380 on a mug) → looked ~144p on the mesh.
 * ~10 px/mm ≈ 2100×950 — sharp on screen, still lighter than print (300 DPI).
 */
const PREVIEW_PX_PER_MM = 10

export type DesignTexture = {
  canvas: HTMLCanvasElement
  texture: THREE.CanvasTexture
  pxPerMm: number
  paint: (doc: DesignDocument, images: Map<string, DrawableImage>) => void
  dispose: () => void
}

/** Hidden 2D canvas → CanvasTexture via packages/design (spec §5 WYSIWYG). */
export function createDesignTexture(opts?: { wrapHorizontal?: boolean }): DesignTexture {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { alpha: true })
  if (!ctx) throw new Error('2d context unavailable')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  const wrapHorizontal = opts?.wrapHorizontal ?? false
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.flipY = false
  texture.anisotropy = 16
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = true

  const paint = (doc: DesignDocument, images: Map<string, DrawableImage>) => {
    renderDesign(doc, ctx as unknown as RenderContext, {
      pxPerMm: PREVIEW_PX_PER_MM,
      images,
      wrapHorizontal,
    })  
    texture.needsUpdate = true
  }

  return {
    canvas,
    texture,
    pxPerMm: PREVIEW_PX_PER_MM,
    paint,
    dispose: () => texture.dispose(),
  }
}
