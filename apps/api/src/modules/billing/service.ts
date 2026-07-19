import { createHmac, timingSafeEqual } from 'node:crypto'
import type { Response as FetchResponse } from 'undici-types'
import {
  RAZORPAY_ENABLED,
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
  RAZORPAY_MIN_AMOUNT_PAISE,
  RAZORPAY_WEBHOOK_SECRET,
} from '@customarc/shared/constants'
import { badRequest, internalServerError, unauthorized } from '../../errors.ts'

export type CheckoutProviderSession = {
  mode: 'razorpay' | 'mock'
  razorpayOrderId: string
  razorpayKeyId?: string
}

export class BillingService {
  async createCheckoutSession(input: {
    orderId: string
    amountMinor: number
    currency: string
  }): Promise<CheckoutProviderSession> {
    if (input.amountMinor < RAZORPAY_MIN_AMOUNT_PAISE) {
      throw badRequest(`Amount must be at least ${RAZORPAY_MIN_AMOUNT_PAISE} paise`)
    }

    if (!RAZORPAY_ENABLED) {
      return { mode: 'mock', razorpayOrderId: `mock_${input.orderId}` }
    }

    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')
    // Bun's global Response can be empty here (no DOM lib); cast to undici's Fetch Response.
    const res = (await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: input.amountMinor,
        currency: input.currency,
        receipt: input.orderId.slice(0, 40),
        notes: { customarcOrderId: input.orderId },
      }),
    })) as unknown as FetchResponse

    if (res.status === 401) {
      throw unauthorized('Razorpay authentication failed')
    }
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw internalServerError('Razorpay order create failed', text)
    }

    const body = (await res.json()) as { id: string }
    return {
      mode: 'razorpay',
      razorpayOrderId: body.id,
      razorpayKeyId: RAZORPAY_KEY_ID,
    }
  }

  verifyPaymentSignature(input: {
    razorpayOrderId: string
    razorpayPaymentId: string
    razorpaySignature: string
  }): boolean {
    if (!RAZORPAY_ENABLED) return false
    if (!input.razorpayOrderId || !input.razorpayPaymentId || !input.razorpaySignature) {
      return false
    }
    const payload = `${input.razorpayOrderId}|${input.razorpayPaymentId}`
    const expected = createHmac('sha256', RAZORPAY_KEY_SECRET).update(payload).digest('hex')
    try {
      const a = Buffer.from(expected, 'utf8')
      const b = Buffer.from(input.razorpaySignature, 'utf8')
      if (a.length !== b.length) return false
      return timingSafeEqual(a, b)
    } catch {
      return false
    }
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!RAZORPAY_WEBHOOK_SECRET || !signature) return false
    const expected = createHmac('sha256', RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest('hex')
    try {
      const a = Buffer.from(expected, 'utf8')
      const b = Buffer.from(signature, 'utf8')
      if (a.length !== b.length) return false
      return timingSafeEqual(a, b)
    } catch {
      return false
    }
  }
}

export const billingService = new BillingService()
