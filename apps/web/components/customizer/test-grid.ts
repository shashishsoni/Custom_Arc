function cssVar(name: string, fallback: string) {
  if (typeof document === 'undefined') return fallback
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}

/** Numbered square grid for printable-surface UV validation (P1-07 / spec §5). */
export function drawTestGrid(
  ctx: CanvasRenderingContext2D,
  widthMm: number,
  heightMm: number,
  pxPerMm: number,
) {
  const w = Math.round(widthMm * pxPerMm)
  const h = Math.round(heightMm * pxPerMm)
  ctx.canvas.width = w
  ctx.canvas.height = h

  ctx.fillStyle = '#f4f0ec'
  ctx.fillRect(0, 0, w, h)

  const stepMm = 10
  const step = stepMm * pxPerMm
  const cols = Math.ceil(widthMm / stepMm)
  const rows = Math.ceil(heightMm / stepMm)

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * step
      const y = row * step
      const even = (row + col) % 2 === 0
      ctx.fillStyle = even ? '#e8e0d8' : '#f4f0ec'
      ctx.fillRect(x, y, step, step)

      ctx.fillStyle = '#8a7f76'
      ctx.font = `${Math.max(10, step * 0.28)}px system-ui`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${col},${row}`, x + step / 2, y + step / 2)
    }
  }

  const primary = cssVar('--primary', '#c45c6a')
  ctx.strokeStyle = primary
  ctx.lineWidth = Math.max(2, pxPerMm * 0.4)
  ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, w - ctx.lineWidth, h - ctx.lineWidth)
}
