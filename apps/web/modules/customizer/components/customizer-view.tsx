'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Blank, DesignDocument } from '@customarc/shared'
import { CustomizerScene } from '../scene'
import { emptyDocForBlank, patchTransform } from '../design/design-doc'
import type { DesignTexture } from '../design/design-texture'
import { ToolsPanel } from '../tools'
import { useDesignImages } from '../design/use-design-images'
import type { CustomizerCamera, CustomizerModelPose } from '../scene/view-config'
import { SaveDesignBar } from './save-design-bar'

type Props = {
  blank: Blank
  camera?: CustomizerCamera
  model?: CustomizerModelPose
}

export function CustomizerView({ blank, camera, model }: Props) {
  const [doc, setDoc] = useState<DesignDocument>(() => emptyDocForBlank(blank))
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null)
  const [texture, setTexture] = useState<DesignTexture | null>(null)
  const [activeZone, setActiveZone] = useState<string | null>(null)
  const [designId, setDesignId] = useState<string | null>(null)
  const flatHost = useRef<HTMLDivElement>(null)
  const images = useDesignImages(doc)

  const selected = useMemo(
    () => doc.layers.find((l) => l.id === selectedLayerId) ?? null,
    [doc.layers, selectedLayerId],
  )

  const layerBox = selected
    ? { widthMm: selected.transform.widthMm, heightMm: selected.transform.heightMm }
    : null

  const onTextureReady = useCallback((tex: DesignTexture) => setTexture(tex), [])

  const onLayerOrigin = useCallback(
    (origin: { xMm: number; yMm: number }) => {
      if (!selectedLayerId) return
      setDoc((prev) => patchTransform(prev, selectedLayerId, origin))
    },
    [selectedLayerId],
  )

  useEffect(() => {
    const host = flatHost.current
    if (!host || !texture) return
    const { canvas } = texture
    canvas.className = 'max-h-40 w-full max-w-xl rounded border border-border bg-transparent'
    host.replaceChildren(canvas)
    return () => {
      host.replaceChildren()
    }
  }, [texture])

  const { widthMm, heightMm } = blank.template.printableAreaMm

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded border border-border bg-card md:aspect-[16/10]">
          <CustomizerScene
            blank={blank}
            doc={doc}
            images={images}
            layerBox={layerBox}
            onLayerOrigin={onLayerOrigin}
            onTextureReady={onTextureReady}
            onActiveZone={setActiveZone}
            camera={camera}
            model={model}
          />
          <p className="pointer-events-none absolute bottom-3 left-3 text-xs font-bold tracking-widest text-primary uppercase">
            {activeZone ? `Active · ${activeZone}` : 'Click a print zone'} · drag selected layer
          </p>
        </div>

        <div className="space-y-4">
          <ToolsPanel
            blank={blank}
            doc={doc}
            selectedLayerId={selectedLayerId}
            onDocChange={setDoc}
            onSelectLayer={setSelectedLayerId}
          />
          <SaveDesignBar
            blankSlug={blank.slug}
            doc={doc}
            designId={designId}
            onSaved={setDesignId}
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="mb-2 text-xs font-bold tracking-widest text-primary uppercase">
            Flat template (same mm)
          </p>
          <div ref={flatHost} className="max-w-xl" />
          {!texture && <p className="text-sm text-fg-muted">Loading print template…</p>}
        </div>
        <p className="text-sm text-fg-muted">
          {doc.layers.length} layer{doc.layers.length === 1 ? '' : 's'} · template {widthMm}×
          {heightMm} mm · bg {doc.background.color}
          {designId ? ` · saved ${designId.slice(0, 8)}` : ''}
        </p>
      </div>
    </div>
  )
}
