import { MASTHEAD, TITLE_ID } from './data'

export function FooterMasthead() {
  return (
    <header className="mb-[clamp(2rem,5vw,3.25rem)]">
      <h2
        id={TITLE_ID}
        className="font-heading text-[clamp(3.5rem,14vw,7rem)] leading-[0.88] font-semibold tracking-[-0.035em] text-primary [overflow-wrap:anywhere]"
      >
        {MASTHEAD.wordmark}
      </h2>
      <p className="font-heading mt-[clamp(0.75rem,2vw,1.125rem)] text-[clamp(1.125rem,2.8vw,1.625rem)] font-normal tracking-[0.01em] text-accent-2 italic">
        {MASTHEAD.tagline}
      </p>
    </header>
  )
}
