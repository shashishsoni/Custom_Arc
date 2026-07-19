'use client'

import { useCallback, useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import type { Mesh } from 'three'

/** Click one printable → only that one is active (none until first click). */
export function useActivePrintable(meshes: Mesh[]) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const active = meshes.find((m) => m.uuid === activeId) ?? null

  const selectHit = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      const hit =
        (e.intersections.find((i) => meshes.includes(i.object as Mesh))?.object as Mesh | undefined) ??
        null
      if (!hit) return null
      e.stopPropagation()
      setActiveId(hit.uuid)
      return hit
    },
    [meshes],
  )

  return { active, selectHit }
}
