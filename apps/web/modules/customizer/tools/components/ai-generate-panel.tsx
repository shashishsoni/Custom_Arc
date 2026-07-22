'use client'

import { useState } from 'react'
import type { Blank, DesignDocument } from '@customarc/shared'
import { generationResultSchema } from '@customarc/shared'
import { API_AI_GENERATE, apiUrl } from '@customarc/shared/constants'
import { authClient } from '@/lib/auth-client'
import { AuthModal } from '@/modules/auth-modal'
import { publishCreditsBalance } from '@/modules/credits'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { makeAiImageLayer } from '../../design/design-doc'

type Props = {
  blank: Blank
  doc: DesignDocument
  designId: string | null
  onDocChange: (doc: DesignDocument) => void
  onSelectLayer: (id: string | null) => void
}

const label = 'mb-2 text-[0.625rem] font-bold tracking-[0.14em] text-fg-muted uppercase'
const panel = 'rounded border border-border bg-card p-3'
const control = 'min-h-10 rounded text-sm'

/** Issue 12 — prompt → FLUX texture wrapped onto the blank. */
export function AiGeneratePanel({
  blank,
  doc,
  designId,
  onDocChange,
  onSelectLayer,
}: Props) {
  const { data: session } = authClient.useSession()
  const [prompt, setPrompt] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in')

  const onGenerate = async () => {
    setError(null)
    setOk(null)
    const text = prompt.trim()
    if (!text) {
      setError('Enter a prompt.')
      return
    }
    if (!session?.user) {
      setAuthOpen(true)
      return
    }
    if (!designId) {
      setError('Save the design first, then generate.')
      return
    }

    setBusy(true)
    try {
      const res = await fetch(apiUrl(API_AI_GENERATE), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ designId, prompt: text }),
      })
      const body = (await res.json().catch(() => null)) as {
        success?: boolean
        data?: unknown
        error?: string
      } | null
      if (res.status === 401) {
        setAuthOpen(true)
        return
      }
      if (!res.ok || !body?.success || body.data === undefined) {
        throw new Error(body?.error ?? `Generate failed (${res.status})`)
      }
      const result = generationResultSchema.parse(body.data)
      const layer = makeAiImageLayer(result.upload, doc.template)
      onDocChange({ ...doc, layers: [...doc.layers, layer] })
      onSelectLayer(layer.id)
      publishCreditsBalance(result.balance)
      setOk(`Wrapped · ${result.creditsCost} credit · balance ${result.balance}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generate failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className={panel} aria-labelledby="ai-gen-label">
      <h2 id="ai-gen-label" className={label}>
        AI texture
      </h2>
      <div className="space-y-1.5">
        <Label htmlFor="ai-prompt" className="text-xs text-fg-muted">
          Prompt
        </Label>
        <Input
          id="ai-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className={control}
          maxLength={1000}
          placeholder="Rose wrap, soft blush tones…"
          disabled={busy}
        />
        <Button
          type="button"
          className={cn(control, 'w-full rounded')}
          disabled={busy}
          onClick={() => void onGenerate()}
        >
          {busy ? 'Generating…' : 'Generate & wrap'}
        </Button>
      </div>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      {ok && <p className="mt-2 text-xs text-fg-muted">{ok}</p>}
      <p className="mt-2 text-[0.6875rem] leading-snug text-fg-muted">
        Uses 1 credit · moderated before & after · save design first
      </p>
      <AuthModal
        open={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onModeChange={setAuthMode}
      />
    </section>
  )
}
