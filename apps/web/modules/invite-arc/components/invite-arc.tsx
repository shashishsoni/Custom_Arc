import { cn } from '@/lib/utils'
import { STUDIO_STAGE_BG_TOP } from '@/lib/studio-stage-bg'
import { ArcWash } from './arc-wash'
import { TITLE_ID } from '../data'
import { InviteCopy } from './invite-copy'

export function InviteArc() {
  return (
    <section
      className={cn('relative w-full overflow-x-clip', STUDIO_STAGE_BG_TOP)}
      aria-labelledby={TITLE_ID}
    >
      <ArcWash />
      <div className="relative z-[1] mx-auto w-full max-w-7xl px-4 py-[clamp(4.5rem,11vw,8rem)] md:px-6">
        <InviteCopy />
      </div>
    </section>
  )
}
