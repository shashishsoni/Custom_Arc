'use client'

import { useRef, useState } from 'react'
import type { Blank, DesignDocument, Layer } from '@customarc/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { uploadDesignImage } from '@/lib/uploads'
import { makeImageLayer, makeTextLayer, patchTransform, updateLayer } from './design-doc'

type Props = {
  blank: Blank
  doc: DesignDocument
  selectedLayerId: string | null
  onDocChange: (doc: DesignDocument) => void
  onSelectLayer: (id: string | null) => void
}

export function ToolsPanel({ blank, doc, selectedLayerId, onDocChange, onSelectLayer }: Props) {
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
    <div className="space-y-4 rounded border border-border bg-card p-4">
      <p className="text-xs font-bold tracking-widest text-primary uppercase">Tools</p>

      <div className="space-y-2">
        <Label htmlFor="bg">Background</Label>
        <Input
          id="bg"
          type="color"
          className="h-11 w-full max-w-[8rem] cursor-pointer p-1"
          value={doc.background.color}
          onChange={(e) =>
            onDocChange({
              ...doc,
              background: { color: e.target.value as DesignDocument['background']['color'] },
            })
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Image</Label>
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
          className="min-h-11 rounded"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          {busy ? 'Uploading…' : 'Upload image'}
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="text-layer">Text</Label>
        <Input
          id="text-layer"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-11 rounded"
          maxLength={200}
        />
        <Button type="button" variant="outline" className="min-h-11 rounded" onClick={addText}>
          Add text
        </Button>
      </div>

      {doc.layers.length > 0 && (
        <div className="space-y-2">
          <Label>Layers</Label>
          <ul className="space-y-1">
            {doc.layers.map((layer) => (
              <li key={layer.id}>
                <button
                  type="button"
                  className={`min-h-11 w-full rounded border px-3 text-left text-sm ${
                    layer.id === selectedLayerId
                      ? 'border-primary bg-[color-mix(in_srgb,var(--primary)_12%,var(--card))] text-primary'
                      : 'border-border text-fg'
                  }`}
                  onClick={() => onSelectLayer(layer.id)}
                >
                  {layerLabel(layer)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selected && (
        <div className="grid grid-cols-2 gap-3">
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
            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit-text">Edit text</Label>
              <Input
                id="edit-text"
                className="min-h-11 rounded"
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
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-sm text-fg-muted">
        Drag on an active print zone to place the selected layer. Sign in for private server uploads;
        signed-out uses a local preview.
      </p>
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
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="number"
        className="min-h-11 rounded"
        value={Number(value.toFixed(1))}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}
