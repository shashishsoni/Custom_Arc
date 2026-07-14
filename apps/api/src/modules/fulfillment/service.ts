import { ApiError } from '../../errors.ts'

/**
 * Print partner adapter (spec §6, issues 15, 17). The Print File is manufacturer-agnostic;
 * the partner is a swappable implementation behind this interface.
 */
export interface PrintPartner {
  submitOrder(input: {
    printFiles: { storageKey: string; widthPx: number; heightPx: number }[]
    shipping: unknown
  }): Promise<{ partnerOrderId: string }>
}

export class FulfillmentService {
  async submitToPartner(_input: unknown): Promise<never> {
    throw new ApiError(501, 'Fulfillment not implemented (issue 17)')
  }
}

export const fulfillmentService = new FulfillmentService()
