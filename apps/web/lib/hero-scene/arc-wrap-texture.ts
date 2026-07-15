import * as THREE from 'three'
import { cssVar } from '@/lib/css-var'

type Stroke = { token: '--accent' | '--accent-2'; y: number; h: number; open: number }

const STROKES: Stroke[] = [
  { token: '--accent', y: 0.22, h: 0.14, open: 0.55 },
  { token: '--accent-2', y: 0.38, h: 0.12, open: 0.48 },
  { token: '--accent', y: 0.52, h: 0.16, open: 0.62 },
  { token: '--accent-2', y: 0.68, h: 0.11, open: 0.5 },
]

/** Procedural CustomArc wrap — arc strokes from theme accent tokens. */
export function createArcWrapTexture(): THREE.CanvasTexture {
  const size = 1024
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas unavailable')

  ctx.fillStyle = cssVar('--bg-card')
  ctx.fillRect(0, 0, size, size)

  for (const stroke of STROKES) {
    paintArcStroke(ctx, size, cssVar(stroke.token), stroke)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

function paintArcStroke(
  ctx: CanvasRenderingContext2D,
  size: number,
  color: string,
  stroke: { y: number; h: number; open: number },
) {
  const cy = size * stroke.y
  const amp = size * stroke.h
  ctx.strokeStyle = color
  ctx.lineCap = 'round'
  ctx.lineWidth = size * 0.085
  ctx.globalAlpha = 0.88
  ctx.beginPath()
  for (let i = 0; i <= 64; i++) {
    const t = i / 64
    const x = size * (0.08 + t * 0.84)
    const y = cy + amp * 0.35 - Math.sin(t * Math.PI) * amp * stroke.open
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()
  ctx.globalAlpha = 0.25
  ctx.lineWidth = size * 0.12
  ctx.stroke()
  ctx.globalAlpha = 1
}
