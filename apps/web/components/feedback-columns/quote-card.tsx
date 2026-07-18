import type { Review } from './data'

export function QuoteCard({ review }: { review: Review }) {
  return (
    <article className="shrink-0 rounded border border-border bg-bg-elev px-[18px] py-4 shadow-[0_8px_20px_color-mix(in_srgb,var(--fg)_5%,transparent)]">
      <p className="text-sm leading-[1.55] text-fg before:content-['“'] after:content-['”']">
        {review.quote}
      </p>
      <p className="mt-2.5 flex items-center gap-2 text-xs text-fg-muted">
        <strong className="font-bold text-fg">{review.name}</strong>
        <span className="inline-flex min-h-5 items-center rounded border border-border px-2 text-[10px] font-bold tracking-wider text-primary uppercase">
          {review.product}
        </span>
      </p>
    </article>
  )
}
