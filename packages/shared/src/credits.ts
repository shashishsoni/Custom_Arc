import { z } from 'zod'

/** Append-only credit ledger. Balance is derived, never stored-and-mutated (spec §7.3). */

export const creditEntryTypeSchema = z.enum(['grant', 'spend', 'purchase'])
export type CreditEntryType = z.infer<typeof creditEntryTypeSchema>

export const creditLedgerEntrySchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  type: creditEntryTypeSchema,
  /** Positive for grant/purchase, negative for spend. */
  amount: z.number().int(),
  /** Idempotency key — a spend with a repeated correlationId debits once. */
  correlationId: z.string().min(1),
  reason: z.string().min(1),
  createdAt: z.iso.datetime(),
})
export type CreditLedgerEntry = z.infer<typeof creditLedgerEntrySchema>

export const creditBalanceSchema = z.object({
  userId: z.string().min(1),
  balance: z.number().int().nonnegative(),
})
export type CreditBalance = z.infer<typeof creditBalanceSchema>

export const spendCreditsRequestSchema = z.object({
  correlationId: z.string().min(1),
  amount: z.number().int().positive(),
  reason: z.string().min(1),
})
export type SpendCreditsRequest = z.infer<typeof spendCreditsRequestSchema>
