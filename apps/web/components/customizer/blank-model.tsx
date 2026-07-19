'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { Mesh } from 'three'
import type { Blank } from '@customarc/shared'
import { createDesignTexture, type DesignTexture } from './design-texture'
import {
  bindPrintableTexture,
  findPrintableMeshes,
  normalizeModel,
  paintMugWhite,
} from './printable'
import { useActivePrintable } from './use-active-printable'
import { useSurfaceDrag } from './use-surface-drag'

export type Marker = { xMm: number; yMm: number; widthMm: number; heightMm: number }

type Props = {
  blank: Blank
  marker: Marker
  onMarkerChange: (m: Marker) => void
  setOrbitEnabled: (on: boolean) => void
  onTextureReady?: (tex: DesignTexture) => void
  onActiveZone?: (name: string | null) => void
}

export function BlankModel({
  blank,
  marker,
  onMarkerChange,
  setOrbitEnabled,
  onTextureReady,
  onActiveZone,
}: Props) {
  const { scene } = useGLTF(blank.template.modelUrl)
  const { invalidate } = useThree()
  const designRef = useRef<DesignTexture | null>(null)
  const unbindRef = useRef<(() => void) | null>(null)
  const { widthMm, heightMm } = blank.template.printableAreaMm

  const root = useMemo(() => {
    const clone = scene.clone(true)
    normalizeModel(clone)
    paintMugWhite(clone)
    return clone
  }, [scene])

  const meshes = useMemo(() => findPrintableMeshes(root), [root])
  const { active, selectHit } = useActivePrintable(meshes)

  useEffect(() => {
    const design = createDesignTexture(widthMm, heightMm)
    designRef.current = design
    design.paint(marker)
    onTextureReady?.(design)
    return () => {
      unbindRef.current?.()
      unbindRef.current = null
      design.dispose()
      designRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widthMm, heightMm])

  useEffect(() => {
    unbindRef.current?.()
    unbindRef.current = null
    const design = designRef.current
    if (!design || !active) {
      onActiveZone?.(null)
      invalidate()
      return
    }
    unbindRef.current = bindPrintableTexture(active, design.texture)
    onActiveZone?.(active.name || null)
    invalidate()
    return () => {
      unbindRef.current?.()
      unbindRef.current = null
    }
  }, [active, onActiveZone, invalidate])

  // Paint canvas + refresh active map clone (shares canvas image).
  const onMove = useCallback(
    (next: Marker) => {
      designRef.current?.paint(next)
      const mat = active?.material
      if (mat instanceof THREE.MeshStandardMaterial && mat.map) mat.map.needsUpdate = true
      invalidate()
      onMarkerChange(next)
    },
    [active, invalidate, onMarkerChange],
  )

  const drag = useSurfaceDrag({
    selectHit,
    isPrintable: (obj) => meshes.includes(obj as Mesh),
    template: { widthMm, heightMm },
    marker,
    onMove,
    setOrbitEnabled,
  })

  return <primitive object={root} {...drag} />
}
