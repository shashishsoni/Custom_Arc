'use client'

import { useEffect, useRef } from 'react'
import type { DesignDocument } from '@customarc/shared'
import { renderDesign, type DrawableImage } from '@customarc/design'
import { asRenderContext } from '@/lib/render'

/**
 * Foundation stub for the 3D customizer. The real r3f scene + raycast→UV drag land in issue 07;
 * the tools (upload/text/color) in issue 08. Here we mount the shared design-render pipeline so
 * the WYSIWYG contract is exercisable end-to-end against the server print-file path.
 */
export function CustomizerStub({ slug }: { slug: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const doc: DesignDocument = {
      version: 1,
      blankSlug: slug,
      template: { widthMm: 200, heightMm: 90 },
      background: { color: '#0b0d10' },
      layers: [
        {
          id: 'title',
          type: 'text',
          text: 'CustomArc',
          fontFamily: 'system-ui',
          fontSizeMm: 28,
          color: '#6ea8fe',
          fontWeight: 'bold',
          textAlign: 'center',
          transform: { xMm: 40, yMm: 30, widthMm: 120, heightMm: 30, rotationDeg: 0, opacity: 1 },
        },
      ],
    }

    renderDesign(doc, asRenderContext(ctx), {
      pxPerMm: 4,
      images: new Map<string, DrawableImage>(),
    })
  }, [slug])

  return (
    <div className="mt-6">
      <canvas
        ref={canvasRef}
        className="w-full max-w-[800px] rounded-xl border border-border bg-bg-card"
      />
      <p className="mt-3 text-sm text-fg-muted">
        2D preview via the shared <code className="text-fg">@customarc/design</code> render — the
        same function the server uses for the print file. The 3D r3f customizer mounts here in
        issue 07.
      </p>
    </div>
  )
}
