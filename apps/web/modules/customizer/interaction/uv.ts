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

type TemplateSize = Pick<BlankTemplateSpec['printableAreaMm'], 'widthMm' | 'heightMm'>

/**
 * Clamp height always.
 * X: wrap around for cylindrical blanks; hard-clamp for flat blanks (phone case).
 */
export function clampLayerOrigin(
  xMm: number,
  yMm: number,
  layerW: number,
  layerH: number,
  template: TemplateSize,
  wrapX = false,
) {
  const y = Math.min(Math.max(0, yMm), Math.max(0, template.heightMm - layerH))
  if (wrapX) {
    return { xMm: wrapMm(xMm, template.widthMm), yMm: y }
  }
  return {
    xMm: Math.min(Math.max(0, xMm), Math.max(0, template.widthMm - layerW)),
    yMm: y,
  }
}
