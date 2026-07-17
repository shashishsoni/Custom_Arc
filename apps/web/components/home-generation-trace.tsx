'use client'

import Link from 'next/link'
import { useId, useState, type KeyboardEvent, type ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Stage = {
  id: string
  number: string
  label: string
  kicker: string
  index: string
  title: string
  copy: string
  artifact: ReactNode
}

const STAGES: Stage[] = [
  {
    id: 'describe',
    number: '01',
    label: 'Describe',
    kicker: 'Write the surface',
    index: 'Stage 01 · Prompt input',
    title: 'Describe the surface',
    copy: 'Start with words for the printable surface. One prompt creates one image Generation; it does not change the product geometry.',
    artifact: (
      <div className="flex min-h-14 w-full max-w-[470px] items-center gap-3 rounded border border-border-strong bg-bg px-3.5 py-2.5 text-sm text-fg">
        <span className="font-bold tracking-tighter text-primary" aria-hidden>
          &gt;_
        </span>
        <span>soft rose currents, paper-cut edges, warm ceramic</span>
      </div>
    ),
  },
  {
    id: 'generate',
    number: '02',
    label: 'Generate',
    kicker: 'Prompt to image',
    index: 'Stage 02 · Image output',
    title: 'Generate a wrap',
    copy: 'The prompt produces an image for the printable area. A Generation spends Credits, and the output remains an image—not a new 3D model.',
    artifact: (
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
    ),
  },
  {
    id: 'preview',
    number: '03',
    label: 'Preview in 3D',
    kicker: 'Inspect the wrap',
    index: 'Stage 03 · Product mapping',
    title: 'See the wrap in 3D',
    copy: 'The generated image is mapped around the selected mug or phone case so you can inspect how the flat surface meets the physical Blank.',
    artifact: (
      <div className="grid w-full max-w-[470px] grid-cols-1 items-center gap-2 sm:grid-cols-[1fr_auto] sm:gap-4">
        <div
          aria-hidden
          className="h-[92px] rounded border border-border shadow-[inset_18px_0_20px_rgba(255,255,255,0.25),inset_-18px_0_20px_color-mix(in_srgb,var(--fg)_10%,transparent)] sm:h-[76px] bg-[linear-gradient(90deg,rgba(255,255,255,0.15),transparent_22%_78%,color-mix(in_srgb,var(--fg)_16%,transparent)),radial-gradient(circle_at_22%_32%,color-mix(in_srgb,var(--bg-card)_90%,var(--secondary))_0_6%,transparent_7%),radial-gradient(circle_at_68%_61%,var(--accent)_0_9%,transparent_10%),linear-gradient(135deg,color-mix(in_srgb,var(--accent)_55%,white),color-mix(in_srgb,var(--accent)_25%,white))]"
        />
        <span className="text-[11px] font-bold tracking-widest text-accent-2 uppercase">
          flat image → curved wrap
        </span>
      </div>
    ),
  },
  {
    id: 'finish',
    number: '04',
    label: 'Finish manually',
    kicker: 'Keep control',
    index: 'Stage 04 · Manual finish',
    title: 'Make the final adjustments',
    copy: 'Generation hands the design back to you. Use the Customizer’s manual controls to refine composition before moving toward print.',
    artifact: (
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
    ),
  },
]

const STEP_POS = [
  'top-12 left-0 max-md:static',
  'top-0.5 left-[28%] max-md:static max-lg:left-1/4',
  'top-[92px] left-[60%] max-md:static max-lg:left-[52%]',
  'top-[22px] right-0 left-auto max-md:static',
] as const

export function HomeGenerationTrace() {
  const [active, setActive] = useState(0)
  const uid = useId()
  const stage = STAGES[active]!
  const progress = (active / (STAGES.length - 1)) * 100
  const panelId = `${uid}-panel`
  const titleId = `${uid}-title`

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
    <section
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-x-clip bg-[linear-gradient(180deg,color-mix(in_srgb,var(--accent-warm)_80%,var(--bg))_0%,var(--bg)_50%,color-mix(in_srgb,var(--accent-warm)_80%,var(--bg))_100%)]"
      aria-labelledby={titleId}
    >
      <div className="mx-auto w-full max-w-[min(1240px,calc(100%-2.5rem))] px-0 py-9 md:py-[52px] md:pt-[72px] max-md:max-w-[min(calc(100%-1.5rem),520px)]">
        <header className="mb-8 grid grid-cols-1 items-end gap-4 md:mb-[34px] md:grid-cols-[minmax(0,1fr)_auto] md:gap-8">
          <div>
            <p className="mb-4 inline-flex min-h-8 items-center rounded-pill border border-border bg-white/65 px-2.5 py-1 text-xs font-bold tracking-[0.12em] text-primary uppercase">
              Prompt → print surface
            </p>
            <h2
              id={titleId}
              className="font-heading max-w-[780px] text-[clamp(2.375rem,5.8vw,4.875rem)] leading-[0.98] font-semibold tracking-[-0.045em] text-fg max-md:text-[clamp(2.375rem,13vw,3.5rem)]"
            >
              Intelligence shaped for <em className="text-primary italic">real products</em>
            </h2>
            <p className="mt-4 max-w-[670px] text-[clamp(1.0625rem,1.6vw,1.25rem)] leading-relaxed text-fg-muted md:mt-[22px]">
              Describe a surface, generate a wrap, and see it take shape on a mug or phone case before it
              goes to print.
            </p>
          </div>
          <div
            className="flex min-h-11 items-center gap-2.5 justify-self-start rounded border border-border bg-white/70 px-3 py-2 text-[13px] whitespace-nowrap text-accent-2"
            aria-label="Credits information"
          >
            <span
              className="grid size-6 place-items-center rounded-full border border-primary text-[11px] font-bold text-primary"
              aria-hidden
            >
              Cr
            </span>
            <span>
              <strong className="text-fg">1 Generation</strong> uses Credits
            </span>
          </div>
        </header>

        <div
          className={cn(
            'relative isolate min-h-[590px] overflow-hidden rounded border border-border bg-bg-elev shadow-[0_24px_70px_color-mix(in_srgb,var(--fg)_10%,transparent)]',
            'bg-[linear-gradient(color-mix(in_srgb,var(--accent)_4.5%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--accent)_4.5%,transparent)_1px,transparent_1px),var(--bg-elev)] bg-size-[28px_28px]',
            'after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:bg-[radial-gradient(circle_at_53%_44%,rgba(255,255,255,0.94),transparent_29%)] after:content-[""]',
            'max-lg:min-h-[790px] max-md:min-h-[1010px] max-md:bg-size-[24px_24px]',
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
              <h4 className="font-heading m-0 text-[clamp(1.5rem,2.6vw,2.25rem)] leading-[1.08] font-semibold text-fg">
                {stage.title}
              </h4>
              <p className="mt-3 max-w-[470px] text-sm leading-relaxed text-fg-muted">{stage.copy}</p>
            </div>
            <div className="flex min-h-[118px] items-stretch justify-center border-t border-border pt-5 md:items-center md:border-t-0 md:border-l md:pt-0 md:pl-[30px]">
              {stage.artifact}
            </div>
          </article>
        </div>

        <div className="mt-[22px] flex flex-col items-stretch justify-between gap-6 md:flex-row md:items-center">
          <p className="m-0 max-w-[650px] text-[13px] text-fg-muted">
            <strong className="text-fg">A clear handoff, not an autopilot.</strong> The generated image
            becomes a product wrap; placement, text, scale, and background stay editable by you.
          </p>
          <Link
            href="/catalog"
            className={cn(
              buttonVariants({ size: 'lg' }),
              'min-h-12 w-full min-w-[174px] justify-between gap-[22px] rounded border border-primary px-[18px] font-bold tracking-wide md:w-auto',
            )}
          >
            Start customizing
            <ArrowRight aria-hidden className="size-[18px]" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function MugPreview({ stage }: { stage: number }) {
  const uid = useId()
  const wrapOpacity = stage === 1 ? 0.2 : stage === 2 ? 0.48 : 1
  const patternOpacity = stage === 1 ? 0.12 : stage === 2 ? 0.65 : 1

  return (
    <svg
      className="pointer-events-none absolute top-[388px] right-[18px] left-auto z-[3] h-[152px] w-[132px] drop-shadow-[0_22px_22px_color-mix(in_srgb,var(--fg)_18%,transparent)] md:top-[169px] md:right-auto md:left-1/2 md:h-[220px] md:w-[192px] md:-translate-x-1/2"
      viewBox="0 0 220 250"
      role="img"
      aria-label="Ceramic mug with a rose wrap moving through the generation workflow"
      data-stage={stage}
    >
      <defs>
        <linearGradient id={`${uid}-ceramic`} x1="0" x2="1">
          <stop offset="0" stopColor="color-mix(in srgb, var(--border) 40%, white)" />
          <stop offset=".23" stopColor="var(--bg-card)" />
          <stop offset=".78" stopColor="var(--bg)" />
          <stop offset="1" stopColor="var(--border-strong)" />
        </linearGradient>
        <linearGradient id={`${uid}-wrap`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="color-mix(in srgb, var(--accent) 40%, white)" />
          <stop offset=".5" stopColor="var(--accent)" />
          <stop offset="1" stopColor="color-mix(in srgb, var(--accent) 70%, black)" />
        </linearGradient>
        <clipPath id={`${uid}-body`}>
          <path d="M42 42 C43 23 156 23 158 42 L153 192 C151 218 55 218 49 192 Z" />
        </clipPath>
      </defs>
      <g className="origin-[50%_75%] animate-[product-settle_700ms_var(--ease)_both]">
        <path
          d="M153 67 C207 55 211 165 160 166"
          fill="none"
          stroke="var(--border-strong)"
          strokeWidth="23"
          strokeLinecap="round"
        />
        <path
          d="M155 77 C190 69 191 151 159 153"
          fill="none"
          stroke="var(--bg)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M42 42 C43 23 156 23 158 42 L153 192 C151 218 55 218 49 192 Z"
          fill={`url(#${uid}-ceramic)`}
          stroke="var(--border-strong)"
          strokeWidth="2"
        />
        <ellipse cx="100" cy="42" rx="58" ry="17" fill="var(--bg)" stroke="var(--border-strong)" strokeWidth="2" />
        <ellipse cx="100" cy="41" rx="49" ry="10" fill="var(--accent-2)" />
        <ellipse cx="94" cy="38" rx="33" ry="5" fill="var(--accent-warm)" opacity=".45" />
        <g clipPath={`url(#${uid}-body)`}>
          <path
            d="M42 78 C71 62 128 91 159 70 L157 165 C121 183 84 147 46 172 Z"
            fill={`url(#${uid}-wrap)`}
            opacity={wrapOpacity}
            className="transition-opacity duration-300"
          />
          <g fill="color-mix(in srgb, var(--bg-card) 90%, var(--secondary))" opacity={patternOpacity} className="transition-opacity duration-300">
            <circle cx="70" cy="104" r="13" />
            <circle cx="118" cy="137" r="18" opacity=".72" />
            <path
              d="M44 145 C76 109 109 92 158 98"
              fill="none"
              stroke="color-mix(in srgb, var(--accent) 20%, white)"
              strokeWidth="5"
            />
            <path
              d="M54 165 C88 135 115 120 156 121"
              fill="none"
              stroke="color-mix(in srgb, var(--accent) 70%, black)"
              strokeWidth="4"
              opacity=".7"
            />
          </g>
        </g>
        <path d="M51 189 C74 209 128 209 151 190" fill="none" stroke="white" strokeWidth="3" opacity=".7" />
        <ellipse cx="101" cy="219" rx="57" ry="8" fill="var(--fg)" opacity=".15" />
      </g>
      <style>{`@keyframes product-settle{from{opacity:.6;transform:translateY(6px) rotate(-1deg)}to{opacity:1;transform:translateY(0) rotate(0)}}`}</style>
    </svg>
  )
}
