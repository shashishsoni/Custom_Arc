'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import type { Blank } from '@customarc/shared'
import { createDesignTexture, type DesignTexture } from './design-texture'
import { bindPrintableTexture, findPrintableMesh, normalizeModel } from './printable'
import { useSurfaceDrag } from './use-surface-drag'

export type Marker = { xMm: number; yMm: number; widthMm: number; heightMm: number }

type Props = {
  blank: Blank
  marker: Marker
  onMarkerChange: (m: Marker) => void
  setOrbitEnabled: (on: boolean) => void
  onTextureReady?: (tex: DesignTexture) => void
}

export function BlankModel({
  blank,
  marker,
  onMarkerChange,
  setOrbitEnabled,
  onTextureReady,
}: Props) {
  const { scene } = useGLTF(blank.template.modelUrl)
  const { invalidate } = useThree()
  const designRef = useRef<DesignTexture | null>(null)
  const { widthMm, heightMm } = blank.template.printableAreaMm

  const root = useMemo(() => {
    const clone = scene.clone(true)
    normalizeModel(clone)
    return clone
  }, [scene])

  const mesh = useMemo(() => findPrintableMesh(root), [root])

  useEffect(() => {
    const design = createDesignTexture(widthMm, heightMm)
    designRef.current = design
    onTextureReady?.(design)
    const unbind = mesh ? bindPrintableTexture(mesh, design.texture) : () => {}
    design.paint(marker)
    invalidate()
    return () => {
      unbind()
      design.dispose()
      designRef.current = null
    }
    // Bind once per model/template; marker paints in the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mesh, widthMm, heightMm, invalidate])

  useEffect(() => {
    designRef.current?.paint(marker)
    invalidate()
  }, [marker, invalidate])

  const drag = useSurfaceDrag({
    mesh,
    template: { widthMm, heightMm },
    marker,
    onMove: onMarkerChange,
    setOrbitEnabled,
  })

  return <primitive object={root} {...drag} />
}
