import * as THREE from 'three'
import type { DesignDocument } from '@customarc/shared'
import { renderDesign, type DrawableImage, type RenderContext } from '@customarc/design'

const PREVIEW_PX_PER_MM = 4

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
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2d context unavailable')

  const wrapHorizontal = opts?.wrapHorizontal ?? false
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.flipY = false
  texture.anisotropy = 4

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
