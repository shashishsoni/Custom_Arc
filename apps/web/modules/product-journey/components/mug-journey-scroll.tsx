'use client'

import {
  motion,
  type MotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

const FRAME_COUNT = 61
const frameSrc = (index: number) =>
  `/2ndsections/frame_${String(index + 1).padStart(3, '0')}.jpg`

/** Exclusive beats — no shared opacity windows between cards. */
const BEATS = [
  {
    range: [0, 0.22] as [number, number],
    align: 'center' as const,
    eyebrow: '01 · Start',
    title: 'Every idea begins blank.',
    body: 'Choose a production-ready mug and make the empty surface your canvas.',
  },
  {
    range: [0.23, 0.47] as [number, number],
    align: 'left' as const,
    eyebrow: '02 · Create',
    title: 'Make it unmistakably yours.',
    body: 'Upload your art or generate something new, then watch it wrap around the product.',
  },
  {
    range: [0.48, 0.72] as [number, number],
    align: 'right' as const,
    eyebrow: '03 · Make',
    title: 'Previewed in 3D. Made for real.',
    body: 'What you approve becomes the print-ready design our production partner receives.',
  },
  {
    range: [0.73, 1] as [number, number],
    align: 'center' as const,
    eyebrow: '04 · Deliver',
    title: 'Packed with care.',
    body: 'Your one-of-one product leaves the screen and starts its journey to you.',
  },
] as const

type StoryBeatProps = {
  progress: MotionValue<number>
  range: [number, number]
  align: 'left' | 'right' | 'center'
  eyebrow: string
  title: string
  body: string
}

function StoryBeat({ progress, range, align, eyebrow, title, body }: StoryBeatProps) {
  const [start, end] = range
  const fade = Math.min(0.025, (end - start) / 4)
  const isFirst = start <= 0
  const isLast = end >= 1
  const opacity = useTransform(
    progress,
    [start, start + fade, end - fade, end],
    [isFirst ? 1 : 0, 1, 1, isLast ? 1 : 0],
  )
  const y = useTransform(progress, [start, end], [18, -18])
  const [visible, setVisible] = useState(isFirst)

  useMotionValueEvent(opacity, 'change', (value) => {
    setVisible(value > 0.02)
  })

  return (
    <motion.article
      style={{ opacity, y, x: align === 'center' ? '-50%' : 0 }}
      aria-hidden={!visible}
      className={cn(
        'pointer-events-none absolute z-10 w-[min(88vw,22rem)] border border-white/35 bg-bg-elev/90 p-5 shadow-[0_24px_80px_rgba(61,52,64,0.14)] backdrop-blur-md md:p-7',
        !visible && 'invisible',
        align === 'left' && 'top-[22%] left-4 md:left-[8%]',
        align === 'right' && 'right-4 bottom-[20%] md:right-[8%]',
        align === 'center' && 'top-[38%] left-1/2 text-center',
      )}
    >
      <p className="text-[0.68rem] font-semibold tracking-[0.2em] text-primary uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-heading text-3xl leading-[1.05] font-semibold tracking-tight text-fg md:text-5xl">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-fg-muted md:text-base">{body}</p>
    </motion.article>
  )
}

export function MugJourneyScroll() {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const framesRef = useRef<HTMLImageElement[]>([])
  const currentFrameRef = useRef(0)
  const animationFrameRef = useRef(0)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [loaded, setLoaded] = useState(0)

  // Normalize null → false so this boolean stays a stable type across first paint.
  const reduceMotion = useReducedMotion() === true
  const reduceMotionRef = useRef(reduceMotion)
  reduceMotionRef.current = reduceMotion

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  const scrollYProgressRef = useRef(scrollYProgress)
  scrollYProgressRef.current = scrollYProgress

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current
    const image = framesRef.current[index]
    if (!canvas || !image?.complete || !image.naturalWidth) return

    // Draw 1:1 at the frame's native pixels. CSS object-fit:cover fills the screen.
    // Upscaling inside a retina-sized canvas softens 720p/1080p sources badly.
    const pixelWidth = image.naturalWidth
    const pixelHeight = image.naturalHeight
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth
      canvas.height = pixelHeight
    }

    const context = canvas.getContext('2d', { alpha: false })
    if (!context) return

    context.setTransform(1, 0, 0, 1, 0, 0)
    context.imageSmoothingEnabled = false
    context.fillStyle = '#bba29a'
    context.fillRect(0, 0, pixelWidth, pixelHeight)
    context.drawImage(image, 0, 0, pixelWidth, pixelHeight)
  }, [])

  // Mount-once preload. Keep dependency array length constant (refs for live values).
  useEffect(() => {
    let cancelled = false
    let completed = 0

    const requests = Array.from({ length: FRAME_COUNT }, (_, index) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image()
        image.decoding = 'async'
        image.onload = () => {
          completed += 1
          if (!cancelled) setLoaded(completed)
          resolve(image)
        }
        image.onerror = reject
        image.src = frameSrc(index)
      })
    })

    void Promise.all(requests)
      .then((frames) => {
        if (cancelled) return
        framesRef.current = frames
        setStatus('ready')
        const initialFrame = reduceMotionRef.current
          ? Math.floor(FRAME_COUNT / 2)
          : Math.round(scrollYProgressRef.current.get() * (FRAME_COUNT - 1))
        currentFrameRef.current = initialFrame
        requestAnimationFrame(() => drawFrame(initialFrame))
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [drawFrame])

  useEffect(() => {
    if (status !== 'ready' || !canvasRef.current) return
    const observer = new ResizeObserver(() => drawFrame(currentFrameRef.current))
    observer.observe(canvasRef.current)
    return () => observer.disconnect()
  }, [drawFrame, status])

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    if (status !== 'ready' || reduceMotionRef.current) return
    const nextFrame = Math.min(FRAME_COUNT - 1, Math.round(progress * (FRAME_COUNT - 1)))
    if (nextFrame === currentFrameRef.current) return
    currentFrameRef.current = nextFrame
    cancelAnimationFrame(animationFrameRef.current)
    animationFrameRef.current = requestAnimationFrame(() => drawFrame(nextFrame))
  })

  return (
    <section
      ref={sectionRef}
      aria-label="From blank mug to packed custom product"
      className="relative h-[400vh] w-full overflow-x-clip bg-[#bba29a] motion-reduce:h-[120vh]"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#bba29a]">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 size-full object-cover object-center"
          role="img"
          aria-label="A white mug becomes a unique floral design and is packed for delivery"
        />

        {status === 'ready' && !reduceMotion && (
          <>
            {BEATS.map((beat) => (
              <StoryBeat
                key={beat.eyebrow}
                progress={scrollYProgress}
                range={beat.range}
                align={beat.align}
                eyebrow={beat.eyebrow}
                title={beat.title}
                body={beat.body}
              />
            ))}
          </>
        )}

        {status === 'ready' && reduceMotion && (
          <article className="absolute top-[38%] left-1/2 z-10 w-[min(88vw,24rem)] -translate-x-1/2 border border-white/35 bg-bg-elev/90 p-6 text-center shadow-[0_24px_80px_rgba(61,52,64,0.14)] backdrop-blur-md">
            <p className="text-[0.68rem] font-semibold tracking-[0.2em] text-primary uppercase">
              From blank to yours
            </p>
            <h2 className="mt-2 font-heading text-3xl leading-tight font-semibold tracking-tight text-fg">
              Designed by you. Packed with care.
            </h2>
          </article>
        )}

        {status !== 'ready' && (
          <div
            className="absolute inset-0 z-20 grid place-items-center bg-[#bba29a]"
            role="status"
            aria-live="polite"
          >
            <div className="text-center text-fg">
              {status === 'loading' ? (
                <>
                  <span className="mx-auto block size-8 animate-spin rounded-full border-2 border-fg/20 border-t-primary motion-reduce:animate-none" />
                  <p className="mt-4 text-xs font-semibold tracking-[0.18em] uppercase">
                    Preparing your journey · {Math.round((loaded / FRAME_COUNT) * 100)}%
                  </p>
                </>
              ) : (
                <p className="text-sm font-medium">The product journey could not be loaded.</p>
              )}
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute right-5 bottom-5 left-5 z-10 flex items-end justify-between text-[0.65rem] font-semibold tracking-[0.16em] text-fg/55 uppercase">
          <span>CustomArc · From blank to yours</span>
          <span className="hidden sm:inline">Scroll to create ↓</span>
        </div>
      </div>
    </section>
  )
}
