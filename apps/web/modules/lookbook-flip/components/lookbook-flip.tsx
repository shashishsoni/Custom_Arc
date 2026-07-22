import { FlipCardFooter } from './flip-card'
import { LookbookSpread } from './lookbook-spread'

export function LookbookFlip() {
  return (
    <section
      className="relative -mt-px w-full overflow-x-clip border-t-0 bg-[linear-gradient(180deg,var(--bg)_0%,color-mix(in_srgb,var(--accent-warm)_80%,var(--bg))_100%)]"
      aria-labelledby="lookbook-spread-title"
    >
      <div className="mx-auto w-full max-w-7xl px-4 pt-[clamp(4.5rem,10vw,9rem)] pb-[clamp(5.25rem,10vw,9.5rem)] md:px-6">
        <LookbookSpread />
        <FlipCardFooter />
      </div>
    </section>
  )
}
