'use client'

import { useEffect, useRef } from 'react'
import { mountHeroScene } from '@/lib/hero-scene'

/** Zero-prop React shell — scene lifecycle lives in `lib/hero-scene`. */
export function HeroProductsScene() {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    return mountHeroScene(host).dispose
  }, [])

  return (
    <div
      ref={hostRef}
      className="absolute inset-0 z-0 [&_canvas]:size-full [&_canvas]:outline-none"
      role="img"
      aria-label="Interactive 3D CustomArc mug and phone case with matching arc wrap"
    />
  )
}
