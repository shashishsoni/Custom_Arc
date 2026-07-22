'use client'

import { useState } from 'react'
import type { Blank } from '@customarc/shared'
import {
  checkoutSessionSchema,
  orderSummarySchema,
  printFileSummarySchema,
  printGateResultSchema,
  type CheckoutSession,
  type PrintFileSummary,
} from '@customarc/shared'
import { API_MODERATION, API_ORDERS, API_PRINT_FILES, WEB_ORDERS, apiUrl } from '@customarc/shared/constants'
import { authClient } from '@/lib/auth-client'
import { AuthModal } from '@/modules/auth-modal'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { Route } from 'next'

type Props = {
  designId: string | null
  blank: Blank
  className?: string
}

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

/** Pay for the saved design (no AI). Uses Razorpay when keys exist; else mock confirm. */
export function CheckoutPayBar({ designId, blank, className }: Props) {
  const { data: session } = authClient.useSession()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [okMsg, setOkMsg] = useState<string | null>(null)
  const [printFiles, setPrintFiles] = useState<PrintFileSummary[]>([])
  const [fulfillMsg, setFulfillMsg] = useState<string | null>(null)
  const [paidOrderId, setPaidOrderId] = useState<string | null>(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in')

  const variant = blank.variants[0]
  const priceLabel = variant ? formatMoney(variant.priceMinor, variant.currency) : null

  const onPay = async () => {
    setError(null)
    setOkMsg(null)
    setFulfillMsg(null)
    setPaidOrderId(null)
    if (!session?.user) {
      setAuthOpen(true)
      return
    }
    if (!designId) {
      setError('Save the design before paying.')
      return
    }
    if (!variant) {
      setError('No product variant available.')
      return
    }

    setBusy(true)
    try {
      const gate = await readOk(
        await fetch(apiUrl(`${API_MODERATION}/designs/${designId}/gate`), {
          credentials: 'include',
        }),
        printGateResultSchema.parse,
      )
      if (!gate.ok) {
        throw new Error(
          gate.reasons.length
            ? `Moderation hold: ${gate.reasons.slice(0, 3).join(' · ')}`
            : 'Design failed moderation check',
        )
      }

      const order = await readOk(
        await fetch(apiUrl(API_ORDERS), {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ designId, blankVariantId: variant.id }),
        }),
        orderSummarySchema.parse,
      )

      const checkout = await readOk(
        await fetch(apiUrl(`${API_ORDERS}/${order.id}/checkout`), {
          method: 'POST',
          credentials: 'include',
        }),
        checkoutSessionSchema.parse,
      )

      if (checkout.mode === 'mock') {
        const paid = await readOk(
          await fetch(apiUrl(`${API_ORDERS}/${order.id}/confirm`), {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode: 'mock' }),
          }),
          orderSummarySchema.parse,
        )
        setOkMsg(`Paid (mock) · ${formatMoney(paid.totalMinor, paid.currency)}`)
        setPrintFiles(await listPrintFiles(order.id))
        setFulfillMsg(partnerLine(paid))
        setPaidOrderId(order.id)
        return
      }

      await openRazorpay(checkout)
      const paid = await readOk(
        await fetch(apiUrl(`${API_ORDERS}/${order.id}`), { credentials: 'include' }),
        orderSummarySchema.parse,
      )
      setOkMsg(`Paid · ${formatMoney(checkout.amountMinor, checkout.currency)}`)
      setPrintFiles(await listPrintFiles(order.id))
      setFulfillMsg(partnerLine(paid))
      setPaidOrderId(order.id)
    } catch (e) {
      if (e instanceof Error && e.message === 'auth') {
        setAuthOpen(true)
        return
      }
      setError(e instanceof Error ? e.message : 'Checkout failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={cn('flex min-w-0 flex-wrap items-center gap-2', className)}>
      <Button
        type="button"
        className="h-10 min-h-10 rounded px-5 text-sm font-semibold"
        disabled={busy || !designId}
        aria-describedby={!designId ? 'pay-hint' : undefined}
        onClick={() => void onPay()}
      >
        {busy ? 'Processing…' : priceLabel ? `Pay · ${priceLabel}` : 'Pay now'}
      </Button>
      {!designId && (
        <span id="pay-hint" className="sr-only">
          Save first to enable payment
        </span>
      )}
      {okMsg && <span className="text-xs text-fg-muted">{okMsg}</span>}
      {fulfillMsg && <span className="text-xs text-fg-muted">{fulfillMsg}</span>}
      {paidOrderId && (
        <Link
          href={`${WEB_ORDERS}/${paidOrderId}` as Route}
          className="text-xs font-medium text-primary underline-offset-2 hover:underline"
        >
          Track order
        </Link>
      )}
      {printFiles[0] && (
        <button
          type="button"
          className="text-xs font-medium text-fg underline-offset-2 hover:underline"
          onClick={() => void downloadPrintFile(printFiles[0]!.id)}
        >
          Print file · {printFiles[0].widthPx}×{printFiles[0].heightPx} @ {printFiles[0].dpi} DPI
        </button>
      )}
      {error && <span className="text-xs text-destructive">{error}</span>}

      <AuthModal
        open={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onModeChange={setAuthMode}
      />
    </div>
  )
}

async function listPrintFiles(orderId: string): Promise<PrintFileSummary[]> {
  return readOk(
    await fetch(apiUrl(`${API_ORDERS}/${orderId}/print-files`), { credentials: 'include' }),
    (v) => printFileSummarySchema.array().parse(v),
  )
}

function partnerLine(order: {
  state: string
  partner?: string | null
  partnerOrderId?: string | null
}): string | null {
  if (!order.partnerOrderId) return null
  return `Partner · ${order.partner ?? 'sandbox'} · ${order.partnerOrderId} · ${order.state}`
}

async function downloadPrintFile(id: string): Promise<void> {
  const res = await fetch(apiUrl(`${API_PRINT_FILES}/${id}/content`), { credentials: 'include' })
  if (!res.ok) throw new Error('Could not download print file')
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `print-${id}.png`
  a.click()
  URL.revokeObjectURL(url)
}

function openRazorpay(checkout: CheckoutSession): Promise<void> {
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
          description: 'Custom product order',
          handler: async (response: {
            razorpay_order_id: string
            razorpay_payment_id: string
            razorpay_signature: string
          }) => {
            try {
              await readOk(
                await fetch(apiUrl(`${API_ORDERS}/${checkout.orderId}/confirm`), {
                  method: 'POST',
                  credentials: 'include',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    mode: 'razorpay',
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                  }),
                }),
                orderSummarySchema.parse,
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
