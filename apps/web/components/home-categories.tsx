'use client'

import Link from 'next/link'
import { useRef, type PointerEvent } from 'react'
import { ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Category = {
  index: string
  title: string
  description: string
  finishes: string[]
  finishesLabel: string
  cta: string
  href: '/catalog'
  mirror?: boolean
  product: 'mug' | 'case'
}

const CATEGORIES: Category[] = [
  {
    index: '01 / Ceramic blank',
    title: 'Mugs',
    description:
      'Preview your artwork around a classic ceramic mug before ordering through our print partner.',
    finishes: ['Gloss ceramic', 'Full wrap preview'],
    finishesLabel: 'Available mug finishes',
    cta: 'Customize mug',
    href: '/catalog',
    product: 'mug',
  },
  {
    index: '02 / Device shell',
    title: 'Phone cases',
    description:
      'Place a custom texture across a fitted phone-case preview and inspect the composition before print.',
    finishes: ['Gloss shell', 'Soft-touch shell'],
    finishesLabel: 'Available phone case finishes',
    cta: 'Customize case',
    href: '/catalog',
    mirror: true,
    product: 'case',
  },
]

function setRailTilt(el: HTMLElement, mx: number, my: number) {
  el.style.setProperty('--mx', mx.toFixed(3))
  el.style.setProperty('--my', my.toFixed(3))
}

function CategoryRail({ category }: { category: Category }) {
  const railRef = useRef<HTMLElement>(null)

  function onPointerMove(e: PointerEvent<HTMLElement>) {
    const rail = railRef.current
    if (!rail || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const b = rail.getBoundingClientRect()
    setRailTilt(
      rail,
      ((e.clientX - b.left) / b.width - 0.5) * 2,
      ((e.clientY - b.top) / b.height - 0.5) * 2,
    )
  }

  function onPointerLeave() {
    const rail = railRef.current
    if (rail) setRailTilt(rail, 0, 0)
  }

  return (
    <article
      ref={railRef}
      tabIndex={-1}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={cn(
        'group relative isolate mb-7 grid min-h-[430px] items-center overflow-visible rounded border border-border bg-card shadow-[0_24px_70px_color-mix(in_srgb,var(--fg)_9%,transparent)] transition-[border-color,box-shadow,transform] duration-200 [--mx:0] [--my:0] md:mb-12',
        'hover:-translate-y-0.5 hover:border-primary hover:shadow-[0_30px_85px_color-mix(in_srgb,var(--fg)_17%,transparent)]',
        'focus-within:-translate-y-0.5 focus-within:border-primary focus-within:shadow-[0_30px_85px_color-mix(in_srgb,var(--fg)_17%,transparent)]',
        category.mirror
          ? 'bg-[linear-gradient(255deg,var(--bg-card)_0_49%,color-mix(in_srgb,var(--accent-2)_8%,transparent)_49.1%_100%)] max-md:grid-cols-1 max-md:grid-rows-[330px_auto] max-md:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--accent-2)_8%,transparent)_0_49%,var(--bg-card)_49.1%_100%)] md:ml-[7%] md:grid-cols-[minmax(340px,1.12fr)_minmax(0,0.88fr)]'
          : 'bg-[linear-gradient(105deg,var(--bg-card)_0_49%,var(--secondary)_49.1%_100%)] max-md:grid-cols-1 max-md:grid-rows-[auto_330px] max-md:bg-[linear-gradient(180deg,var(--bg-card)_0_51%,var(--secondary)_51.1%_100%)] md:mr-[7%] md:grid-cols-[minmax(0,0.88fr)_minmax(340px,1.12fr)]',
        'max-md:min-h-[660px] max-md:items-stretch',
      )}
    >
      <div
        className={cn(
          'relative z-[4] p-6 sm:p-8 md:p-[clamp(32px,5vw,72px)]',
          category.mirror && 'max-md:row-start-2 md:col-start-2',
        )}
      >
        <p className="mb-6 text-[0.74rem] font-bold tracking-[0.16em] text-primary uppercase">
          {category.index}
        </p>
        <h3 className="font-heading mb-4 text-[clamp(2.8rem,5.5vw,5.6rem)] leading-[0.94] font-medium tracking-[-0.055em] text-fg max-md:text-[clamp(3rem,14vw,4.5rem)]">
          {category.title}
        </h3>
        <p className="mb-6 max-w-[420px] text-fg-muted">{category.description}</p>
        <ul className="mb-8 flex list-none flex-wrap gap-2 p-0" aria-label={category.finishesLabel}>
          {category.finishes.map((finish) => (
            <li
              key={finish}
              className="rounded-pill border border-border-strong bg-white/70 px-2.5 py-1.5 text-[0.73rem] font-semibold tracking-wide text-fg"
            >
              {finish}
            </li>
          ))}
        </ul>
        <Link
          href={category.href}
          className={cn(
            buttonVariants({ size: 'lg' }),
            'min-h-12 gap-3 rounded border border-primary px-[18px] tracking-wide hover:bg-card hover:text-primary [&_svg]:transition-transform group-hover:[&_svg]:translate-x-0.5',
          )}
        >
          {category.cta}
          <ArrowRight aria-hidden className="size-[18px]" />
        </Link>
      </div>

      <div
        aria-hidden
        className={cn(
          'relative z-[2] min-h-[330px] overflow-visible [perspective:900px] md:min-h-[430px]',
          category.mirror && 'max-md:row-start-1 md:col-start-1 md:row-start-1',
        )}
      >
        <div className="absolute inset-[13%_10%] overflow-hidden border border-[color-mix(in_srgb,var(--accent)_34%,transparent)] bg-bg-elev shadow-[inset_0_0_0_1px_rgba(255,255,255,0.9)] transition-transform duration-200 [transform:translate(calc(var(--mx)*5px),calc(var(--my)*5px))]">
          <DepthLines mirror={category.mirror} />
          <span
            className={cn(
              'absolute inset-[21%_21%] border-2 border-primary transition-transform duration-200 max-[420px]:inset-[22%_16%]',
              category.mirror
                ? 'shadow-[-14px_14px_0_color-mix(in_srgb,var(--accent)_9%,transparent),-28px_28px_0_color-mix(in_srgb,var(--accent)_9%,transparent)] [transform:translate(calc(var(--mx)*10px),calc(var(--my)*7px))_rotateY(5deg)]'
                : 'shadow-[14px_14px_0_color-mix(in_srgb,var(--accent)_9%,transparent),28px_28px_0_color-mix(in_srgb,var(--accent)_9%,transparent)] [transform:translate(calc(var(--mx)*10px),calc(var(--my)*7px))_rotateY(-5deg)]',
            )}
          />
        </div>
        {category.product === 'mug' ? <MugArt /> : <CaseArt />}
      </div>
    </article>
  )
}

function DepthLines({ mirror }: { mirror?: boolean }) {
  const side = mirror ? 'left-[9%]' : 'right-[9%]'
  return (
    <>
      <span
        className={cn(
          'absolute z-0 h-px w-[76%] bg-primary opacity-50',
          side,
          'top-[15%]',
          mirror ? 'origin-left -rotate-[18deg]' : 'origin-right rotate-[18deg]',
        )}
      />
      <span className={cn('absolute top-1/2 z-0 h-px w-[84%] bg-primary opacity-50', side)} />
      <span
        className={cn(
          'absolute z-0 h-px w-[76%] bg-primary opacity-50',
          side,
          'bottom-[15%]',
          mirror ? 'origin-left rotate-[18deg]' : 'origin-right -rotate-[18deg]',
        )}
      />
    </>
  )
}

function MugArt() {
  return (
    <svg
      className="pointer-events-none absolute top-[-7%] right-[-8%] z-[3] h-auto w-[min(82%,470px)] drop-shadow-[0_28px_22px_color-mix(in_srgb,var(--fg)_17%,transparent)] transition-transform duration-200 [transform:translate(calc(var(--mx)*15px),calc(var(--my)*11px))_rotate(-3deg)] group-hover:[transform:translate(calc(var(--mx)*15px),calc(var(--my)*11px_-_7px))_rotate(-1deg)] group-focus-within:[transform:translate(calc(var(--mx)*15px),calc(var(--my)*11px_-_7px))_rotate(-1deg)] max-md:top-[-3%] max-md:right-[-9%] max-md:w-[min(75%,390px)] max-[420px]:max-w-[340px]"
      viewBox="0 0 520 520"
      role="img"
    >
      <defs>
        <linearGradient id="cat-mug-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--bg-card)" />
          <stop offset=".5" stopColor="var(--secondary)" />
          <stop offset="1" stopColor="var(--accent-warm)" />
        </linearGradient>
        <linearGradient id="cat-mug-wrap" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--accent-2)" />
          <stop offset=".48" stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--accent-warm)" />
        </linearGradient>
      </defs>
      <ellipse cx="249" cy="426" rx="142" ry="26" fill="color-mix(in srgb, var(--fg) 9%, transparent)" />
      <path
        d="M352 181c69-17 112 13 112 74 0 61-44 102-116 102v-49c38 0 60-20 60-52 0-29-18-40-56-31z"
        fill="none"
        stroke="var(--accent-2)"
        strokeWidth="25"
      />
      <path
        d="M98 142h268l-17 245c-2 34-28 55-61 59H181c-39-2-61-23-64-59z"
        fill="url(#cat-mug-body)"
        stroke="var(--accent-2)"
        strokeWidth="4"
      />
      <ellipse cx="232" cy="142" rx="134" ry="33" fill="var(--bg-card)" stroke="var(--accent-2)" strokeWidth="4" />
      <ellipse cx="232" cy="146" rx="111" ry="20" fill="var(--accent-2)" />
      <path d="M111 253c66-27 164-24 247 11l-8 103c-76-35-155-39-240-9z" fill="url(#cat-mug-wrap)" />
      <path
        d="M146 198c13-14 23-20 31-17 11 4 5 20 18 22 10 1 18-8 26-27"
        fill="none"
        stroke="rgba(255,255,255,0.72)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M147 325c50-16 109-15 167 4"
        fill="none"
        stroke="rgba(255,255,255,0.72)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CaseArt() {
  return (
    <svg
      className="pointer-events-none absolute bottom-[-13%] left-[-9%] z-[3] h-auto w-[min(69%,390px)] drop-shadow-[0_28px_22px_color-mix(in_srgb,var(--fg)_17%,transparent)] transition-transform duration-200 [transform:translate(calc(var(--mx)*15px),calc(var(--my)*11px))_rotate(8deg)] group-hover:[transform:translate(calc(var(--mx)*15px),calc(var(--my)*11px_-_7px))_rotate(5deg)] group-focus-within:[transform:translate(calc(var(--mx)*15px),calc(var(--my)*11px_-_7px))_rotate(5deg)] max-md:bottom-[-10%] max-md:left-[-3%] max-md:w-[min(59%,330px)] max-[420px]:max-w-[340px]"
      viewBox="0 0 420 600"
      role="img"
    >
      <defs>
        <linearGradient id="cat-case-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--accent-2)" />
          <stop offset=".55" stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--accent-warm)" />
        </linearGradient>
        <pattern
          id="cat-case-lines"
          width="38"
          height="38"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(22)"
        >
          <rect width="38" height="38" fill="none" />
          <path d="M0 8h38M0 18h38" stroke="rgba(255,255,255,0.72)" strokeWidth="2" />
        </pattern>
      </defs>
      <ellipse cx="205" cy="558" rx="155" ry="26" fill="color-mix(in srgb, var(--fg) 9%, transparent)" />
      <rect x="53" y="24" width="316" height="520" rx="56" fill="var(--accent-2)" transform="translate(12 12)" />
      <rect
        x="53"
        y="24"
        width="316"
        height="520"
        rx="56"
        fill="url(#cat-case-body)"
        stroke="var(--accent-2)"
        strokeWidth="5"
      />
      <rect x="72" y="43" width="278" height="482" rx="39" fill="url(#cat-case-lines)" opacity=".86" />
      <rect
        x="83"
        y="54"
        width="104"
        height="134"
        rx="31"
        fill="var(--accent-2)"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="4"
      />
      <circle cx="119" cy="91" r="20" fill="var(--bg-card)" />
      <circle cx="156" cy="145" r="20" fill="var(--bg-card)" />
      <circle cx="118" cy="91" r="10" fill="var(--fg)" />
      <circle cx="155" cy="145" r="10" fill="var(--fg)" />
      <path
        d="M102 376c55-79 108-87 160-25 28 34 53 31 76-10"
        fill="none"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="13"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function HomeCategories() {
  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-x-clip bg-[linear-gradient(180deg,color-mix(in_srgb,var(--accent-warm)_80%,var(--bg))_0%,var(--bg)_50%,color-mix(in_srgb,var(--accent-warm)_80%,var(--bg))_100%)]">
      <header className="mx-auto w-full max-w-content px-4 pt-[clamp(4.5rem,10vw,9rem)] pb-[clamp(3.4rem,7vw,5.75rem)] md:px-6">
        <h2 className="font-heading max-w-[820px] text-[clamp(3.1rem,8vw,7.6rem)] leading-[0.88] font-medium tracking-[-0.065em] text-fg max-md:max-w-[9ch] max-md:text-[clamp(3rem,15vw,5.1rem)]">
          3D Ready <span className="text-primary italic">Categories</span>
        </h2>
        <p className="mt-8 ml-auto max-w-[600px] text-[clamp(1.05rem,2vw,1.3rem)] leading-relaxed text-fg-muted max-md:mt-6 max-md:ml-0">
          Instantly customizable products across all categories. Experience the future of tactile
          e-commerce.
        </p>
      </header>

      <div
        id="categories"
        className="relative mx-auto w-[min(calc(100%-2rem),1280px)] px-0 pt-3 pb-[clamp(5.25rem,10vw,9.5rem)] max-[420px]:w-[min(calc(100%-1.25rem),1280px)]"
        aria-label="Customizable product categories"
      >
        {CATEGORIES.map((category) => (
          <CategoryRail key={category.title} category={category} />
        ))}

        <aside
          className="mx-auto flex min-h-[86px] w-full items-center justify-between gap-6 rounded border border-dashed border-border-strong bg-bg-elev px-6 py-[18px] text-fg-muted max-md:flex-col max-md:items-start max-md:gap-3 md:w-[calc(100%-14%)]"
          aria-label="Future categories"
        >
          <span className="flex items-center gap-3.5 text-[0.9rem] font-semibold before:size-2 before:rounded-full before:border before:border-accent-warm before:content-['']">
            More categories later
          </span>
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="min-h-11 cursor-not-allowed rounded border border-border bg-bg px-4 text-[0.78rem] text-fg-muted opacity-80 max-md:w-full"
          >
            Phase 1 is mugs + cases
          </button>
        </aside>
      </div>
    </section>
  )
}
