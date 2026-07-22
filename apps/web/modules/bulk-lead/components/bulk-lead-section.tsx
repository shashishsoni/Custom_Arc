import { cn } from '@/lib/utils'
import { STUDIO_STAGE_BG } from '@/lib/studio-stage-bg'
import { BulkLeadForm } from './bulk-lead-form'
import { COPY, SECTION_ID, TITLE_ID } from '../data'

export function BulkLeadSection() {
  return (
    <section
      id={SECTION_ID}
      aria-labelledby={TITLE_ID}
      className={cn(
        'scroll-mt-[var(--header-h)] relative flex min-h-[calc(100dvh-var(--header-h))] w-full flex-col justify-center overflow-x-clip',
        STUDIO_STAGE_BG,
      )}
    >
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-[clamp(3.5rem,9vw,6.5rem)] md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:items-end md:gap-14 md:px-6">
        <div>
          <p className="mb-3 text-xs font-bold tracking-widest text-primary uppercase">{COPY.eyebrow}</p>
          <h2
            id={TITLE_ID}
            className="max-w-[12ch] font-heading text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95] font-semibold tracking-tight text-fg"
          >
            {COPY.headline}
            <span className="mt-[0.08em] block text-primary italic">{COPY.accent}</span>
          </h2>
          <p className="mt-5 max-w-[42ch] text-lg leading-relaxed text-fg-muted md:text-xl">{COPY.lede}</p>
          <p className="mt-3 text-sm text-fg-muted">{COPY.fine}</p>
        </div>
        <div className="w-full max-w-md md:justify-self-end">
          <BulkLeadForm />
        </div>
      </div>
    </section>
  )
}
