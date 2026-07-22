const EVENT = 'customarc:credits'

/** Broadcast a known balance (after AI spend / pack purchase). */
export function publishCreditsBalance(balance: number) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { balance } }))
}

/** Subscribe to live balance updates. Returns unsubscribe. */
export function subscribeCreditsBalance(onBalance: (balance: number) => void) {
  if (typeof window === 'undefined') return () => undefined
  const handler = (e: Event) => {
    const balance = (e as CustomEvent<{ balance?: number }>).detail?.balance
    if (typeof balance === 'number' && Number.isFinite(balance)) onBalance(balance)
  }
  window.addEventListener(EVENT, handler)
  return () => window.removeEventListener(EVENT, handler)
}
