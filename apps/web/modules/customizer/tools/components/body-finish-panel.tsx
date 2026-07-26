'use client'

import {
  BODY_FINISH_PRESETS,
  type BodyFinishId,
  type DesignDocument,
} from '@customarc/shared'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const FINISH_IDS = Object.keys(BODY_FINISH_PRESETS) as BodyFinishId[]

type Props = {
  doc: DesignDocument
  onDocChange: (doc: DesignDocument) => void
}

const label = 'mb-2 text-[0.625rem] font-bold tracking-[0.14em] text-fg-muted uppercase'
const panel = 'rounded border border-border bg-card p-3'

/** Mug-only body PBR picker (MorphLens Material). Phone-case deferred. */
export function BodyFinishPanel({ doc, onDocChange }: Props) {
  const active = doc.bodyFinish?.id ?? 'ceramic'

  return (
    <section className={panel} aria-labelledby="finish-label">
      <h2 id="finish-label" className={label}>
        Body finish
      </h2>
      <div className="grid grid-cols-2 gap-1.5">
        {FINISH_IDS.map((id) => {
          const preset = BODY_FINISH_PRESETS[id]
          const selected = id === active
          return (
            <Button
              key={id}
              type="button"
              variant="outline"
              className={cn(
                'h-auto min-h-11 flex-col items-start gap-0.5 rounded px-2.5 py-2 text-left',
                selected &&
                  'border-primary bg-[color-mix(in_srgb,var(--primary)_10%,var(--card))]',
              )}
              aria-pressed={selected}
              onClick={() => onDocChange({ ...doc, bodyFinish: { id } })}
            >
              <span className="text-xs font-medium text-fg">{preset.label}</span>
              <span className="text-[0.625rem] text-fg-muted">
                {preset.orderable ? 'Orderable' : 'Preview only'}
              </span>
            </Button>
          )
        })}
      </div>
      <p className="mt-2 text-[0.6875rem] leading-snug text-fg-muted">
        Applies the finish to the mug body and the print band (artwork stays readable).
      </p>
    </section>
  )
}
