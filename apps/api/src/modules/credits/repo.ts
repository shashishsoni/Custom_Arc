import { prisma } from '@customarc/db'
import type { CreditBalance } from '@customarc/shared'

export interface CreditsRepo {
  sumBalance(userId: string): Promise<number>
  append(entry: {
    userId: string
    type: 'grant' | 'spend' | 'purchase'
    amount: number
    correlationId: string
    reason: string
  }): Promise<void>
  existsCorrelation(userId: string, correlationId: string): Promise<boolean>
}

export const creditsRepo: CreditsRepo = {
  async sumBalance(userId) {
    const result = await prisma.creditLedger.aggregate({
      where: { userId },
      _sum: { amount: true },
    })
    return result._sum.amount ?? 0
  },

  async append(entry) {
    await prisma.creditLedger.create({ data: entry })
  },

  async existsCorrelation(userId, correlationId) {
    const row = await prisma.creditLedger.findUnique({
      where: { userId_correlationId: { userId, correlationId } },
      select: { id: true },
    })
    return row !== null
  },
}

export function toBalance(userId: string, balance: number): CreditBalance {
  return { userId, balance: Math.max(0, balance) }
}
