'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  orderTrackingStatusSchema,
  type OrderState,
  type OrderTrackingStatus,
} from '@customarc/shared'
import { API_ORDERS, WEB_CATALOG, apiUrl } from '@customarc/shared/constants'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const STEPS: OrderState[] = ['paid', 'in_production', 'shipped', 'delivered']

type Props = { orderId: string }

export function OrderStatusView({ orderId }: Props) {
  const [status, setStatus] = useState<OrderTrackingStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setError(null)
    try {
      const res = await fetch(apiUrl(`${API_ORDERS}/${orderId}/tracking`), {
        credentials: 'include',
      })
      const body = (await res.json().catch(() => null)) as {
        success?: boolean
        data?: unknown
        error?: string
      } | null
      if (res.status === 401) throw new Error('Sign in to view this order')
      if (!res.ok || !body?.success || body.data === undefined) {
        throw new Error(body?.error ?? `Could not load order (${res.status})`)
      }
      setStatus(orderTrackingStatusSchema.parse(body.data))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    }
  }, [orderId])

  useEffect(() => {
    void load()
  }, [load])

  const advance = async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(apiUrl(`${API_ORDERS}/${orderId}/tracking/advance`), {
        method: 'POST',
        credentials: 'include',
      })
      const body = (await res.json().catch(() => null)) as {
        success?: boolean
        data?: unknown
        error?: string
      } | null
      if (!res.ok || !body?.success || body.data === undefined) {
        throw new Error(body?.error ?? 'Could not advance status')
      }
      setStatus(orderTrackingStatusSchema.parse(body.data))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Advance failed')
    } finally {
      setBusy(false)
    }
  }

  const canAdvance =
    status &&
    (status.state === 'in_production' || status.state === 'shipped') &&
    Boolean(status.partnerOrderId)

  return (
    <div className="mx-auto w-full max-w-xl">
      <p className="mb-2 text-xs font-bold tracking-widest text-primary uppercase">Order status</p>
      <h1 className="font-heading text-[clamp(2rem,5vw,3rem)] leading-[1.02] font-semibold tracking-tight text-fg">
        Track your order
      </h1>
      <p className="mt-2 text-sm text-fg-muted">Order · {orderId}</p>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      {status && (
        <div className="mt-8 space-y-6">
          <ol className="space-y-3">
            {STEPS.map((step) => {
              const active = status.state === step
              const done = stepIndex(status.state) >= stepIndex(step)
              return (
                <li
                  key={step}
                  className={cn(
                    'flex items-center gap-3 border border-border px-3 py-2.5 text-sm',
                    done ? 'bg-[color-mix(in_srgb,var(--bg-card)_90%,transparent)]' : 'opacity-50',
                    active && 'border-primary',
                  )}
                >
                  <span
                    className={cn(
                      'inline-block size-2 rounded-full',
                      done ? 'bg-primary' : 'bg-border-strong',
                    )}
                  />
                  <span className="font-medium capitalize text-fg">{labelFor(step)}</span>
                </li>
              )
            })}
          </ol>

          <dl className="grid gap-2 text-sm text-fg-muted">
            <div className="flex justify-between gap-4">
              <dt>Partner</dt>
              <dd className="text-fg">{status.partner ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Partner order</dt>
              <dd className="truncate text-fg">{status.partnerOrderId ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Carrier</dt>
              <dd className="text-fg">{status.carrier ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Tracking #</dt>
              <dd className="text-fg">{status.trackingNumber ?? '—'}</dd>
            </div>
          </dl>

          {canAdvance && (
            <Button
              type="button"
              variant="outline"
              className="min-h-11 rounded"
              disabled={busy}
              onClick={() => void advance()}
            >
              {busy
                ? 'Updating…'
                : status.state === 'in_production'
                  ? 'Simulate shipped (sandbox)'
                  : 'Simulate delivered (sandbox)'}
            </Button>
          )}
        </div>
      )}

      <p className="mt-10">
        <Link href={WEB_CATALOG} className="text-sm font-medium text-primary underline-offset-2 hover:underline">
          Back to catalog
        </Link>
      </p>
    </div>
  )
}

function stepIndex(state: OrderState): number {
  const i = STEPS.indexOf(state)
  if (state === 'designing' || state === 'cancelled') return -1
  if (state === 'paid') return 0
  return i
}

function labelFor(state: OrderState): string {
  switch (state) {
    case 'paid':
      return 'Paid'
    case 'in_production':
      return 'In production'
    case 'shipped':
      return 'Shipped'
    case 'delivered':
      return 'Delivered'
    default:
      return state
  }
}
