'use client'

import { useEffect, useState } from 'react'
import {
  creditBalanceSchema,
  creditCheckoutSessionSchema,
  creditPackSchema,
  type CreditCheckoutSession,
  type CreditPack,
} from '@customarc/shared'
import {
  API_CREDITS_BALANCE,
  API_CREDITS_CHECKOUT,
  API_CREDITS_CONFIRM,
  API_CREDITS_PACKS,
  apiUrl,
} from '@customarc/shared/constants'
import { authClient } from '@/lib/auth-client'
import { AuthModal } from '@/modules/auth-modal'
import { publishCreditsBalance, subscribeCreditsBalance } from '@/modules/credits/balance-events'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type RazorpayInstance = {
  open: () => void
  on: (
    event: 'payment.failed',
    handler: (response: { error?: { description?: string } }) => void,
  ) => void
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance
  }
}

async function readOk<T>(res: Response, parse: (v: unknown) => T): Promise<T> {
  const body = (await res.json().catch(() => null)) as {
    success?: boolean
    data?: unknown
    error?: string
  } | null
  if (res.status === 401) throw new Error('auth')
  if (!res.ok || !body?.success || body.data === undefined) {
    throw new Error(body?.error ?? `Request failed (${res.status})`)
  }
  return parse(body.data)
}

function loadRazorpay(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject()
  if (window.Razorpay) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Could not load Razorpay'))
    document.body.appendChild(s)
  })
}

function formatMoney(minor: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(minor / 100)
  } catch {
    return `${(minor / 100).toFixed(2)} ${currency}`
  }
}

export function CreditsPanel() {
  const { data: session } = authClient.useSession()
  const [packs, setPacks] = useState<CreditPack[]>([])
  const [balance, setBalance] = useState<number | null>(null)
  const [busyPack, setBusyPack] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [okMsg, setOkMsg] = useState<string | null>(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in')

  const refreshBalance = async () => {
    if (!session?.user) {
      setBalance(null)
      return
    }
    const bal = await readOk(
      await fetch(apiUrl(API_CREDITS_BALANCE), { credentials: 'include' }),
      creditBalanceSchema.parse,
    )
    setBalance(bal.balance)
    publishCreditsBalance(bal.balance)
  }

  useEffect(() => {
    void (async () => {
      try {
        const list = await readOk(
          await fetch(apiUrl(API_CREDITS_PACKS), { credentials: 'include' }),
          (v) => creditPackSchema.array().parse(v),
        )
        setPacks(list)
      } catch {
        setPacks([])
      }
    })()
  }, [])

  useEffect(() => {
    void refreshBalance().catch(() => setBalance(null))
  }, [session?.user?.id])

  useEffect(() => subscribeCreditsBalance(setBalance), [])

  const onBuy = async (pack: CreditPack) => {
    setError(null)
    setOkMsg(null)
    if (!session?.user) {
      setAuthOpen(true)
      return
    }
    setBusyPack(pack.id)
    try {
      const checkout = await readOk(
        await fetch(apiUrl(API_CREDITS_CHECKOUT), {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packId: pack.id }),
        }),
        creditCheckoutSessionSchema.parse,
      )

      if (checkout.mode === 'mock') {
        const bal = await readOk(
          await fetch(apiUrl(API_CREDITS_CONFIRM), {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mode: 'mock',
              packId: checkout.packId,
              razorpayOrderId: checkout.razorpayOrderId,
            }),
          }),
          creditBalanceSchema.parse,
        )
        setBalance(bal.balance)
        publishCreditsBalance(bal.balance)
        setOkMsg(`Added ${checkout.credits} credits (mock)`)
        return
      }

      await openRazorpayCredits(checkout)
      await refreshBalance()
      setOkMsg(`Added ${checkout.credits} credits`)
    } catch (e) {
      if (e instanceof Error && e.message === 'auth') {
        setAuthOpen(true)
        return
      }
      setError(e instanceof Error ? e.message : 'Purchase failed')
    } finally {
      setBusyPack(null)
    }
  }

  return (
    <div className="max-w-xl">
      <p className="mb-8 text-lg leading-relaxed text-fg-muted md:text-xl">
        {session?.user
          ? balance === null
            ? 'Loading balance…'
            : `You have ${balance} credit${balance === 1 ? '' : 's'}.`
          : 'Sign in to see your balance and buy packs.'}
      </p>

      <ul className="flex list-none flex-col gap-3 p-0">
        {packs.map((pack) => (
          <li
            key={pack.id}
            className="flex flex-wrap items-center justify-between gap-3 border border-border bg-[color-mix(in_srgb,var(--card)_80%,transparent)] px-4 py-4"
          >
            <div>
              <p className="font-heading text-xl font-semibold tracking-tight text-fg">{pack.label}</p>
              <p className="text-sm text-fg-muted">
                {pack.credits} credits · {formatMoney(pack.priceMinor, pack.currency)}
              </p>
            </div>
            <Button
              type="button"
              size="lg"
              className="min-h-11 rounded font-semibold"
              disabled={busyPack !== null}
              onClick={() => void onBuy(pack)}
            >
              {busyPack === pack.id ? 'Processing…' : 'Buy'}
            </Button>
          </li>
        ))}
      </ul>

      {okMsg && <p className={cn('mt-4 text-sm text-fg-muted')}>{okMsg}</p>}
      {error && (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {error}
        </p>
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

function openRazorpayCredits(checkout: CreditCheckoutSession): Promise<void> {
  return new Promise((resolve, reject) => {
    void (async () => {
      try {
        await loadRazorpay()
        if (!window.Razorpay || !checkout.razorpayKeyId) {
          reject(new Error('Razorpay unavailable'))
          return
        }
        let settled = false
        const settle = (fn: () => void) => {
          if (settled) return
          settled = true
          fn()
        }

        const rzp = new window.Razorpay({
          key: checkout.razorpayKeyId,
          amount: checkout.amountMinor,
          currency: checkout.currency,
          order_id: checkout.razorpayOrderId,
          name: 'CustomArc',
          description: `${checkout.credits} credits`,
          handler: async (response: {
            razorpay_order_id: string
            razorpay_payment_id: string
            razorpay_signature: string
          }) => {
            try {
              await readOk(
                await fetch(apiUrl(API_CREDITS_CONFIRM), {
                  method: 'POST',
                  credentials: 'include',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    mode: 'razorpay',
                    packId: checkout.packId,
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                  }),
                }),
                creditBalanceSchema.parse,
              )
              settle(() => resolve())
            } catch (e) {
              settle(() => reject(e))
            }
          },
          modal: {
            ondismiss: () => settle(() => reject(new Error('Payment cancelled'))),
          },
        })
        rzp.on('payment.failed', (response) => {
          settle(() => reject(new Error(response.error?.description ?? 'Payment failed')))
        })
        rzp.open()
      } catch (e) {
        reject(e)
      }
    })()
  })
}
