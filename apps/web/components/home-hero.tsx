'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { buttonVariants } from '@/components/ui/button'
import { tryR2MediaUrl } from '@/lib/r2'
import { cn } from '@/lib/utils'

const HeroProductsScene = dynamic(
  () => import('@/components/hero-products-scene').then((m) => m.HeroProductsScene),
  { ssr: false },
)

function HeroSideCard({
  className,
  videoSrc,
}: {
  className?: string
  videoSrc: string | null
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'absolute inset-y-0 w-full origin-center overflow-hidden border border-border bg-card',
        className,
      )}
    >
      {videoSrc ? (
        <video
          src={videoSrc}
          className="size-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      ) : null}
    </div>
  )
}

export function HomeHero() {
  const promoVideoSrc = tryR2MediaUrl('premiumProVideo')

  return (
    <section
      className="relative left-1/2 min-h-[calc(100dvh-var(--header-h))] w-screen -translate-x-1/2 overflow-hidden bg-bg"
      aria-labelledby="hero-title"
    >
      <div className="mx-auto flex min-h-[calc(100dvh-var(--header-h))] w-full max-w-content flex-col items-center px-4 pt-12 md:px-6 md:pt-16">
        <div className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center">
          <p className="mb-3 font-heading text-2xl font-bold tracking-tight text-primary md:text-3xl">
            CustomArc
          </p>
          <h1
            id="hero-title"
            className="mb-5 font-heading text-4xl leading-tight font-semibold tracking-tight text-fg md:text-5xl"
          >
            Artistry in Every Arc
          </h1>
          <p className="mb-8 max-w-lg text-base leading-relaxed text-fg-muted md:text-lg">
            Experience the next generation of bespoke 3D creation.
          </p>
          <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/catalog"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'min-h-11 w-full rounded px-8 tracking-wide sm:w-auto',
              )}
            >
              Start customizing
            </Link>
            <Link
              href="/catalog"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'min-h-11 w-full rounded border-border bg-transparent px-8 tracking-wide text-primary hover:border-primary sm:w-auto',
              )}
            >
              Browse catalog
            </Link>
          </div>
        </div>

        <div className="relative mt-6 h-[42vh] min-h-80 w-full max-w-4xl flex-1 md:mt-8 md:h-[58vh] md:min-h-[28rem]">
          <HeroSideCard
            videoSrc={promoVideoSrc}
            className="right-[calc(100%+1.5rem)] rotate-6"
          />
          <HeroSideCard
            videoSrc={promoVideoSrc}
            className="left-[calc(100%+1.5rem)] -rotate-6"
          />
          <HeroProductsScene />
          <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-xs tracking-wide text-fg-muted">
            Drag to explore · 3D live
          </p>
        </div>
      </div>
    </section>
  )
}
