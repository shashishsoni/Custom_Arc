'use client'

import { useEffect, useId, useLayoutEffect, useRef, useState, useEffectEvent } from 'react'
import { Mail, X } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Mode = 'sign-in' | 'sign-up'
type Step = 'email' | 'otp' | 'magic-sent'

type AuthModalProps = {
  open: boolean
  mode: Mode
  onClose: () => void
  onModeChange: (mode: Mode) => void
}

const WEB_ORIGIN =
  typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'

const primaryBtnClass =
  'h-12 min-h-12 w-full rounded-[var(--radius)] border-[1.5px] border-primary bg-primary text-[0.9rem] font-semibold text-primary-foreground hover:bg-transparent hover:text-primary'

const outlineBtnClass =
  'h-12 min-h-12 w-full rounded-[var(--radius)] border border-[var(--border-strong)] bg-white text-[0.9rem] font-medium text-foreground hover:border-primary hover:bg-white hover:text-primary'

export function AuthModal({ open, mode, onClose, onModeChange }: AuthModalProps) {
  const titleId = useId()
  const emailRef = useRef<HTMLInputElement>(null)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<Step>('email')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const reset = useEffectEvent(() => {
    setEmail('')
    setOtp('')
    setStep('email')
    setBusy(false)
    setError(null)
    setInfo(null)
  })

  useEffect(() => {
    if (!open) {
      reset()
      return
    }
    const t = window.setTimeout(() => emailRef.current?.focus(), 40)
    return () => window.clearTimeout(t)
  }, [open, reset])

  // Keep overlay above the fixed header (z-100) and apply Air Blush backdrop.
  useLayoutEffect(() => {
    if (!open) return
    const overlay = document.querySelector<HTMLElement>('[data-slot="dialog-overlay"]')
    if (!overlay) return
    const prev = {
      zIndex: overlay.style.zIndex,
      background: overlay.style.background,
      backdropFilter: overlay.style.backdropFilter,
    }
    overlay.style.zIndex = '130'
    overlay.style.background =
      'radial-gradient(ellipse 70% 50% at 50% 20%, rgba(196, 92, 106, 0.12), transparent 55%), rgba(45, 36, 42, 0.42)'
    overlay.style.backdropFilter = 'blur(8px)'
    return () => {
      overlay.style.zIndex = prev.zIndex
      overlay.style.background = prev.background
      overlay.style.backdropFilter = prev.backdropFilter
    }
  }, [open])

  const isSignUp = mode === 'sign-up'
  const headline = isSignUp ? 'Create your account' : 'Welcome back'
  const sub =
    step === 'otp'
      ? `Enter the 6-digit code we sent to ${email}`
      : step === 'magic-sent'
        ? `Open the link we sent to ${email}`
        : isSignUp
          ? 'Save designs, earn free credits, and checkout.'
          : 'Sign in with email — no password needed.'

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setInfo(null)
    const { error: err } = await authClient.emailOtp.sendVerificationOtp({
      email: email.trim(),
      type: 'sign-in',
    })
    setBusy(false)
    if (err) {
      setError(err.message ?? 'Could not send code')
      return
    }
    setStep('otp')
    setInfo('Code sent — check your inbox.')
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error: err } = await authClient.signIn.emailOtp({
      email: email.trim(),
      otp: otp.trim(),
      name: isSignUp ? email.split('@')[0] : undefined,
    })
    setBusy(false)
    if (err) {
      setError(err.message ?? 'Invalid or expired code')
      return
    }
    onClose()
  }

  async function sendMagicLink() {
    setBusy(true)
    setError(null)
    setInfo(null)
    const { error: err } = await authClient.signIn.magicLink({
      email: email.trim(),
      name: isSignUp ? email.split('@')[0] : undefined,
      callbackURL: WEB_ORIGIN,
      newUserCallbackURL: WEB_ORIGIN,
    })
    setBusy(false)
    if (err) {
      setError(err.message ?? 'Could not send magic link')
      return
    }
    setStep('magic-sent')
  }

  async function signInGoogle() {
    setBusy(true)
    setError(null)
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: WEB_ORIGIN,
      newUserCallbackURL: WEB_ORIGIN,
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent
        showCloseButton={false}
        aria-labelledby={titleId}
        className={cn(
          'z-[130] w-full max-w-[420px] gap-0 rounded-xl border-border p-6 pt-8 sm:max-w-[420px]',
          'bg-[linear-gradient(165deg,rgba(255,255,255,0.98),rgba(255,250,251,0.96))] shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_24px_48px_rgba(61,52,64,0.14)]',
        )}
      >
        <DialogClose
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close"
              className="absolute top-3 right-3 size-10 min-h-10 min-w-10 rounded-[var(--radius)] text-muted-foreground hover:bg-[rgba(61,52,64,0.05)] hover:text-foreground"
            />
          }
        >
          <X size={18} strokeWidth={1.75} aria-hidden />
        </DialogClose>

        <div className="mb-5 inline-flex items-center gap-2 text-[0.95rem] font-semibold tracking-[-0.02em] text-foreground" aria-hidden>
          <span className="inline-flex size-7 items-center justify-center text-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-5">
              <path d="M4 16c4-8 12-8 16 0" />
              <circle cx="12" cy="8" r="2.25" fill="currentColor" stroke="none" />
            </svg>
          </span>
          <span>CustomArc</span>
        </div>

        <Tabs
          value={mode}
          onValueChange={(value) => onModeChange(value as Mode)}
          className="mb-5 gap-0"
        >
          <TabsList
            aria-label="Account"
            className={cn(
              'grid h-11! w-full grid-cols-2 gap-1 rounded-md border border-border bg-secondary p-1',
              'group-data-horizontal/tabs:h-11!',
            )}
          >
            <TabsTrigger
              value="sign-in"
              className={cn(
                'h-full min-h-0 rounded-[3px] text-[0.8125rem] font-medium shadow-none',
                'text-fg-muted hover:text-fg',
                'data-active:bg-card data-active:text-fg data-active:shadow-sm',
                'dark:data-active:bg-card dark:data-active:text-fg',
              )}
            >
              Sign in
            </TabsTrigger>
            <TabsTrigger
              value="sign-up"
              className={cn(
                'h-full min-h-0 rounded-[3px] text-[0.8125rem] font-medium shadow-none',
                'text-fg-muted hover:text-fg',
                'data-active:bg-card data-active:text-fg data-active:shadow-sm',
                'dark:data-active:bg-card dark:data-active:text-fg',
              )}
            >
              Sign up
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <DialogHeader className="mb-5 gap-2 text-left">
          <DialogTitle id={titleId} className="text-[1.45rem] font-semibold tracking-[-0.03em] text-foreground">
            {headline}
          </DialogTitle>
          <DialogDescription className="text-[0.9rem] leading-[1.45] text-muted-foreground">
            {sub}
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <p
            className="mb-4 rounded-[var(--radius)] border border-[color-mix(in_srgb,var(--accent)_28%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_10%,#fff)] px-3 py-2.5 text-[0.8125rem] leading-[1.4] text-[#8a3a46]"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        {info ? (
          <p className="mb-4 rounded-[var(--radius)] border border-border bg-[color-mix(in_srgb,var(--accent-2)_6%,#fff)] px-3 py-2.5 text-[0.8125rem] leading-[1.4] text-foreground">
            {info}
          </p>
        ) : null}

        {step === 'email' ? (
          <form className="flex flex-col gap-3" onSubmit={sendOtp}>
            <Label
              htmlFor="auth-email"
              className="text-xs font-semibold tracking-[0.04em] text-muted-foreground uppercase"
            >
              Email
            </Label>
            <div
              className={cn(
                'flex min-h-12 items-center gap-2.5 rounded-[var(--radius)] border border-[var(--border-strong)] bg-white px-3.5 text-muted-foreground transition-colors',
                'focus-within:border-primary focus-within:text-foreground',
              )}
            >
              <Mail size={16} strokeWidth={1.75} aria-hidden className="shrink-0" />
              <Input
                ref={emailRef}
                id="auth-email"
                type="email"
                name="email"
                autoComplete="email"
                required
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={busy}
                className="h-11 min-h-11 border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0 md:text-base"
              />
            </div>
            <Button
              type="submit"
              disabled={busy || !email.trim()}
              className={primaryBtnClass}
            >
              {busy ? 'Sending…' : 'Continue with OTP'}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy || !email.trim()}
              onClick={sendMagicLink}
              className={outlineBtnClass}
            >
              Email me a magic link instead
            </Button>
          </form>
        ) : null}

        {step === 'otp' ? (
          <form className="flex flex-col gap-3" onSubmit={verifyOtp}>
            <Label
              htmlFor="auth-otp"
              className="text-xs font-semibold tracking-[0.04em] text-muted-foreground uppercase"
            >
              One-time code
            </Label>
            <Input
              id="auth-otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              placeholder="······"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={busy}
              autoFocus
              className="h-14 min-h-14 rounded-[var(--radius)] border-[var(--border-strong)] bg-white px-3.5 text-center text-[1.35rem] font-semibold tracking-[0.35em] text-foreground focus-visible:border-primary focus-visible:ring-0"
            />
            <Button
              type="submit"
              disabled={busy || otp.length < 6}
              className={primaryBtnClass}
            >
              {busy ? 'Verifying…' : isSignUp ? 'Create account' : 'Sign in'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() => {
                setStep('email')
                setOtp('')
                setInfo(null)
                setError(null)
              }}
              className="h-12 min-h-12 w-full font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
            >
              Use a different email
            </Button>
          </form>
        ) : null}

        {step === 'magic-sent' ? (
          <div className="flex flex-col gap-3">
            <p className="m-0 rounded-[var(--radius)] border border-border bg-[color-mix(in_srgb,var(--accent)_6%,#fff)] p-4 text-[0.9rem] leading-normal text-foreground">
              Check your inbox and click the link. You can close this window — we&apos;ll keep the session when you return.
            </p>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setStep('email')
                setInfo(null)
              }}
              className="h-12 min-h-12 w-full font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
            >
              Back
            </Button>
          </div>
        ) : null}

        {step === 'email' ? (
          <>
            <div className="my-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs text-muted-foreground">
              <Separator className="bg-border" />
              <span>or</span>
              <Separator className="bg-border" />
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={signInGoogle}
              className={cn(outlineBtnClass, 'gap-2.5 hover:bg-[color-mix(in_srgb,var(--accent)_5%,#fff)] hover:text-foreground')}
            >
              <GoogleGlyph />
              Continue with Google
            </Button>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.3 35.2 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.6 7.1l.1.1 6.3 5.3C36.8 41.3 44 36 44 24c0-1.3-.1-2.5-.4-3.5z" />
    </svg>
  )
}
