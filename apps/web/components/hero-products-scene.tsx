'use client'

import { useEffect, useRef, useState } from 'react'
import { mountHeroScene } from '@/lib/hero-scene'

/** Zero-prop React shell — scene lifecycle lives in `lib/hero-scene`. */
export function HeroProductsScene() {
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
        className="absolute inset-0 z-0 origin-center bg-scene-bg bg-[radial-gradient(ellipse_at_center,var(--scene-highlight)_0%,var(--scene-bg)_72%)] [transform:perspective(1200px)_rotateX(20deg)] [&_canvas]:block [&_canvas]:size-full [&_canvas]:touch-none [&_canvas]:outline-none"
        role="img"
        aria-label="Interactive 3D CustomArc mug"
      />
      {status !== 'ready' && (
        <p
          className="pointer-events-none absolute inset-0 z-10 grid place-items-center text-sm text-fg-muted"
          role="status"
          aria-live="polite"
        >
          {status === 'loading' ? 'Loading 3D mug…' : '3D preview unavailable'}
        </p>
      )}
    </>
  )
}
