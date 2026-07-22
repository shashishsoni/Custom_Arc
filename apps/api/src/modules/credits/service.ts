import type { CreditBalance, CreditCheckoutSession, CreditConfirmRequest } from '@customarc/shared'
import { CREDIT_PACKS, getCreditPack } from '@customarc/shared'
import { badRequest, notFound } from '../../errors.ts'
import { logger } from '../../logger.ts'
import { billingService } from '../billing/service.ts'
import { creditsRepo, toBalance } from './repo.ts'

/**
 * Append-only ledger. Balance is derived (sum of rows), never stored-and-mutated.
 * Spends are idempotent by correlationId — a concurrent double-spend with the same
 * key debits once (spec §7.3). The unique constraint enforces this at the DB layer.
 */
export class CreditsService {
  constructor(
    private readonly repo = creditsRepo,
    private readonly billing = billingService,
  ) {}

  listPacks() {
    return CREDIT_PACKS.map((p) => ({ ...p }))
  }

  async getBalance(userId: string): Promise<CreditBalance> {
    return toBalance(userId, await this.repo.sumBalance(userId))
  }

  async grantFreeAllocation(userId: string): Promise<CreditBalance> {
    const FREE_GRANT = 10
    const correlationId = `signup-grant:${userId}`
    if (!(await this.repo.existsCorrelation(userId, correlationId))) {
      await this.repo.append({
        userId,
        type: 'grant',
        amount: FREE_GRANT,
        correlationId,
        reason: 'signup free allocation',
      })
    }
    return this.getBalance(userId)
  }

  /** Idempotent spend. Returns the post-spend balance. A replay with the same key is a no-op. */
  async spend(args: {
    userId: string
    correlationId: string
    amount: number
    reason: string
  }): Promise<CreditBalance> {
    if (await this.repo.existsCorrelation(args.userId, args.correlationId)) {
      return this.getBalance(args.userId)
    }

    const balance = await this.repo.sumBalance(args.userId)
    if (balance < args.amount) {
      throw badRequest('Insufficient credits')
    }

    await this.repo.append({
      userId: args.userId,
      type: 'spend',
      amount: -args.amount,
      correlationId: args.correlationId,
      reason: args.reason,
    })
    return this.getBalance(args.userId)
  }

  async startPackCheckout(userId: string, packId: string): Promise<CreditCheckoutSession> {
    const pack = getCreditPack(packId)
    if (!pack) throw notFound('Credit pack not found')

    const receipt = `cp_${userId.slice(-10)}_${pack.id}`.slice(0, 40)
    const session = await this.billing.createCheckoutSession({
      orderId: receipt,
      amountMinor: pack.priceMinor,
      currency: pack.currency,
      notes: {
        kind: 'credit_pack',
        userId,
        packId: pack.id,
        credits: String(pack.credits),
      },
    })

    return {
      mode: session.mode,
      amountMinor: pack.priceMinor,
      currency: pack.currency,
      razorpayOrderId: session.razorpayOrderId,
      ...(session.razorpayKeyId ? { razorpayKeyId: session.razorpayKeyId } : {}),
      packId: pack.id,
      credits: pack.credits,
    }
  }

  async confirmPackPurchase(userId: string, body: CreditConfirmRequest): Promise<CreditBalance> {
    const pack = getCreditPack(body.packId)
    if (!pack) throw notFound('Credit pack not found')

    if (body.mode === 'mock') {
      if (!body.razorpayOrderId.startsWith('mock_')) {
        throw badRequest('Mock confirm only allowed for mock checkout sessions')
      }
      return this.grantPurchase({
        userId,
        packId: pack.id,
        credits: pack.credits,
        correlationId: `purchase:${body.razorpayOrderId}`,
        reason: `credit pack ${pack.id} (mock)`,
      })
    }

    if (
      !this.billing.verifyPaymentSignature({
        razorpayOrderId: body.razorpayOrderId,
        razorpayPaymentId: body.razorpayPaymentId,
        razorpaySignature: body.razorpaySignature,
      })
    ) {
      throw badRequest('Invalid payment signature')
    }

    return this.grantPurchase({
      userId,
      packId: pack.id,
      credits: pack.credits,
      correlationId: `purchase:${body.razorpayOrderId}`,
      reason: `credit pack ${pack.id}`,
    })
  }

  /** Webhook path — idempotent grant from Razorpay order notes. */
  async grantFromRazorpayOrder(razorpayOrderId: string): Promise<void> {
    const notes = await this.billing.getOrderNotes(razorpayOrderId)
    if (notes.kind !== 'credit_pack') return
    const userId = notes.userId
    const packId = notes.packId
    if (!userId || !packId) {
      logger.warn('credit pack webhook missing notes', { razorpayOrderId })
      return
    }
    const pack = getCreditPack(packId)
    if (!pack) {
      logger.warn('credit pack webhook unknown pack', { packId, razorpayOrderId })
      return
    }
    await this.grantPurchase({
      userId,
      packId: pack.id,
      credits: pack.credits,
      correlationId: `purchase:${razorpayOrderId}`,
      reason: `credit pack ${pack.id}`,
    })
  }

  private async grantPurchase(args: {
    userId: string
    packId: string
    credits: number
    correlationId: string
    reason: string
  }): Promise<CreditBalance> {
    if (!(await this.repo.existsCorrelation(args.userId, args.correlationId))) {
      await this.repo.append({
        userId: args.userId,
        type: 'purchase',
        amount: args.credits,
        correlationId: args.correlationId,
        reason: args.reason,
      })
      logger.info('credit pack purchased', {
        userId: args.userId,
        packId: args.packId,
        credits: args.credits,
        correlationId: args.correlationId,
      })
    }
    return this.getBalance(args.userId)
  }
}

export const creditsService = new CreditsService()
