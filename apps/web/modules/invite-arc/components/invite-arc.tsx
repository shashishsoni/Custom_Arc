import { ArcWash } from './arc-wash'
import { TITLE_ID } from '../data'
import { InviteCopy } from './invite-copy'

export function InviteArc() {
  return (
    <section
      className="relative w-full overflow-x-clip bg-[radial-gradient(ellipse_90%_120%_at_18%_50%,color-mix(in_srgb,var(--accent)_7%,transparent),transparent_62%),radial-gradient(ellipse_70%_90%_at_88%_40%,color-mix(in_srgb,var(--accent-warm)_14%,transparent),transparent_58%),linear-gradient(105deg,color-mix(in_srgb,var(--accent)_4%,var(--bg))_0%,var(--bg)_38%,color-mix(in_srgb,var(--accent-warm)_10%,var(--bg))_100%)]"
      aria-labelledby={TITLE_ID}
    >
      <ArcWash />
      <div className="relative z-[1] mx-auto w-full max-w-7xl px-4 py-[clamp(4.5rem,11vw,8rem)] md:px-6">
        <InviteCopy />
      </div>
    </section>
  )
}
