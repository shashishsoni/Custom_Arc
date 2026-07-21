import type { OrderSummary } from '@customarc/shared'
import { conflict } from '../../errors.ts'

export type OrderState = OrderSummary['state']

const LEGAL: Record<OrderState, OrderState[]> = {
  designing: ['paid', 'cancelled'],
  paid: ['in_production', 'cancelled'],
  in_production: ['shipped'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
}

export function assertTransition(from: OrderState, to: OrderState): void {
  if (!LEGAL[from].includes(to)) {
    throw conflict(`Illegal order transition: ${from} → ${to}`)
  }
}
