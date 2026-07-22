'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import type { DesignTexture } from '../design/design-texture'
import { cn } from '@/lib/utils'
import { STUDIO_STAGE_BG } from '@/lib/studio-stage-bg'

export { STUDIO_STAGE_BG } from '@/lib/studio-stage-bg'
export type StudioStageProps = {
  children: ReactNode
  title?: string
  meta?: string
  hint?: string
  /** Pass to show the flat-template panel; `null` = loading. Omit to hide. */
  texture?: DesignTexture | null
  flatMeta?: string
  showViewportMark?: boolean
  className?: string
  'aria-label'?: string
}

/** Flat shared stage shell — home hero applies its own desk tilt on the scene host. */
export function StudioStage({
  children,
  title,
  meta,
  hint,
  texture,
  flatMeta,
  showViewportMark = true,
  className,
  'aria-label': ariaLabel = 'Product preview',
}: StudioStageProps) {
  const flatHost = useRef<HTMLDivElement>(null)
  const showFlat = texture !== undefined
  const showCaption = Boolean(title || meta || hint)

  useEffect(() => {
    const host = flatHost.current
    if (!host || !texture) return
    const { canvas } = texture
    canvas.className = 'max-h-28 w-full max-w-xs bg-transparent'
    host.replaceChildren(canvas)
    return () => {
      host.replaceChildren()
    }
  }, [texture])

  return (
    <section
      aria-label={ariaLabel}
      className={cn(
        'relative grid min-h-0 place-items-center overflow-hidden border border-border',
        STUDIO_STAGE_BG,
        className,
      )}
    >
      <div className="absolute inset-0 z-0 [&_canvas]:block [&_canvas]:size-full [&_canvas]:touch-none [&_canvas]:outline-none">
        {children}
      </div>

      {showCaption && (
        <div className="pointer-events-none absolute top-[clamp(1.25rem,3vw,2.25rem)] left-[clamp(1.25rem,3vw,2.25rem)] z-[1] max-w-[min(20rem,42vw)]">
          {title ? (
            <h2 className="font-heading text-[clamp(1.5rem,2.8vw,2.25rem)] leading-[1.02] font-semibold tracking-tight text-fg">
              {title}
            </h2>
          ) : null}
          {meta ? <p className="mt-1.5 text-[0.8125rem] text-fg-muted">{meta}</p> : null}
          {hint ? (
            <p className="mt-2 text-xs font-bold tracking-widest text-primary uppercase">{hint}</p>
          ) : null}

          {showFlat && (
            <div className="mt-4 overflow-hidden rounded border border-border bg-[color-mix(in_srgb,var(--bg-card)_88%,transparent)] shadow-[0_8px_24px_rgba(61,52,64,0.06)] backdrop-blur-sm">
              <div className="flex items-baseline justify-between gap-2 border-b border-border px-2.5 py-1.5">
                <p className="text-[0.625rem] font-bold tracking-[0.14em] text-fg-muted uppercase">
                  Flat template
                </p>
                {flatMeta ? (
                  <p className="truncate text-[0.625rem] text-fg-muted">{flatMeta}</p>
                ) : null}
              </div>
              <div ref={flatHost} className="px-2 py-2" />
              {texture === null && (
                <p className="px-2 pb-3 text-center text-xs text-fg-muted">Loading print template…</p>
              )}
            </div>
          )}
        </div>
      )}

      {showViewportMark && (
        <span className="pointer-events-none absolute right-[clamp(1rem,2.5vw,2rem)] bottom-[clamp(1rem,2.5vw,2rem)] z-[1] text-[0.5625rem] font-semibold tracking-[0.14em] text-fg-muted/70 uppercase">
          viewport · customarc
        </span>
      )}
    </section>
  )
}
