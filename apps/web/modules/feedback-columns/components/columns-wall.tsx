'use client'

import { cn } from '@/lib/utils'

import { bucketReviews, COLUMN_CONFIG, type Review } from '../data'
import { QuoteCard } from './quote-card'
import { QuoteColumn } from './quote-column'

type ColumnsWallProps = {
  reviews: Review[]
}

export function ColumnsWall({ reviews }: ColumnsWallProps) {
  const buckets = bucketReviews(reviews)

  return (
    <section className="min-w-0" aria-labelledby="feedback-columns-title">
      <h2 id="feedback-columns-title" className="sr-only">
        Live wall of reviews
      </h2>

      <style>{`
        @keyframes col-up { from { transform: translateY(0); } to { transform: translateY(-50%); } }
        @keyframes col-down { from { transform: translateY(-50%); } to { transform: translateY(0); } }
      `}</style>

      <div className="relative grid grid-cols-1 gap-4 rounded border border-border bg-bg-elev p-5 shadow-[0_24px_70px_color-mix(in_srgb,var(--fg)_10%,transparent)] motion-reduce:hidden md:grid-cols-2 lg:grid-cols-3">
        {COLUMN_CONFIG.map((col, i) => (
          <QuoteColumn
            key={i}
            reviews={buckets[i as 0 | 1 | 2]}
            dir={col.dir}
            duration={col.duration}
            className={cn(
              i === 1 && 'max-md:hidden',
              i === 2 && 'max-lg:hidden',
            )}
          />
        ))}
      </div>

      <ul
        className="mt-0 hidden list-none grid-cols-1 gap-4 p-0 motion-reduce:grid md:grid-cols-2 lg:grid-cols-3"
        aria-label="All reviews"
      >
        {buckets.map((list, i) => (
          <li
            key={i}
            className={cn('list-none', i === 1 && 'max-md:hidden', i === 2 && 'max-lg:hidden')}
          >
            <h3 className="mb-2.5 text-xs font-bold tracking-wider text-accent-2 uppercase">
              Column {i + 1}
            </h3>
            <ul className="flex list-none flex-col gap-3 p-0">
              {list.map((review, j) => (
                <li key={`${review.name}-${j}`} className="list-none">
                  <QuoteCard review={review} />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  )
}
