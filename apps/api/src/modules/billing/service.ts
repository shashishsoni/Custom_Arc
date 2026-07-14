import { ApiError } from '../../errors.ts'

/**
 * Billing (spec §6, issue 14): Razorpay hosted checkout + signed webhooks.
 * CustomArc never touches card data; verified webhooks are the only source of truth.
 */
export class BillingService {
  async createCheckoutSession(_input: unknown): Promise<never> {
    throw new ApiError(501, 'Checkout not implemented (issue 14)')
  }
  async handlePaymentWebhook(_raw: string, _signature: string): Promise<never> {
    throw new ApiError(501, 'Payment webhook not implemented (issue 14)')
  }
}

export const billingService = new BillingService()
