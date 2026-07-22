'use client'

import { useEffect, useState } from 'react'
import type { DesignDocument } from '@customarc/shared'
import { savedDesignSchema } from '@customarc/shared'
import { API_DESIGNS, apiUrl } from '@customarc/shared/constants'
import { authClient } from '@/lib/auth-client'
import { AuthModal } from '@/modules/auth-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type Props = {
  blankSlug: string
  doc: DesignDocument
  designId: string | null
  initialName?: string
  onSaved: (id: string) => void
  /** Horizontal dock control for the studio bottom bar. */
  className?: string
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

export function SaveDesignBar({
  blankSlug,
  doc,
  designId,
  initialName = '',
  onSaved,
  className,
}: Props) {
  const { data: session } = authClient.useSession()
  const [name, setName] = useState(initialName)

  useEffect(() => {
    setName(initialName)
  }, [initialName])
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
    <div className={cn('flex min-w-0 flex-wrap items-center gap-2', className)}>
      <Label htmlFor="design-name" className="sr-only">
        Name (optional)
      </Label>
      <Input
        id="design-name"
        className="h-10 min-h-10 w-[min(100%,12rem)] rounded"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={blankSlug}
        maxLength={80}
      />
      <Button
        type="button"
        variant="outline"
        className="h-10 min-h-10 rounded border-[color-mix(in_srgb,var(--primary)_35%,var(--border))] px-4 text-sm font-semibold text-primary hover:bg-[color-mix(in_srgb,var(--primary)_8%,var(--bg-card))]"
        disabled={busy}
        onClick={() => void onSave()}
      >
        {busy ? 'Saving…' : designId ? 'Update design' : 'Save design'}
      </Button>
      {ok && <span className="text-xs text-fg-muted">{ok}</span>}
      {error && <span className="text-xs text-destructive">{error}</span>}
      {!session?.user && <span className="text-xs text-fg-muted">Sign in to save</span>}

      <AuthModal
        open={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onModeChange={setAuthMode}
      />
    </div>
  )
}
