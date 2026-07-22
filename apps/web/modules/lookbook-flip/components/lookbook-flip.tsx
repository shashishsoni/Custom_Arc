import { cn } from '@/lib/utils'
import { STUDIO_STAGE_BG } from '@/lib/studio-stage-bg'
import { FlipCardFooter } from './flip-card'
import { LookbookSpread } from './lookbook-spread'

export function LookbookFlip() {
  return (
    <section
      className={cn('relative w-full overflow-x-clip', STUDIO_STAGE_BG)}
      aria-labelledby="lookbook-spread-title"
    >
      <div className="mx-auto w-full max-w-7xl px-4 pt-[clamp(4.5rem,10vw,9rem)] pb-[clamp(5.25rem,10vw,9.5rem)] md:px-6">
        <LookbookSpread />
        <FlipCardFooter />
      </div>
    </section>
  )
}
