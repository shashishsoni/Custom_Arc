import { cssVar } from '@/lib/css-var'

/** Dot-plate print preview — dots only (no cream fill, no edge stroke). */
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

  ctx.clearRect(0, 0, w, h)

  const step = Math.max(6, Math.round(4 * pxPerMm))
  const dot = Math.max(1, Math.round(pxPerMm * 0.35))
  const color = cssVar('--border', '#d4cbc8')

  ctx.fillStyle = color
  for (let y = step / 2; y < h; y += step) {
    for (let x = step / 2; x < w; x += step) {
      ctx.beginPath()
      ctx.arc(x, y, dot, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}
