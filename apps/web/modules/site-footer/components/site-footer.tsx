import { TITLE_ID } from '../data'
import { FooterCloser } from './footer-closer'
import { FooterMasthead } from './footer-masthead'
import { FooterNav } from './footer-nav'

export function SiteFooter() {
  return (
    <footer
      id="site-footer"
      aria-labelledby={TITLE_ID}
      className="relative flex min-h-[88vh] w-full flex-col justify-center overflow-x-clip bg-[radial-gradient(ellipse_90%_120%_at_18%_50%,color-mix(in_srgb,var(--accent)_7%,transparent),transparent_62%),radial-gradient(ellipse_70%_90%_at_88%_40%,color-mix(in_srgb,var(--accent-warm)_14%,transparent),transparent_58%),linear-gradient(105deg,color-mix(in_srgb,var(--accent)_4%,var(--bg))_0%,var(--bg)_38%,color-mix(in_srgb,var(--accent-warm)_10%,var(--bg))_100%)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-85 bg-[radial-gradient(ellipse_95%_55%_at_48%_-8%,color-mix(in_srgb,var(--accent)_8%,transparent),transparent_56%),radial-gradient(ellipse_55%_40%_at_100%_18%,color-mix(in_srgb,var(--accent-warm)_15%,transparent),transparent_52%)]"
      />
      <div className="relative z-[1] mx-auto w-full max-w-7xl px-4 md:px-6">
        <FooterMasthead />
        <hr
          aria-hidden
          className="m-0 border-0 border-t border-[color-mix(in_srgb,var(--accent-2)_22%,var(--border))]"
        />
        <FooterNav />
        <FooterCloser />
      </div>
    </footer>
  )
}
