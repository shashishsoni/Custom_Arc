import type { BlankTemplateSpec } from '@customarc/shared'
import type { UvBias } from './uv-bias'

/**
 * UV (0–1) → template-mm.
 * Bias must match the texture transform on that printable (`uvBiasForMesh`).
 */
export function uvToMm(
  u: number,
  v: number,
  { widthMm, heightMm }: { widthMm: number; heightMm: number },
  bias: UvBias = { flipU: false, flipV: false },
) {
  const uu = bias.flipU ? 1 - u : u
  const vv = bias.flipV ? 1 - v : v
  return {
    xMm: uu * widthMm,
    yMm: vv * heightMm,
  }
}

/** Positive modulo into [0, period). */
export function wrapMm(value: number, period: number) {
  if (period <= 0) return 0
  return ((value % period) + period) % period
}

/** Clamp height; wrap X for cylindrical printables. */
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
