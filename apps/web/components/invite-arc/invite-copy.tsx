import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { COPY, HREF, TITLE_ID } from './data'

export function InviteCopy() {
  return (
    <div className="mx-auto flex max-w-[min(560px,100%)] flex-col items-center gap-[clamp(1.125rem,2.8vw,1.625rem)] text-center">
      <h2
        id={TITLE_ID}
        className="font-heading relative z-[1] mx-auto max-w-[14ch] text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95] font-semibold tracking-tight text-fg max-sm:max-w-[12ch]"
      >
        {COPY.headline}
        <span className="mt-[0.08em] block text-primary italic">{COPY.accent}</span>
      </h2>

      <p className="mx-auto max-w-[42ch] text-lg leading-relaxed text-fg-muted md:text-xl">
        {COPY.lede}
      </p>

      <div className="flex w-full max-w-[360px] flex-col items-stretch justify-center gap-3 pt-0.5 sm:max-w-none sm:flex-row sm:items-center sm:justify-center">
        <Link
          href={HREF}
          className={cn(
            buttonVariants({ size: 'lg' }),
            'min-h-11 w-full rounded px-[22px] font-semibold tracking-wide shadow-[0_12px_28px_color-mix(in_srgb,var(--primary)_22%,transparent)] sm:w-auto',
          )}
        >
          {COPY.primaryCta}
        </Link>
        <Link
          href={HREF}
          className={cn(
            buttonVariants({ variant: 'outline', size: 'lg' }),
            'group min-h-11 w-full gap-2 rounded border-border-strong bg-[color-mix(in_srgb,var(--card)_72%,transparent)] px-[22px] font-semibold tracking-wide text-accent-2 hover:border-[color-mix(in_srgb,var(--primary)_38%,var(--border))] hover:text-primary sm:w-auto',
          )}
        >
          {COPY.secondaryCta}
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
          />
        </Link>
      </div>

      <p className="pt-0.5 text-sm tracking-[0.01em] text-fg-muted">{COPY.fine}</p>
    </div>
  )
}
