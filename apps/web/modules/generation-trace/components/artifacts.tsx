import { cn } from '@/lib/utils'

export function DescribeArtifact() {
  return (
    <div className="flex min-h-14 w-full max-w-[470px] items-center gap-3 rounded border border-border-strong bg-bg px-3.5 py-2.5 text-sm text-fg">
      <span className="font-bold tracking-tighter text-primary" aria-hidden>
        &gt;_
      </span>
      <span>soft rose currents, paper-cut edges, warm ceramic</span>
    </div>
  )
}

export function GenerateArtifact() {
  return (
    <div
      className="grid w-full max-w-[470px] grid-cols-1 gap-2 sm:grid-cols-3"
      aria-label="Three generated texture variations"
    >
      {[
        'bg-[radial-gradient(circle_at_22%_28%,color-mix(in_srgb,var(--bg-card)_90%,var(--secondary))_0_7%,transparent_8%),radial-gradient(circle_at_70%_64%,var(--accent)_0_11%,transparent_12%),linear-gradient(135deg,color-mix(in_srgb,var(--accent)_55%,white),color-mix(in_srgb,var(--accent)_25%,white))]',
        'bg-[repeating-linear-gradient(115deg,transparent_0_12px,rgba(255,255,255,0.46)_13px_15px),linear-gradient(135deg,color-mix(in_srgb,var(--accent)_70%,black),color-mix(in_srgb,var(--accent)_40%,white))]',
        'bg-[radial-gradient(ellipse_at_20%_80%,color-mix(in_srgb,var(--bg-card)_90%,var(--secondary))_0_15%,transparent_16%),radial-gradient(ellipse_at_72%_30%,color-mix(in_srgb,var(--accent)_75%,black)_0_12%,transparent_13%),color-mix(in_srgb,var(--accent)_45%,white)]',
      ].map((bg, i) => (
        <div
          key={bg}
          className={cn(
            'relative h-12 overflow-hidden rounded border border-border sm:h-[76px]',
            bg,
          )}
        >
          <span className="absolute right-1 bottom-1 bg-[color-mix(in_srgb,var(--fg)_65%,transparent)] px-1.5 py-px text-[9px] tracking-widest text-white uppercase">
            {String.fromCharCode(65 + i)}
          </span>
        </div>
      ))}
    </div>
  )
}

export function PreviewArtifact() {
  return (
    <div className="grid w-full max-w-[470px] grid-cols-1 items-center gap-2 sm:grid-cols-[1fr_auto] sm:gap-4">
      <div
        aria-hidden
        className="h-[92px] rounded border border-border shadow-[inset_18px_0_20px_rgba(255,255,255,0.25),inset_-18px_0_20px_color-mix(in_srgb,var(--fg)_10%,transparent)] sm:h-[76px] bg-[linear-gradient(90deg,rgba(255,255,255,0.15),transparent_22%_78%,color-mix(in_srgb,var(--fg)_16%,transparent)),radial-gradient(circle_at_22%_32%,color-mix(in_srgb,var(--bg-card)_90%,var(--secondary))_0_6%,transparent_7%),radial-gradient(circle_at_68%_61%,var(--accent)_0_9%,transparent_10%),linear-gradient(135deg,color-mix(in_srgb,var(--accent)_55%,white),color-mix(in_srgb,var(--accent)_25%,white))]"
      />
      <span className="text-[11px] font-bold tracking-widest text-accent-2 uppercase">
        flat image → curved wrap
      </span>
    </div>
  )
}

export function FinishArtifact() {
  return (
    <div className="flex flex-wrap justify-start gap-2 sm:justify-center" aria-label="Available manual controls">
      {['Place', 'Scale', 'Text', 'Background'].map((label) => (
        <span
          key={label}
          className="inline-flex min-h-9 items-center gap-1.5 rounded border border-border bg-bg px-2.5 py-1.5 text-xs font-semibold text-accent-2 before:size-1.5 before:rounded-full before:border before:border-primary before:bg-secondary before:content-[''] sm:min-h-11"
        >
          {label}
        </span>
      ))}
    </div>
  )
}

export function renderArtifact(stageId: string) {
  switch (stageId) {
    case 'describe':
      return <DescribeArtifact />
    case 'generate':
      return <GenerateArtifact />
    case 'preview':
      return <PreviewArtifact />
    case 'finish':
      return <FinishArtifact />
    default:
      return null
  }
}
