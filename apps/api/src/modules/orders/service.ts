import { ApiError } from '../../errors.ts'

/**
 * Order state machine (spec §4, issue 16). Transitions validated server-side.
 *   designing → paid → in_production → shipped → delivered
 *   designing|paid → cancelled
 */
export type OrderState = 'designing' | 'paid' | 'in_production' | 'shipped' | 'delivered' | 'cancelled'

const LEGAL_TRANSITIONS: Record<OrderState, OrderState[]> = {
  designing: ['paid', 'cancelled'],
  paid: ['in_production', 'cancelled'],
  in_production: ['shipped'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
}

export function assertTransition(from: OrderState, to: OrderState): void {
  if (!LEGAL_TRANSITIONS[from].includes(to)) {
    throw new ApiError(409, `Illegal order transition: ${from} → ${to}`)
  }
}

/** Full order lifecycle is implemented in issues 14, 16, 18. */
export class OrderService {
  async createFromCheckout(_input: unknown): Promise<never> {
    throw new ApiError(501, 'Order checkout not implemented (issue 14/16)')
  }
  async transition(_orderId: string, _to: OrderState): Promise<never> {
    throw new ApiError(501, 'Order transitions not implemented (issue 16/18)')
  }
}

export const orderService = new OrderService()
