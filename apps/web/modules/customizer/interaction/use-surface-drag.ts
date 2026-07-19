'use client'

import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import type { Mesh } from 'three'
import type { LayerTransform } from '@customarc/shared'
import { clampLayerOrigin, uvToMm } from './uv'
import { uvBiasForMesh } from './uv-bias'

type Args = {
  selectHit: (e: ThreeEvent<PointerEvent>) => Mesh | null
  isPrintable: (obj: unknown) => boolean
  template: { widthMm: number; heightMm: number }
  /** Mug / cylinder — wrap X across the UV seam. */
  wrapX?: boolean
  /** Selected layer box — drag updates origin only when set. */
  layer: Pick<LayerTransform, 'widthMm' | 'heightMm'> | null
  onMove: (origin: { xMm: number; yMm: number }) => void
  setOrbitEnabled: (on: boolean) => void
}

/** Smooth UV drag — places the selected layer under the pointer. */
export function useSurfaceDrag({
  selectHit,
  isPrintable,
  template,
  wrapX = false,
  layer,
  onMove,
  setOrbitEnabled,
}: Args) {
  const dragging = useRef(false)
  const dragMesh = useRef<Mesh | null>(null)
  const layerRef = useRef(layer)
  layerRef.current = layer
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
    const box = layerRef.current
    if (!box || !e.uv || e.object !== mesh) return
    const { xMm, yMm } = uvToMm(e.uv.x, e.uv.y, template, uvBiasForMesh(mesh.name))
    onMove(
      clampLayerOrigin(
        xMm - box.widthMm / 2,
        yMm - box.heightMm / 2,
        box.widthMm,
        box.heightMm,
        template,
        wrapX,
      ),
    )
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
