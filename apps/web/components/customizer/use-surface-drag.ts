'use client'

import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import type { Mesh } from 'three'
import { clampLayerOrigin, uvToMm } from './uv'
import { uvBiasForMesh } from './uv-bias'
import type { Marker } from './blank-model'

type Args = {
  selectHit: (e: ThreeEvent<PointerEvent>) => Mesh | null
  isPrintable: (obj: unknown) => boolean
  template: { widthMm: number; heightMm: number }
  marker: Marker
  onMove: (next: Marker) => void
  setOrbitEnabled: (on: boolean) => void
}

/** Smooth UV drag — uses R3F event UV (old path), no window raycast. */
export function useSurfaceDrag({
  selectHit,
  isPrintable,
  template,
  marker,
  onMove,
  setOrbitEnabled,
}: Args) {
  const dragging = useRef(false)
  const dragMesh = useRef<Mesh | null>(null)
  const markerRef = useRef(marker)
  markerRef.current = marker
  const { gl } = useThree()

  useEffect(() => {
    const end = () => {
      if (!dragging.current) return
      dragging.current = false
      dragMesh.current = null
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

  const place = (e: ThreeEvent<PointerEvent>, mesh: Mesh) => {
    if (!e.uv || e.object !== mesh) return
    const { xMm, yMm } = uvToMm(e.uv.x, e.uv.y, template, uvBiasForMesh(mesh.name))
    const m = markerRef.current
    onMove({
      ...m,
      ...clampLayerOrigin(
        xMm - m.widthMm / 2,
        yMm - m.heightMm / 2,
        m.widthMm,
        m.heightMm,
        template,
      ),
    })
  }

  return {
    onPointerDown: (e: ThreeEvent<PointerEvent>) => {
      const hit = selectHit(e)
      if (!hit) return
      dragging.current = true
      dragMesh.current = hit
      setOrbitEnabled(false)
      gl.domElement.style.cursor = 'grabbing'
      place(e, hit)
    },
    onPointerMove: (e: ThreeEvent<PointerEvent>) => {
      if (!dragging.current || !dragMesh.current) return
      e.stopPropagation()
      place(e, dragMesh.current)
    },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      if (!dragging.current && isPrintable(e.object)) gl.domElement.style.cursor = 'grab'
    },
    onPointerOut: () => {
      if (!dragging.current) gl.domElement.style.cursor = 'auto'
    },
  }
}
