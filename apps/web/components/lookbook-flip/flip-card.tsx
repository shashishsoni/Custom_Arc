import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PLATE_LABELS } from './data'

type FlipCardProps = {
  blankSrc: string
  blankAlt: string
  designSrc: string
  designAlt: string
  flipped: boolean
}

function CardFace({
  src,
  alt,
  plate,
  back,
  hidden,
}: {
  src: string
  alt: string
  plate: keyof typeof PLATE_LABELS
  back?: boolean
  hidden: boolean
}) {
  const label = PLATE_LABELS[plate]

  return (
    <div
      aria-hidden={hidden}
      className={cn(
        'absolute inset-0 overflow-hidden rounded border border-border-strong bg-bg-elev shadow-[0_20px_46px_color-mix(in_srgb,var(--fg)_14%,transparent)] [backface-visibility:hidden]',
        back && '[transform:rotateY(180deg)]',
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 320px, 392px"
        className="object-contain"
      />
      <span
        aria-hidden
        className="absolute top-3.5 right-3.5 z-[2] grid size-[30px] place-items-center rounded-full border border-border-strong bg-white/86 text-[10.5px] font-bold text-primary"
      >
        {label.index}
      </span>
      <span className="absolute bottom-4 left-4 z-[2] rounded bg-white/90 px-3 py-1.5 font-heading text-[13px] text-accent-2 italic backdrop-blur-sm">
        {label.tag}
      </span>
    </div>
  )
}

export function FlipCard({ blankSrc, blankAlt, designSrc, designAlt, flipped }: FlipCardProps) {
  return (
    <div className="w-full max-w-[392px] [perspective:1900px]">
      <div
        className={cn(
          'relative aspect-[3/3.7] w-full [transform-style:preserve-3d] transition-transform duration-[720ms] ease-[cubic-bezier(0.4,0.1,0.2,1)] motion-reduce:transition-none',
          flipped && '[transform:rotateY(180deg)]',
        )}
      >
        <CardFace src={blankSrc} alt={blankAlt} plate="blank" hidden={flipped} />
        <CardFace
          src={designSrc}
          alt={designAlt}
          plate="design"
          back
          hidden={!flipped}
        />
      </div>
    </div>
  )
}

/** Handoff note + CTA — rendered outside the lookbook spread. */
export function FlipCardFooter() {
  return (
    <div className="mt-8 flex w-full flex-col items-stretch gap-6 sm:flex-row sm:items-center sm:justify-between">
      <p className="max-w-[600px] text-lg leading-relaxed text-fg-muted md:text-xl">
        <strong className="text-fg">A clear handoff, not an autopilot.</strong> The generated image
        becomes a product wrap; placement, text, scale, and background stay editable by you.
      </p>
      <Link
        href="/catalog"
        className={cn(
          buttonVariants({ size: 'lg' }),
          'min-h-12 w-full min-w-[174px] shrink-0 justify-between gap-[22px] rounded border border-primary px-[18px] font-bold tracking-wide sm:w-auto',
        )}
      >
        Start customizing
        <ArrowRight aria-hidden className="size-[18px]" />
      </Link>
    </div>
  )
}
