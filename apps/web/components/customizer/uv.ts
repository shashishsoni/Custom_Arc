import type { BlankTemplateSpec } from '@customarc/shared'

/** UV (0–1) → template-mm. Design docs use top-left origin; GLTF UV is bottom-left. */
export function uvToMm(
  u: number,
  v: number,
  { widthMm, heightMm }: { widthMm: number; heightMm: number },
) {
  return {
    xMm: u * widthMm,
    yMm: (1 - v) * heightMm,
  }
}

export function clampLayerOrigin(
  xMm: number,
  yMm: number,
  layerW: number,
  layerH: number,
  template: Pick<BlankTemplateSpec['printableAreaMm'], 'widthMm' | 'heightMm'>,
) {
  return {
    xMm: Math.min(Math.max(0, xMm), Math.max(0, template.widthMm - layerW)),
    yMm: Math.min(Math.max(0, yMm), Math.max(0, template.heightMm - layerH)),
  }
}
