import { StageBoard } from './stage-board'

const TITLE_ID = 'generation-trace-title'

export function GenerationTrace() {
  return (
    <section
      className="relative w-full overflow-x-clip border-b-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--accent-warm)_80%,var(--bg))_0%,var(--bg)_100%)]"
      aria-labelledby={TITLE_ID}
    >
      <div className="mx-auto w-full max-w-7xl px-4 pt-[clamp(4.5rem,10vw,9rem)] pb-[clamp(5.25rem,10vw,9.5rem)] md:px-6">
        <header className="grid grid-cols-1 items-end gap-6 pb-[clamp(3.4rem,7vw,5.75rem)] md:grid-cols-[minmax(0,1fr)_auto] md:gap-8">
          <div>
            <h2
              id={TITLE_ID}
              className="font-heading max-w-[14ch] text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.9] font-semibold tracking-tight text-fg"
            >
              Intelligence shaped for{' '}
              <em className="text-primary italic">real products</em>
            </h2>
            <p className="mt-8 max-w-[600px] text-lg leading-relaxed text-fg-muted md:text-xl max-md:mt-6">
              Describe a surface, generate a wrap, and see it take shape on a mug or phone case before it
              goes to print.
            </p>
          </div>
          <div
            className="flex min-h-11 items-center gap-2.5 justify-self-start rounded border border-border bg-white/70 px-3 py-2 text-[13px] whitespace-nowrap text-accent-2"
            aria-label="Credits information"
          >
            <span
              className="grid size-6 place-items-center rounded-full border border-primary text-[11px] font-bold text-primary"
              aria-hidden
            >
              Cr
            </span>
            <span>
              <strong className="text-fg">1 Generation</strong> uses Credits
            </span>
          </div>
        </header>

        <StageBoard />
      </div>
    </section>
  )
}
