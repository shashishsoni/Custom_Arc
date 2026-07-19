'use client'

import { useEffect, useRef, useState } from 'react'
import { mountHeroScene } from '@/lib/hero-scene'
import { cn } from '@/lib/utils'

type Props = {
  className?: string
}

/** Scene host — stage tilt / canvas fill live on StudioStage. */
export function HeroProductsScene({ className }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    return mountHeroScene(host, {
      onReady: () => setStatus('ready'),
      onError: () => setStatus('error'),
    }).dispose
  }, [])

  return (
    <>
      <div
        ref={hostRef}
        className={cn('absolute inset-0', className)}
        role="img"
        aria-label="Interactive 3D CustomArc mug and phone case"
      />
      {status !== 'ready' && (
        <p
          className="pointer-events-none absolute inset-0 z-10 grid place-items-center text-sm text-fg-muted"
          role="status"
          aria-live="polite"
        >
          {status === 'loading' ? 'Loading 3D products…' : '3D preview unavailable'}
        </p>
      )}
    </>
  )
}
