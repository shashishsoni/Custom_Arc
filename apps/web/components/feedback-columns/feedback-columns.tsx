'use client'

import { useEffect, useState } from 'react'

import { ColumnsWall } from './columns-wall'
import { SAMPLE_REVIEWS, type Review } from './data'
import { FeedbackPanel } from './feedback-panel'
import { ReviewDialog } from './review-dialog'

const TITLE_ID = 'feedback-section-title'

export function FeedbackColumns() {
  const [reviews, setReviews] = useState<Review[]>(SAMPLE_REVIEWS)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (!status) return
    const id = window.setTimeout(() => setStatus(''), 6000)
    return () => window.clearTimeout(id)
  }, [status])

  function handleSubmit(review: Review) {
    setReviews((prev) => [review, ...prev])
    setStatus(`Thanks, ${review.name} — your review joined the columns.`)
  }

  return (
    <section
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-x-clip bg-[linear-gradient(180deg,color-mix(in_srgb,var(--accent-warm)_60%,var(--bg))_0%,var(--bg)_100%)]"
      aria-labelledby={TITLE_ID}
    >
      <div className="mx-auto w-full max-w-7xl px-4 pt-[clamp(4.5rem,10vw,9rem)] pb-[clamp(5.25rem,10vw,9.5rem)] md:px-6">
        <div className="grid grid-cols-1 items-start gap-9 lg:grid-cols-[minmax(280px,378px)_1fr] lg:gap-x-14">
          <FeedbackPanel
            titleId={TITLE_ID}
            status={status}
            onOpenReview={() => setDialogOpen(true)}
          />
          <ColumnsWall reviews={reviews} />
        </div>
      </div>

      <ReviewDialog open={dialogOpen} onOpenChange={setDialogOpen} onSubmit={handleSubmit} />
    </section>
  )
}
