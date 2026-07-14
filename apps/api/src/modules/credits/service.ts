import type { CreditBalance } from '@customarc/shared'
import { badRequest } from '../../errors.ts'
import { creditsRepo, toBalance } from './repo.ts'

/**
 * Append-only ledger. Balance is derived (sum of rows), never stored-and-mutated.
 * Spends are idempotent by correlationId — a concurrent double-spend with the same
 * key debits once (spec §7.3). The unique constraint enforces this at the DB layer.
 */
export class CreditsService {
  constructor(private readonly repo = creditsRepo) {}

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
}

export const creditsService = new CreditsService()
