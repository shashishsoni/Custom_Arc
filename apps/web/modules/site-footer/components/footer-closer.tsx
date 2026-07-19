import { CLOSER } from '../data'

export function FooterCloser() {
  return (
    <div className="mt-[clamp(2.75rem,6vw,4rem)] flex flex-col gap-4 border-t border-[color-mix(in_srgb,var(--accent-2)_22%,var(--border))] pt-[clamp(1.5rem,3vw,2rem)] sm:flex-row sm:items-center sm:justify-between">
      <p className="m-0 text-[0.8125rem] tracking-[0.06em] text-fg-muted uppercase">
        {CLOSER.volume}
      </p>
      <p
        aria-hidden
        className="font-heading m-0 text-sm tracking-[0.04em] text-accent-2 italic"
      >
        {CLOSER.fin}
      </p>
      <p className="m-0 text-[0.8125rem] text-fg-muted">{CLOSER.copyright}</p>
    </div>
  )
}
