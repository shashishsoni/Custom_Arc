'use client'

import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import type { Mesh } from 'three'
import { clampLayerOrigin, uvToMm } from './uv'

type Marker = { xMm: number; yMm: number; widthMm: number; heightMm: number }

type Args = {
  mesh: Mesh | null
  template: { widthMm: number; heightMm: number }
  marker: Marker
  onMove: (next: Marker) => void
  setOrbitEnabled: (on: boolean) => void
}

/** Raycast → UV → template-mm drag on the printable surface (no Decal). */
export function useSurfaceDrag({ mesh, template, marker, onMove, setOrbitEnabled }: Args) {
  const dragging = useRef(false)
  const markerRef = useRef(marker)
  markerRef.current = marker
  const { gl } = useThree()

  useEffect(() => {
    const end = () => {
      if (!dragging.current) return
      dragging.current = false
      setOrbitEnabled(true)
      gl.domElement.style.cursor = 'auto'
    }
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)
    return () => {
      window.removeEventListener('pointerup', end)
      window.removeEventListener('pointercancel', end)
    }
  }, [gl, setOrbitEnabled])

  const placeFromEvent = (e: ThreeEvent<PointerEvent>) => {
    if (!mesh || !e.uv) return
    const { xMm, yMm } = uvToMm(e.uv.x, e.uv.y, template)
    const m = markerRef.current
    const origin = clampLayerOrigin(
      xMm - m.widthMm / 2,
      yMm - m.heightMm / 2,
      m.widthMm,
      m.heightMm,
      template,
    )
    onMove({ ...m, ...origin })
  }

  return {
    onPointerDown: (e: ThreeEvent<PointerEvent>) => {
      if (!mesh || e.object !== mesh) return
      e.stopPropagation()
      dragging.current = true
      setOrbitEnabled(false)
      gl.domElement.style.cursor = 'grabbing'
      placeFromEvent(e)
    },
    onPointerMove: (e: ThreeEvent<PointerEvent>) => {
      if (!dragging.current) return
      e.stopPropagation()
      placeFromEvent(e)
    },
    onPointerOver: () => {
      if (!dragging.current) gl.domElement.style.cursor = 'grab'
    },
    onPointerOut: () => {
      if (!dragging.current) gl.domElement.style.cursor = 'auto'
    },
  }
}
