import { PRINT_PARTNER, PRINT_PARTNER_SANDBOX } from '@customarc/shared/constants'
import { logger } from '../../logger.ts'

export type PartnerLineItem = {
  partnerSku: string
  storageKey: string
  widthPx: number
  heightPx: number
  dpi: number
  format: string
}

export type PartnerSubmitInput = {
  orderId: string
  currency: string
  totalMinor: number
  items: PartnerLineItem[]
  shipping: {
    name: string
    line1: string
    city: string
    postalCode: string
    country: string
  }
}

export type PartnerSubmitResult = {
  partner: string
  partnerOrderId: string
  mode: 'sandbox' | 'live'
}

/** Swappable print-partner adapter (spec §6). */
export interface PrintPartner {
  submitOrder(input: PartnerSubmitInput): Promise<PartnerSubmitResult>
}

/**
 * Issue 17 first proof — no external HTTP.
 * Live keys are acknowledged but not called until a real partner client exists.
 */
export class SandboxPrintPartner implements PrintPartner {
  async submitOrder(input: PartnerSubmitInput): Promise<PartnerSubmitResult> {
    const partner = PRINT_PARTNER_SANDBOX ? 'sandbox' : PRINT_PARTNER
    const partnerOrderId = `sandbox_${input.orderId}`

    logger.info('sandbox partner submit', {
      partner,
      partnerOrderId,
      orderId: input.orderId,
      items: input.items.length,
      skus: input.items.map((i) => i.partnerSku),
      mode: 'sandbox',
    })

    return { partner, partnerOrderId, mode: 'sandbox' }
  }
}

export const printPartner: PrintPartner = new SandboxPrintPartner()
