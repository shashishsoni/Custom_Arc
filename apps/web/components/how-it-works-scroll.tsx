'use client'

import { useEffect, useRef, useState } from 'react'
import { Box, ImagePlus, PackageCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HowItWorksSceneHandle } from '@/lib/how-it-works-scene'

const steps = [
  {
    label: 'Base model',
    title: 'Choose your blank',
    description: 'Start with a production-ready product and inspect it from every angle.',
    icon: Box,
  },
  {
    label: 'Your creation',
    title: 'Make it unmistakably yours',
    description: 'Add artwork or an AI-generated texture, place it in 3D, and preview the result live.',
    icon: ImagePlus,
  },
  {
    label: 'Made and delivered',
    title: 'We produce and ship it',
    description: 'Your approved design becomes a print-ready file, then our partner makes and delivers it.',
    icon: PackageCheck,
  },
] as const

export function HowItWorksScroll() {
  const sectionRef = useRef<HTMLElement>(null)
  const sceneHostRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [activeStep, setActiveStep] = useState(0)
  const [sceneStatus, setSceneStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const activeLabel = steps[activeStep]?.label ?? 'Base model'

  useEffect(() => {
    const section = sectionRef.current
    const sceneHost = sceneHostRef.current
    if (!section || !sceneHost) return

    let scene: HowItWorksSceneHandle | null = null
    let scrollTrigger: { kill: () => void } | null = null
    let disposed = false
    let currentStep = 0
    const updateProgressIndicator = (progress: number) => {
      if (!progressRef.current) return
      progressRef.current.style.transform =
        window.innerWidth < 768 ? `scaleX(${progress})` : `scaleY(${progress})`
    }

    void Promise.all([
      import('@/lib/how-it-works-scene'),
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ])
      .then(([sceneModule, gsapModule, scrollTriggerModule]) => {
        if (disposed) return

        scene = sceneModule.mountHowItWorksScene(sceneHost, {
          onReady: () => setSceneStatus('ready'),
          onError: () => setSceneStatus('error'),
        })

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (reduceMotion) {
          scene.setProgress(0.5)
          setActiveStep(1)
          updateProgressIndicator(0.5)
          return
        }

        const { gsap } = gsapModule
        const { ScrollTrigger } = scrollTriggerModule
        gsap.registerPlugin(ScrollTrigger)

        scrollTrigger = ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: ({ progress }) => {
            scene?.setProgress(progress)
            updateProgressIndicator(progress)

            const nextStep = progress < 0.34 ? 0 : progress < 0.68 ? 1 : 2
            if (nextStep !== currentStep) {
              currentStep = nextStep
              setActiveStep(nextStep)
            }
          },
        })

        ScrollTrigger.refresh()
      })
      .catch(() => {
        if (!disposed) setSceneStatus('error')
      })

    return () => {
      disposed = true
      scrollTrigger?.kill()
      scene?.dispose()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      aria-labelledby="how-it-works-title"
      className="relative left-1/2 h-[310dvh] w-screen -translate-x-1/2 bg-fg motion-reduce:h-auto"
    >
      <div className="sticky top-[var(--header-h)] h-[calc(100dvh-var(--header-h))] overflow-hidden motion-reduce:static motion-reduce:h-auto">
        <div className="mx-auto grid h-full w-full max-w-content grid-rows-[auto_minmax(0,1fr)] gap-5 px-4 py-6 md:grid-cols-[minmax(19rem,0.8fr)_minmax(0,1.45fr)] md:grid-rows-1 md:gap-10 md:px-6 md:py-10">
          <div className="relative z-10 flex min-h-0 flex-col text-white">
            <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              How it works
            </p>
            <h2
              id="how-it-works-title"
              className="max-w-md font-heading text-3xl leading-tight font-semibold tracking-tight md:text-5xl"
            >
              From blank to made for you.
            </h2>

            <ol className="relative mt-5 grid flex-1 grid-cols-3 gap-2 md:mt-10 md:flex-none md:grid-cols-1 md:gap-0">
              <div
                aria-hidden="true"
                className="absolute top-5 right-[16.66%] left-[16.66%] h-px bg-white/15 md:top-5 md:right-auto md:bottom-5 md:left-5 md:h-auto md:w-px"
              >
                <div
                  ref={progressRef}
                  className="h-full w-full origin-left bg-primary will-change-transform md:origin-top"
                />
              </div>

              {steps.map((step, index) => {
                const Icon = step.icon
                const active = index === activeStep
                const complete = index < activeStep

                return (
                  <li
                    key={step.label}
                    aria-current={active ? 'step' : undefined}
                    className={cn(
                      'relative flex min-w-0 flex-col items-center gap-2 transition-opacity duration-300 md:flex-row md:items-start md:gap-5 md:pb-9',
                      active || complete ? 'opacity-100' : 'opacity-40',
                      'motion-reduce:opacity-100',
                    )}
                  >
                    <span
                      className={cn(
                        'relative z-10 grid size-10 shrink-0 place-items-center rounded-full border bg-fg transition-colors duration-300',
                        active || complete ? 'border-primary text-primary' : 'border-white/20 text-white/60',
                      )}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 text-center md:pt-0.5 md:text-left">
                      <p className="text-[0.62rem] font-semibold tracking-[0.13em] text-primary uppercase md:text-xs">
                        {step.label}
                      </p>
                      <h3 className="mt-1 text-xs leading-tight font-semibold text-white md:text-lg">
                        {step.title}
                      </h3>
                      <p className="mt-1 hidden max-w-sm text-sm leading-relaxed text-white/60 md:block">
                        {step.description}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>

          <div className="relative min-h-0 overflow-hidden border border-white/10 bg-scene-bg bg-[radial-gradient(ellipse_at_50%_38%,var(--scene-highlight)_0%,var(--scene-bg)_72%)]">
            <div
              ref={sceneHostRef}
              className="absolute inset-0 [&_canvas]:block [&_canvas]:size-full [&_canvas]:outline-none"
              role="img"
              aria-label="A blank mug gains custom artwork, then is packed into a shipping box as you scroll"
            />

            {sceneStatus !== 'ready' && (
              <p
                className="pointer-events-none absolute inset-0 z-20 grid place-items-center text-sm text-fg-muted"
                role="status"
                aria-live="polite"
              >
                {sceneStatus === 'loading' ? 'Loading the design journey…' : '3D preview unavailable'}
              </p>
            )}

            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-4 right-4 flex items-center gap-2 border border-border bg-bg-elev px-3 py-2 text-[0.65rem] font-semibold tracking-[0.15em] text-fg uppercase backdrop-blur md:top-6 md:right-6"
            >
              <span className="size-1.5 animate-pulse rounded-full bg-primary motion-reduce:animate-none" />
              {activeLabel}
            </div>

            <p className="pointer-events-none absolute right-4 bottom-4 left-4 text-center text-xs text-fg-muted md:right-6 md:bottom-6 md:left-auto">
              Scroll to shape the journey ↓
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
