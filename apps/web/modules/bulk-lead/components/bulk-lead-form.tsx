'use client'

import { useState, type FormEvent } from 'react'
import { API_LEADS_BULK, apiUrl } from '@customarc/shared/constants'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

import { COPY } from '../data'

export function BulkLeadForm() {
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (pending) return
    setPending(true)
    try {
      const res = await fetch(apiUrl(API_LEADS_BULK), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim(), note: note.trim() }),
      })
      const json = (await res.json().catch(() => null)) as
        | { success?: boolean; error?: string }
        | null
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || 'Could not send inquiry')
      }
      setDone(true)
      setEmail('')
      setNote('')
      toast.success(COPY.success)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not send inquiry')
    } finally {
      setPending(false)
    }
  }

  if (done) {
    return (
      <p
        role="status"
        className="rounded border border-border bg-[color-mix(in_srgb,var(--accent)_6%,var(--card))] px-4 py-6 text-base text-fg md:text-lg"
      >
        {COPY.success}
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <div className="grid gap-2">
        <Label htmlFor="bulk-email">{COPY.emailLabel}</Label>
        <Input
          id="bulk-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-h-11 rounded border-border bg-card px-3 text-base md:text-sm"
          disabled={pending}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="bulk-note">{COPY.noteLabel}</Label>
        <textarea
          id="bulk-note"
          name="note"
          required
          minLength={1}
          maxLength={2000}
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={COPY.notePlaceholder}
          disabled={pending}
          className={cn(
            'w-full min-w-0 resize-y rounded border border-input bg-card px-3 py-2.5 text-base outline-none transition-colors',
            'placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
            'disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          )}
        />
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className="min-h-11 w-full rounded font-semibold tracking-wide sm:w-auto"
      >
        {pending ? COPY.sending : COPY.submit}
      </Button>
    </form>
  )
}
