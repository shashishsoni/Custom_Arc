'use client'

import Link from 'next/link'
import { useRef, type PointerEvent } from 'react'
import { ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Category } from '../data'
import { DepthLines } from './depth-lines'
import { CaseArt, MugArt } from './product-art'

function setRailTilt(el: HTMLElement, mx: number, my: number) {
  el.style.setProperty('--mx', mx.toFixed(3))
  el.style.setProperty('--my', my.toFixed(3))
}

export function CategoryRail({ category }: { category: Category }) {
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
        <p className="mb-6 text-xs font-bold tracking-widest text-primary uppercase">
          {category.index}
        </p>
        <h3 className="font-heading mb-4 text-[clamp(2.5rem,5vw,4rem)] leading-[0.94] font-semibold tracking-tight text-fg">
          {category.title}
        </h3>
        <p className="mb-6 max-w-[420px] text-base leading-relaxed text-fg-muted md:text-lg">{category.description}</p>
        <ul className="mb-8 flex list-none flex-wrap gap-2 p-0" aria-label={category.finishesLabel}>
          {category.finishes.map((finish) => (
            <li
              key={finish}
              className="rounded border border-border-strong bg-white/70 px-2.5 py-1.5 text-[0.73rem] font-semibold tracking-wide text-fg"
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
