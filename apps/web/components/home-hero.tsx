'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const HeroProductsScene = dynamic(
  () => import('@/components/hero-products-scene').then((m) => m.HeroProductsScene),
  { ssr: false },
)

export function HomeHero() {
  return (
    <section
      className="relative left-1/2 min-h-[calc(100dvh-var(--header-h))] w-screen -translate-x-1/2 overflow-hidden"
      aria-labelledby="hero-title"
    >
      <HeroProductsScene />

      <div className="pointer-events-none absolute inset-0 z-[1] bg-bg/10" aria-hidden />

      <div className="relative z-[2] mx-auto flex min-h-[calc(100dvh-var(--header-h))] w-full max-w-content items-center px-4 py-12 md:px-6 md:py-20">
        <div className="pointer-events-auto w-full max-w-xl rounded border border-border bg-bg-elev/90 p-8 shadow-[0_8px_32px_rgba(196,92,106,0.08)] backdrop-blur-xl md:p-12">
          <p className="mb-4 text-xs font-semibold tracking-[0.16em] text-primary uppercase">
            CustomArc
          </p>
          <h1
            id="hero-title"
            className="mb-5 text-3xl font-extrabold tracking-tight text-fg uppercase md:text-5xl md:leading-[1.15]"
          >
            Your canvas, our craft.
          </h1>
          <p className="mb-8 max-w-md text-base text-fg-muted md:text-lg">
            Redefine everyday objects in our AI-powered 3D studio — mugs and phone cases, wrap to
            print.
          </p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/catalog"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'min-h-11 w-full rounded px-8 sm:w-auto',
              )}
            >
              Start customizing
            </Link>
            <Link
              href="/catalog"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'min-h-11 w-full rounded border-border bg-bg-card/70 px-8 text-fg backdrop-blur-md sm:w-auto',
              )}
            >
              Browse catalog
            </Link>
          </div>
          <p className="mt-6 text-xs tracking-wide text-fg-muted">Drag to explore · 3D live</p>
        </div>
      </div>
    </section>
  )
}
