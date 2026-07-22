'use client'

import { useRef, useState } from 'react'
import type { Blank, DesignDocument, Layer, UploadResult } from '@customarc/shared'
import { uploadResultSchema } from '@customarc/shared'
import { API_UPLOADS, apiUrl } from '@customarc/shared/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { makeImageLayer, makeTextLayer, patchTransform, updateLayer } from '../../design/design-doc'
import { AiGeneratePanel } from './ai-generate-panel'

async function uploadDesignImage(
  file: File,
  blank: Pick<Blank, 'slug' | 'category'>,
): Promise<UploadResult> {
  const form = new FormData()
  form.append('file', file)
  form.append('category', blank.category)
  form.append('productSlug', blank.slug)

  const res = await fetch(apiUrl(API_UPLOADS), {
    method: 'POST',
    body: form,
    credentials: 'include',
  })

  if (res.ok) {
    const body = (await res.json()) as { success: boolean; data?: unknown; error?: string }
    if (!body.success || body.data === undefined) throw new Error(body.error ?? 'Upload failed')
    return uploadResultSchema.parse(body.data)
  }

  if (res.status === 401) {
    const url = URL.createObjectURL(file)
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image()
        el.onload = () => resolve(el)
        el.onerror = () => reject(new Error('Could not read image'))
        el.src = url
      })
      return {
        id: `local-${crypto.randomUUID()}`,
        previewUrl: url,
        mimeType: file.type || 'image/jpeg',
        widthPx: img.naturalWidth,
        heightPx: img.naturalHeight,
        sizeBytes: file.size,
      }
    } catch (e) {
      URL.revokeObjectURL(url)
      throw e
    }
  }

  const body = (await res.json().catch(() => null)) as { error?: string } | null
  throw new Error(body?.error ?? `Upload failed (${res.status})`)
}

type Props = {
  blank: Blank
  doc: DesignDocument
  designId: string | null
  selectedLayerId: string | null
  onDocChange: (doc: DesignDocument) => void
  onSelectLayer: (id: string | null) => void
}

const label = 'mb-2 text-[0.625rem] font-bold tracking-[0.14em] text-fg-muted uppercase'
const panel = 'rounded border border-border bg-card p-3'
const field = 'space-y-1.5'
const control = 'min-h-10 rounded text-sm'

export function ToolsPanel({
  blank,
  doc,
  designId,
  selectedLayerId,
  onDocChange,
  onSelectLayer,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [text, setText] = useState('CustomArc')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selected = doc.layers.find((l) => l.id === selectedLayerId) ?? null

  const addImage = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const upload = await uploadDesignImage(file, blank)
      const layer = makeImageLayer(upload, doc.template)
      onDocChange({ ...doc, layers: [...doc.layers, layer] })
      onSelectLayer(layer.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  const addText = () => {
    const value = text.trim()
    if (!value) return
    const layer = makeTextLayer(value, doc.template)
    onDocChange({ ...doc, layers: [...doc.layers, layer] })
    onSelectLayer(layer.id)
  }

  return (
    <div className="space-y-3">
      <section className={panel} aria-labelledby="tools-label">
        <h2 id="tools-label" className={label}>
          Tools
        </h2>

        <div className="space-y-3">
          <div className={field}>
            <Label htmlFor="bg" className="text-xs text-fg-muted">
              Background
            </Label>
            <Input
              id="bg"
              type="color"
              className="h-10 w-full cursor-pointer rounded p-1"
              value={doc.background.color}
              onChange={(e) =>
                onDocChange({
                  ...doc,
                  background: { color: e.target.value as DesignDocument['background']['color'] },
                })
              }
            />
          </div>

          <div className={field}>
            <Label className="text-xs text-fg-muted">Image</Label>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => void addImage(e.target.files?.[0])}
            />
            <Button
              type="button"
              variant="outline"
              className={cn(control, 'w-full')}
              disabled={busy}
              onClick={() => fileRef.current?.click()}
            >
              {busy ? 'Uploading…' : 'Upload image'}
            </Button>
          </div>

          <div className={field}>
            <Label htmlFor="text-layer" className="text-xs text-fg-muted">
              Text
            </Label>
            <div className="flex flex-col gap-1.5">
              <Input
                id="text-layer"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className={control}
                maxLength={200}
              />
              <Button type="button" variant="outline" className={cn(control, 'w-full')} onClick={addText}>
                Add text
              </Button>
            </div>
          </div>
        </div>

        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
        <p className="mt-3 text-[0.6875rem] leading-snug text-fg-muted">
          Click a print zone, then drag to place the selected layer.
        </p>
      </section>

      <AiGeneratePanel
        blank={blank}
        doc={doc}
        designId={designId}
        onDocChange={onDocChange}
        onSelectLayer={onSelectLayer}
      />

      {doc.layers.length > 0 && (
        <section className={panel} aria-label="Layers">
          <p className={label}>Layers</p>
          <ul className="space-y-1">
            {doc.layers.map((layer) => (
              <li key={layer.id}>
                <button
                  type="button"
                  className={cn(
                    'min-h-10 w-full rounded border px-2.5 text-left text-xs transition-colors',
                    layer.id === selectedLayerId
                      ? 'border-primary bg-[color-mix(in_srgb,var(--primary)_10%,var(--card))] font-medium text-primary'
                      : 'border-border text-fg hover:bg-[color-mix(in_srgb,var(--border)_25%,var(--card))]',
                  )}
                  onClick={() => onSelectLayer(layer.id)}
                >
                  {layerLabel(layer)}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {selected && (
        <section className={panel} aria-label="Layer transform">
          <p className={label}>Adjust</p>
          <div className="grid grid-cols-2 gap-2">
            <NumberField
              label="Width mm"
              value={selected.transform.widthMm}
              onChange={(widthMm) =>
                onDocChange(patchTransform(doc, selected.id, { widthMm: Math.max(5, widthMm) }))
              }
            />
            <NumberField
              label="Height mm"
              value={selected.transform.heightMm}
              onChange={(heightMm) =>
                onDocChange(patchTransform(doc, selected.id, { heightMm: Math.max(5, heightMm) }))
              }
            />
            <NumberField
              label="Rotate °"
              value={selected.transform.rotationDeg}
              onChange={(rotationDeg) =>
                onDocChange(patchTransform(doc, selected.id, { rotationDeg }))
              }
            />
            {selected.type === 'text' && (
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="edit-text" className="text-xs text-fg-muted">
                  Edit text
                </Label>
                <Input
                  id="edit-text"
                  className={control}
                  value={selected.text}
                  onChange={(e) => {
                    const next = e.target.value || ' '
                    onDocChange(
                      updateLayer(doc, selected.id, (layer) =>
                        layer.type === 'text' ? { ...layer, text: next } : layer,
                      ),
                    )
                  }}
                />
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

function layerLabel(layer: Layer) {
  if (layer.type === 'image') return `Image · ${layer.uploadId.slice(0, 8)}`
  return `Text · ${layer.text.slice(0, 24)}`
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (n: number) => void
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-fg-muted">{label}</Label>
      <Input
        type="number"
        className="min-h-10 rounded text-sm"
        value={Number(value.toFixed(1))}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}
