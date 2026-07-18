'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type FeedbackPanelProps = {
  titleId: string
  status: string
  onOpenReview: () => void
}

export function FeedbackPanel({ titleId, status, onOpenReview }: FeedbackPanelProps) {
  return (
    <div className="sticky top-10 self-start pr-2 max-lg:static max-lg:max-w-[64ch]">
      <p className="mb-[18px] text-xs font-bold tracking-widest text-primary uppercase">
        CustomArc · Feedback
      </p>
      <h2
        id={titleId}
        className="font-heading text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95] font-semibold tracking-tight text-fg"
      >
        Creators & customers <em className="text-primary italic">say</em>
      </h2>
      <p className="mt-[18px] max-w-[34ch] text-lg leading-relaxed text-fg-muted md:text-xl">
        Three quiet columns drift by on the right, at their own pace. This side just holds the words
        still.
      </p>

      <div className="mt-7">
        <Button
          type="button"
          size="lg"
          className="min-h-11 rounded px-[18px] font-bold"
          onClick={onOpenReview}
        >
          Add review
        </Button>
      </div>

      <Link
        href="/catalog"
        className={cn(
          buttonVariants({ variant: 'link', size: 'lg' }),
          'group mt-5 inline-flex min-h-11 gap-1.5 px-0 text-[13.5px] font-bold text-primary no-underline hover:underline',
        )}
      >
        Start customizing
        <ArrowRight
          aria-hidden
          className="size-3.5 transition-transform group-hover:translate-x-0.5"
        />
      </Link>

      <p className="mt-3.5 min-h-[1em] text-[13px] font-semibold text-primary" role="status" aria-live="polite">
        {status}
      </p>
    </div>
  )
}
