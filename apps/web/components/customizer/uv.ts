import type { BlankTemplateSpec } from '@customarc/shared'

/**
 * UV (0–1) → template-mm.
 * Design docs use top-left origin; GLTF UV is bottom-left.
 * U is flipped to match CanvasTexture.repeat.x = -1 (outside-readable art).
 */
export function uvToMm(
  u: number,
  v: number,
  { widthMm, heightMm }: { widthMm: number; heightMm: number },
) {
  return {
    xMm: (1 - u) * widthMm,
    yMm: v * heightMm,
  }
}

/** Positive modulo into [0, period). */
export function wrapMm(value: number, period: number) {
  if (period <= 0) return 0
  return ((value % period) + period) % period
}

/**
 * Clamp height to template; wrap X for cylindrical printable (seamless left↔right).
 */
export function clampLayerOrigin(
  xMm: number,
  yMm: number,
  layerW: number,
  layerH: number,
  template: Pick<BlankTemplateSpec['printableAreaMm'], 'widthMm' | 'heightMm'>,
) {
  return {
    xMm: wrapMm(xMm, template.widthMm),
    yMm: Math.min(Math.max(0, yMm), Math.max(0, template.heightMm - layerH)),
  }
}
