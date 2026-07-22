/** Decorative arc only — section owns the background. */
export function ArcWash() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <svg
        className="absolute top-[clamp(8px,2vw,28px)] left-1/2 h-[clamp(180px,34vw,320px)] w-[min(1180px,100%)] -translate-x-1/2"
        viewBox="0 0 1180 280"
        preserveAspectRatio="xMidYMid meet"
        role="presentation"
      >
        <path
          d="M -40 210 Q 420 40 680 120 T 1220 88"
          pathLength={1}
          fill="none"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className="stroke-primary opacity-[0.22]"
          strokeWidth={1}
        />
        <path
          d="M 20 196 Q 380 52 620 118 T 1160 96"
          pathLength={1}
          fill="none"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className="stroke-primary opacity-[0.72] [filter:drop-shadow(0_0_18px_color-mix(in_srgb,var(--primary)_22%,transparent))]"
          strokeWidth={2.25}
        />
      </svg>
    </div>
  )
}
