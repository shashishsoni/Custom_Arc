'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Blank } from '@customarc/shared'
import { CustomizerScene } from './customizer-scene'
import type { Marker } from './blank-model'
import type { DesignTexture } from './design-texture'

function initialMarker(blank: Blank): Marker {
  const { widthMm, heightMm } = blank.template.printableAreaMm
  return {
    xMm: widthMm * 0.35,
    yMm: heightMm * 0.3,
    widthMm: widthMm * 0.3,
    heightMm: heightMm * 0.4,
  }
}

export function CustomizerView({ blank }: { blank: Blank }) {
  const [marker, setMarker] = useState(() => initialMarker(blank))
  const [design, setDesign] = useState<DesignTexture | null>(null)
  const flatHost = useRef<HTMLDivElement>(null)

  const onTextureReady = useCallback((tex: DesignTexture) => setDesign(tex), [])

  useEffect(() => {
    const host = flatHost.current
    if (!host || !design) return
    const { canvas } = design
    canvas.className = 'max-h-40 w-full max-w-xl rounded border border-border bg-card'
    host.replaceChildren(canvas)
    return () => {
      host.replaceChildren()
    }
  }, [design])

  const { widthMm, heightMm } = blank.template.printableAreaMm

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded border border-border bg-card md:aspect-[16/10]">
        <CustomizerScene
          blank={blank}
          marker={marker}
          onMarkerChange={setMarker}
          onTextureReady={onTextureReady}
        />
        <p className="pointer-events-none absolute bottom-3 left-3 text-xs font-bold tracking-widest text-primary uppercase">
          Drag on surface · orbit empty space
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="mb-2 text-xs font-bold tracking-widest text-primary uppercase">
            Flat template (same mm)
          </p>
          <div ref={flatHost} />
          {!design && <p className="text-sm text-fg-muted">Loading print template…</p>}
        </div>
        <p className="text-sm text-fg-muted">
          ART @ {marker.xMm.toFixed(1)}×{marker.yMm.toFixed(1)} mm · template {widthMm}×{heightMm}{' '}
          mm · {blank.variants.length} variants
        </p>
      </div>
    </div>
  )
}
