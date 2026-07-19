import { cn } from '@/lib/utils'

import type { Review } from '../data'
import { QuoteCard } from './quote-card'

type QuoteColumnProps = {
  reviews: Review[]
  dir: 'up' | 'down'
  duration: string
  className?: string
}

export function QuoteColumn({ reviews, dir, duration, className }: QuoteColumnProps) {
  const cards = reviews.map((review, i) => (
    <QuoteCard key={`${review.name}-${i}`} review={review} />
  ))

  return (
    <div
      className={cn(
        'group/col relative h-[min(72vh,640px)] overflow-hidden rounded border border-border bg-card',
        'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-[2] before:h-14 before:bg-[linear-gradient(180deg,var(--card),transparent)] before:content-[""]',
        'after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:z-[2] after:h-14 after:bg-[linear-gradient(0deg,var(--card),transparent)] after:content-[""]',
        'md:h-[min(60vh,520px)] max-sm:h-[min(56vh,440px)]',
        className,
      )}
    >
      <div
        aria-hidden
        className={cn(
          'column-track flex w-full flex-col gap-3.5 px-4 py-5',
          'group-hover/col:[animation-play-state:paused] group-focus-within/col:[animation-play-state:paused]',
        )}
        style={{
          animationName: dir === 'up' ? 'col-up' : 'col-down',
          animationDuration: duration,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
        }}
      >
        {cards}
        {cards}
      </div>
    </div>
  )
}
