'use client'

import { useState } from 'react'
import { RotateCw } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  LOOKBOOK_COPY,
  LOOKBOOK_PRODUCTS,
  PLATE_LABELS,
  PRODUCT_KEYS,
  type ProductKey,
} from './data'
import { FlipCard } from './flip-card'

export function LookbookSpread() {
  const [productKey, setProductKey] = useState<ProductKey>('mug')
  const [flipped, setFlipped] = useState(false)

  const product = LOOKBOOK_PRODUCTS[productKey]
  const plate = flipped ? PLATE_LABELS.design : PLATE_LABELS.blank

  function selectProduct(key: ProductKey) {
    setProductKey(key)
    setFlipped(false)
  }

  return (
    <section
      className="relative grid min-h-[680px] overflow-hidden rounded border border-border bg-card shadow-[0_24px_70px_color-mix(in_srgb,var(--fg)_10%,transparent)] max-lg:min-h-[760px] lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:before:pointer-events-none lg:before:absolute lg:before:inset-y-0 lg:before:left-[calc(86%/2-1px)] lg:before:z-[3] lg:before:-ml-[19px] lg:before:w-[38px] lg:before:bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--fg)_10%,transparent)_46%,color-mix(in_srgb,var(--fg)_14%,transparent)_50%,color-mix(in_srgb,var(--fg)_10%,transparent)_54%,transparent)] lg:before:content-['']"
      aria-labelledby="lookbook-spread-title"
    >
      <div className="relative z-[2] flex flex-col justify-center px-6 py-10 text-center sm:px-10 sm:py-12 lg:px-11 lg:py-14 lg:text-left">
        <p className="mb-5 flex items-center justify-center gap-3 text-[11px] font-bold tracking-[0.14em] text-primary uppercase lg:justify-start">
          <span className="font-heading text-[15px] normal-case italic tracking-normal">
            {LOOKBOOK_COPY.issueNo}
          </span>
          <span>{LOOKBOOK_COPY.issueTitle}</span>
        </p>
        <h2
          id="lookbook-spread-title"
          className="font-heading mx-auto max-w-[10ch] text-[clamp(2.5rem,5vw,4rem)] leading-[1.02] font-semibold tracking-tight text-fg lg:mx-0"
        >
          {LOOKBOOK_COPY.title}{' '}
          <em className="text-primary italic">{LOOKBOOK_COPY.titleEm}</em>
        </h2>
        <p className="mx-auto mt-5 max-w-[34ch] text-lg leading-relaxed text-fg-muted md:text-xl lg:mx-0">
          {LOOKBOOK_COPY.lede}
        </p>
        <dl className="mx-auto mt-7 flex w-full max-w-[360px] flex-col gap-2 border-t border-border pt-5 lg:mx-0">
          <div className="flex justify-between gap-3 text-[12.5px]">
            <dt className="font-semibold tracking-[0.06em] text-fg-muted uppercase">Product</dt>
            <dd className="font-semibold text-fg">{product.name}</dd>
          </div>
          <div className="flex justify-between gap-3 text-[12.5px]">
            <dt className="font-semibold tracking-[0.06em] text-fg-muted uppercase">Wrap</dt>
            <dd className="font-semibold text-fg">{product.wrap}</dd>
          </div>
          <div className="flex justify-between gap-3 text-[12.5px]">
            <dt className="font-semibold tracking-[0.06em] text-fg-muted uppercase">Plate</dt>
            <dd className="font-semibold text-fg">{plate.credit}</dd>
          </div>
        </dl>
      </div>

      <div className="relative z-[1] flex flex-col items-center bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary)_3%,transparent),transparent_40%)] px-6 py-9 sm:px-8 sm:py-10 lg:px-12 lg:py-[52px]">
        <div className="mb-5 flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div
            className="inline-flex gap-1 self-center rounded border border-border bg-white/75 p-1 sm:self-auto"
            role="group"
            aria-label="Choose a product"
          >
            {PRODUCT_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={productKey === key}
                onClick={() => selectProduct(key)}
                className={cn(
                  'min-h-[44px] min-w-[88px] rounded px-4 text-[13px] font-semibold transition-colors duration-200',
                  productKey === key
                    ? 'bg-primary text-primary-foreground'
                    : 'text-fg-muted hover:bg-[color-mix(in_srgb,var(--primary)_8%,transparent)] hover:text-fg',
                )}
              >
                {LOOKBOOK_PRODUCTS[key].toggleLabel}
              </button>
            ))}
          </div>
          <p className="text-center text-[11px] font-semibold tracking-[0.1em] text-fg-muted uppercase sm:text-right">
            {plate.fig}
          </p>
        </div>

        <FlipCard
          blankSrc={product.blank.src}
          blankAlt={product.blank.alt}
          designSrc={product.design.src}
          designAlt={product.design.alt}
          flipped={flipped}
        />

        <div className="mt-6 flex flex-col items-center gap-3.5">
          <button
            type="button"
            aria-pressed={flipped}
            aria-describedby="lookbook-flip-live"
            onClick={() => setFlipped((value) => !value)}
            className={cn(
              buttonVariants({ size: 'lg' }),
              'min-h-[52px] gap-3 rounded border border-primary px-6 text-[14.5px] font-bold active:scale-[0.98] [&_svg]:transition-transform [&_svg]:duration-[420ms] aria-pressed:[&_svg]:rotate-180',
            )}
          >
            {plate.flipBtn}
            <RotateCw aria-hidden className="size-4" />
          </button>
          <p
            id="lookbook-flip-live"
            aria-live="polite"
            className="text-[11px] tracking-[0.16em] text-fg-muted uppercase"
          >
            {plate.live}
          </p>
        </div>
      </div>
    </section>
  )
}
