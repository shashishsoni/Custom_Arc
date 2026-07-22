'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Blank, DesignDocument } from '@customarc/shared'
import { designDetailSchema } from '@customarc/shared'
import { API_DESIGNS, WEB_CATALOG, WEB_CUSTOMIZE, apiUrl } from '@customarc/shared/constants'
import { CustomizerScene } from '../scene'
import { emptyDocForBlank, patchTransform } from '../design/design-doc'
import type { DesignTexture } from '../design/design-texture'
import { ToolsPanel } from '../tools'
import { useDesignImages } from '../design/use-design-images'
import type { CustomizerCamera, CustomizerModelPose } from '../scene/view-config'
import { SaveDesignBar } from './save-design-bar'
import { CheckoutPayBar } from './checkout-pay-bar'
import { StudioStage } from './studio-stage'

type Props = {
  blank: Blank
  initialDesignId?: string | null
  camera?: CustomizerCamera
  model?: CustomizerModelPose
}

export function CustomizerView({ blank, initialDesignId = null, camera, model }: Props) {
  const router = useRouter()
  const [doc, setDoc] = useState<DesignDocument>(() => emptyDocForBlank(blank))
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null)
  const [texture, setTexture] = useState<DesignTexture | null>(null)
  const [activeZone, setActiveZone] = useState<string | null>(null)
  const [designId, setDesignId] = useState<string | null>(initialDesignId)
  const [designName, setDesignName] = useState('')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loadingDesign, setLoadingDesign] = useState(Boolean(initialDesignId))
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

  const onSaved = useCallback(
    (id: string) => {
      setDesignId(id)
      router.replace(`${WEB_CUSTOMIZE}/${blank.slug}?design=${encodeURIComponent(id)}`, {
        scroll: false,
      })
    },
    [blank.slug, router],
  )

  useEffect(() => {
    setDoc(emptyDocForBlank(blank))
    setSelectedLayerId(null)
    setTexture(null)
    setActiveZone(null)
    setDesignId(initialDesignId)
    setDesignName('')
    setLoadError(null)
  }, [blank.slug]) // eslint-disable-line react-hooks/exhaustive-deps -- reset on blank change only

  useEffect(() => {
    if (!initialDesignId) {
      setLoadingDesign(false)
      return
    }

    let cancelled = false
    setLoadingDesign(true)
    setLoadError(null)

    void (async () => {
      try {
        const res = await fetch(apiUrl(`${API_DESIGNS}/${initialDesignId}`), {
          credentials: 'include',
        })
        const body = (await res.json().catch(() => null)) as {
          success?: boolean
          data?: unknown
          error?: string
        } | null
        if (res.status === 401) throw new Error('Sign in to resume this design')
        if (res.status === 403) throw new Error('This design belongs to another account')
        if (!res.ok || !body?.success || body.data === undefined) {
          throw new Error(body?.error ?? `Could not load design (${res.status})`)
        }
        const detail = designDetailSchema.parse(body.data)
        if (detail.document.blankSlug !== blank.slug) {
          throw new Error('Design does not match this blank')
        }
        if (cancelled) return
        setDoc(detail.document)
        setDesignId(detail.id)
        setDesignName(detail.name ?? '')
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Could not load design')
          setDesignId(null)
        }
      } finally {
        if (!cancelled) setLoadingDesign(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [initialDesignId, blank.slug])

  const { widthMm, heightMm, safeMarginMm } = blank.template.printableAreaMm

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] md:grid-cols-[240px_minmax(0,1fr)] md:grid-rows-1">
        <aside
          aria-label="Design tools"
          className="flex min-h-0 flex-col border-b border-border bg-[color-mix(in_srgb,var(--bg-card)_88%,var(--bg))] md:border-r md:border-b-0"
        >
          <header className="shrink-0 border-b border-border px-[18px] pt-5 pb-4">
            <Link
              href={WEB_CATALOG}
              className="flex items-center gap-2 text-inherit"
              aria-label="CustomArc Studio"
            >
              <span
                aria-hidden
                className="size-6 shrink-0 rounded bg-[linear-gradient(135deg,var(--primary),color-mix(in_srgb,var(--accent-warm)_35%,var(--primary)))]"
              />
              <span>
                <span className="block font-heading text-lg leading-none font-semibold tracking-tight">
                  Studio
                </span>
                <span className="mt-0.5 block text-[0.6875rem] font-semibold tracking-[0.1em] text-fg-muted uppercase">
                  CustomArc
                </span>
              </span>
            </Link>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 [scrollbar-gutter:stable]">
            {loadingDesign ? (
              <p className="px-1 text-sm text-fg-muted">Loading saved design…</p>
            ) : loadError ? (
              <p className="px-1 text-sm text-destructive" role="alert">
                {loadError}
              </p>
            ) : null}
            <ToolsPanel
              blank={blank}
              doc={doc}
              designId={designId}
              selectedLayerId={selectedLayerId}
              onDocChange={setDoc}
              onSelectLayer={setSelectedLayerId}
            />
          </div>
        </aside>

        <StudioStage
          className="min-h-[56vh] md:min-h-0"
          title={blank.name}
          meta={`Printable area ${widthMm} × ${heightMm} mm · safe margin ${safeMarginMm} mm`}
          hint={
            activeZone ? `Active · ${activeZone}` : 'Click a print zone · drag selected layer'
          }
          texture={texture}
          flatMeta={`${doc.layers.length} layer${doc.layers.length === 1 ? '' : 's'}${designId ? ` · ${designId.slice(0, 8)}` : ''}`}
        >
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
        </StudioStage>
      </div>

      <footer
        aria-label="Studio actions"
        className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border bg-[color-mix(in_srgb,var(--bg-card)_94%,var(--bg))] px-[clamp(0.875rem,2vw,1.375rem)] py-2.5 shadow-[0_-1px_0_rgba(61,52,64,0.03)]"
      >
        <div className="min-w-0">
          <span
            role="status"
            aria-live="polite"
            className={
              designId
                ? 'inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold tracking-[0.06em] text-fg uppercase'
                : 'inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold tracking-[0.06em] text-primary uppercase'
            }
          >
            <span
              aria-hidden
              className={designId ? 'size-1.5 rounded-full bg-fg' : 'size-1.5 rounded-full bg-primary'}
            />
            {designId ? 'Saved' : 'Draft'}
          </span>
          <p className="mt-0.5 text-[0.6875rem] text-fg-muted">Checkout after save</p>
        </div>

        <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
          <SaveDesignBar
            blankSlug={blank.slug}
            doc={doc}
            designId={designId}
            initialName={designName}
            onSaved={onSaved}
          />
          <CheckoutPayBar designId={designId} blank={blank} />
        </div>
      </footer>
    </div>
  )
}
