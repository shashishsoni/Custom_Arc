'use client'

import { useState } from 'react'
import type { DesignDocument } from '@customarc/shared'
import { savedDesignSchema } from '@customarc/shared'
import { API_DESIGNS, apiUrl } from '@customarc/shared/constants'
import { authClient } from '@/lib/auth-client'
import { AuthModal } from '@/modules/auth-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Props = {
  blankSlug: string
  doc: DesignDocument
  designId: string | null
  onSaved: (id: string) => void
}

function hasLocalUploads(doc: DesignDocument) {
  return doc.layers.some((l) => l.type === 'image' && l.uploadId.startsWith('local-'))
}

async function postOrPatchDesign(input: {
  blankSlug: string
  document: DesignDocument
  name?: string
  designId: string | null
}) {
  const { blankSlug, document, name, designId } = input
  const res = designId
    ? await fetch(apiUrl(`${API_DESIGNS}/${designId}`), {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document, name }),
      })
    : await fetch(apiUrl(API_DESIGNS), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blankId: blankSlug, document, name }),
      })

  const body = (await res.json().catch(() => null)) as {
    success?: boolean
    data?: unknown
    error?: string
  } | null

  if (res.status === 401) return { kind: 'auth' as const }
  if (!res.ok || !body?.success || body.data === undefined) {
    return { kind: 'error' as const, message: body?.error ?? `Save failed (${res.status})` }
  }
  return { kind: 'ok' as const, design: savedDesignSchema.parse(body.data) }
}

export function SaveDesignBar({ blankSlug, doc, designId, onSaved }: Props) {
  const { data: session } = authClient.useSession()
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in')

  const onSave = async () => {
    setError(null)
    setOk(null)

    if (!session?.user) {
      setAuthOpen(true)
      return
    }
    if (hasLocalUploads(doc)) {
      setError('Re-upload images while signed in before saving.')
      return
    }

    setBusy(true)
    try {
      const result = await postOrPatchDesign({
        blankSlug,
        document: doc,
        name: name.trim() || undefined,
        designId,
      })
      if (result.kind === 'auth') {
        setAuthOpen(true)
        return
      }
      if (result.kind === 'error') {
        setError(result.message)
        return
      }
      onSaved(result.design.id)
      setOk(designId ? 'Saved' : 'Design created')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3 rounded border border-border bg-card p-4">
      <p className="text-xs font-bold tracking-widest text-primary uppercase">Save</p>

      <div className="space-y-2">
        <Label htmlFor="design-name">Name (optional)</Label>
        <Input
          id="design-name"
          className="min-h-11 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={blankSlug}
          maxLength={80}
        />
      </div>

      <Button
        type="button"
        className="min-h-11 w-full rounded"
        disabled={busy}
        onClick={() => void onSave()}
      >
        {busy ? 'Saving…' : designId ? 'Update design' : 'Save design'}
      </Button>

      {ok && <p className="text-sm text-fg-muted">{ok}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {!session?.user && (
        <p className="text-sm text-fg-muted">Sign in required to save privately.</p>
      )}

      <AuthModal
        open={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onModeChange={setAuthMode}
      />
    </div>
  )
}
