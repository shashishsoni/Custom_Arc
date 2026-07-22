import type { BlankTemplateSpec, DesignDocument } from '@customarc/shared'
import { badRequest } from '../../errors.ts'
import { logger } from '../../logger.ts'
import { PRINT_DPI } from './render.ts'

export type PrintValidation = {
  ok: boolean
  validated: boolean
  reasons: string[]
  widthPx: number
  heightPx: number
}

/**
 * Issue 15 — hard: pixel dims @ 300 DPI match blank template.
 * Soft: layers that sit in the bleed (outside safe inset) are logged, not rejected
 * (full-bleed artwork is valid; safe margin is a placement guide).
 */
export function validatePrintFile(input: {
  doc: DesignDocument
  template: BlankTemplateSpec
  widthPx: number
  heightPx: number
  dpi: number
}): PrintValidation {
  const hard: string[] = []
  const soft: string[] = []
  const { printPixels, printableAreaMm, wrapHorizontal } = input.template
  const expectedW = printPixels.widthPx
  const expectedH = printPixels.heightPx

  if (input.dpi !== PRINT_DPI) hard.push(`dpi:${input.dpi}!=${PRINT_DPI}`)
  if (Math.abs(input.widthPx - expectedW) > 1) hard.push(`widthPx:${input.widthPx}!=${expectedW}`)
  if (Math.abs(input.heightPx - expectedH) > 1) hard.push(`heightPx:${input.heightPx}!=${expectedH}`)

  const areaW = printableAreaMm.widthMm
  const areaH = printableAreaMm.heightMm
  if (Math.abs(input.doc.template.widthMm - areaW) > 0.01) {
    hard.push(`docWidthMm:${input.doc.template.widthMm}!=${areaW}`)
  }
  if (Math.abs(input.doc.template.heightMm - areaH) > 0.01) {
    hard.push(`docHeightMm:${input.doc.template.heightMm}!=${areaH}`)
  }

  const m = printableAreaMm.safeMarginMm
  for (const layer of input.doc.layers) {
    const { xMm, yMm, widthMm, heightMm } = layer.transform
    const top = yMm
    const bottom = yMm + heightMm
    const left = xMm
    const right = xMm + widthMm

    // Completely outside printable area → hard fail
    if (right < 0 || left > areaW || bottom < 0 || top > areaH) {
      hard.push(`outside:${layer.id}`)
      continue
    }

    if (top < m - 0.01 || bottom > areaH - m + 0.01) soft.push(`bleed:y:${layer.id}`)
    if (!wrapHorizontal && (left < m - 0.01 || right > areaW - m + 0.01)) {
      soft.push(`bleed:x:${layer.id}`)
    }
  }

  if (soft.length) {
    logger.info('print file soft margin notes', { notes: soft })
  }

  const ok = hard.length === 0
  return {
    ok,
    validated: ok,
    reasons: hard,
    widthPx: input.widthPx,
    heightPx: input.heightPx,
  }
}

export function assertPrintValid(v: PrintValidation): void {
  if (!v.ok) {
    throw badRequest(`Print file failed validation: ${v.reasons.join('; ')}`)
  }
}
