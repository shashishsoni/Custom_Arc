'use client'

import { useId, useState, type KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'
import { renderArtifact } from './artifacts'
import { STAGES, STEP_POS } from '../data'
import { MugPreview } from './mug-preview'

export function StageBoard() {
  const [active, setActive] = useState(0)
  const uid = useId()
  const stage = STAGES[active]!
  const progress = (active / (STAGES.length - 1)) * 100
  const panelId = `${uid}-panel`

  function select(index: number, moveFocus = false) {
    setActive(index)
    if (moveFocus) document.getElementById(`${uid}-tab-${index}`)?.focus()
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (index + 1) % STAGES.length
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (index - 1 + STAGES.length) % STAGES.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = STAGES.length - 1
    else return
    e.preventDefault()
    select(next, true)
  }

  return (
    <div
      className={cn(
        'relative isolate min-h-[680px] overflow-hidden rounded border border-border bg-bg-elev shadow-[0_24px_70px_color-mix(in_srgb,var(--fg)_10%,transparent)]',
        'bg-[linear-gradient(color-mix(in_srgb,var(--accent)_4.5%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--accent)_4.5%,transparent)_1px,transparent_1px),var(--bg-elev)] bg-size-[28px_28px]',
        'after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:bg-[radial-gradient(circle_at_53%_44%,rgba(255,255,255,0.94),transparent_29%)] after:content-[""]',
        'max-lg:min-h-[760px] max-md:min-h-[1010px] max-md:bg-size-[24px_24px]',
      )}
    >
      <h3 className="sr-only">AI generation workflow</h3>
      <div className="absolute top-[18px] left-[18px] z-[5] flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.12em] text-fg-muted uppercase before:h-px before:w-6 before:bg-primary before:content-[''] md:top-[22px] md:left-6">
        Generation trace 01
      </div>

      <svg
        className="pointer-events-none absolute top-[105px] left-[5%] z-[1] hidden h-[228px] w-[90%] overflow-visible md:block"
        viewBox="0 0 1000 228"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          pathLength={100}
          d="M34 104 C178 104 220 24 350 52 S520 196 646 148 S824 34 966 74"
          className="fill-none stroke-border-strong stroke-[1.5] [stroke-dasharray:3_7]"
        />
        <path
          pathLength={100}
          d="M34 104 C178 104 220 24 350 52 S520 196 646 148 S824 34 966 74"
          className="fill-none stroke-primary stroke-[2.2] [stroke-linecap:round] transition-[stroke-dashoffset] duration-500 ease-[var(--ease)]"
          strokeDasharray={100}
          strokeDashoffset={100 - progress}
        />
      </svg>

      <ol
        className="absolute inset-x-4 top-[68px] z-[4] m-0 h-[336px] list-none p-0 max-md:before:absolute max-md:before:top-7 max-md:before:bottom-7 max-md:before:left-7 max-md:before:w-0.5 max-md:before:bg-[linear-gradient(var(--accent)_var(--trace-mobile),var(--border-strong)_var(--trace-mobile))] max-md:before:content-[''] md:inset-x-[4%] md:top-[76px] md:h-[260px] lg:inset-x-[4%]"
        style={{ ['--trace-mobile' as string]: `${progress}%` }}
        role="tablist"
        aria-label="Generation stages"
      >
        {STAGES.map((s, i) => {
          const selected = i === active
          return (
            <li key={s.id} className={cn('absolute w-[180px] max-md:relative max-md:mb-3 max-md:w-full', STEP_POS[i])}>
              <button
                id={`${uid}-tab-${i}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={panelId}
                aria-current={selected ? 'step' : undefined}
                tabIndex={selected ? 0 : -1}
                onClick={() => select(i)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className={cn(
                  'grid w-full min-h-14 grid-cols-[44px_minmax(0,1fr)] items-center rounded border border-transparent bg-[color-mix(in_srgb,var(--bg)_86%,transparent)] py-1.5 pr-2 pl-1.5 text-left transition-[background,border-color,box-shadow] duration-200 max-md:min-h-[68px] max-md:bg-[color-mix(in_srgb,var(--bg)_96%,transparent)]',
                  'hover:border-border hover:bg-card',
                  'focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-3 focus-visible:outline-[color-mix(in_srgb,var(--accent)_30%,transparent)]',
                  selected &&
                    'border-primary bg-card shadow-[0_10px_30px_color-mix(in_srgb,var(--fg)_9%,transparent)]',
                )}
              >
                <span
                  className={cn(
                    'grid size-[34px] place-items-center rounded-full border border-border-strong bg-bg text-xs font-bold text-fg-muted transition-[color,background,border-color] duration-200',
                    selected && 'border-primary bg-primary text-accent-fg',
                  )}
                >
                  {s.number}
                </span>
                <span className="block pl-0.5">
                  <span className="block text-sm leading-tight font-bold text-fg">{s.label}</span>
                  <span className="mt-0.5 block text-[11px] leading-tight text-fg-muted">{s.kicker}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>

      <MugPreview stage={active + 1} />

      <article
        id={panelId}
        role="tabpanel"
        aria-labelledby={`${uid}-tab-${active}`}
        aria-live="polite"
        aria-atomic="true"
        className="absolute inset-x-4 bottom-[18px] z-[4] grid min-h-[430px] grid-cols-1 gap-[18px] rounded border border-border bg-white/90 px-[18px] py-[22px] shadow-[0_18px_42px_color-mix(in_srgb,var(--fg)_8%,transparent)] backdrop-blur-[10px] md:inset-x-[5%] md:bottom-[34px] md:min-h-[172px] md:grid-cols-[minmax(0,0.8fr)_minmax(340px,1.2fr)] md:gap-[30px] md:px-7 md:py-[26px]"
      >
        <div>
          <div className="mb-2 text-[11px] font-bold tracking-[0.12em] text-primary uppercase">
            {stage.index}
          </div>
          <h4 className="font-heading m-0 text-2xl font-semibold tracking-tight text-fg md:text-3xl">
            {stage.title}
          </h4>
          <p className="mt-3 max-w-[470px] text-sm leading-relaxed text-fg-muted">{stage.copy}</p>
        </div>
        <div className="flex min-h-[118px] items-stretch justify-center border-t border-border pt-5 md:items-center md:border-t-0 md:border-l md:pt-0 md:pl-[30px]">
          {renderArtifact(stage.id)}
        </div>
      </article>
    </div>
  )
}
