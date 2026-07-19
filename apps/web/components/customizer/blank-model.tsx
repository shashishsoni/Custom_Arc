'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { Mesh } from 'three'
import type { Blank, DesignDocument, LayerTransform } from '@customarc/shared'
import type { DrawableImage } from '@customarc/design'
import { createDesignTexture, type DesignTexture } from './design-texture'
import {
  bindPrintableTexture,
  findPrintableMeshes,
  normalizeModel,
  paintMugWhite,
} from './printable'
import { useActivePrintable } from './use-active-printable'
import { useSurfaceDrag } from './use-surface-drag'

type Props = {
  blank: Blank
  doc: DesignDocument
  images: Map<string, DrawableImage>
  layerBox: Pick<LayerTransform, 'widthMm' | 'heightMm'> | null
  onLayerOrigin: (origin: { xMm: number; yMm: number }) => void
  setOrbitEnabled: (on: boolean) => void
  onTextureReady?: (tex: DesignTexture) => void
  onActiveZone?: (name: string | null) => void
}

export function BlankModel({
  blank,
  doc,
  images,
  layerBox,
  onLayerOrigin,
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
  const wrapX = blank.template.wrapHorizontal

  useEffect(() => {
    const design = createDesignTexture({ wrapHorizontal: wrapX })
    designRef.current = design
    design.paint(doc, images)
    onTextureReady?.(design)
    return () => {
      unbindRef.current?.()
      unbindRef.current = null
      design.dispose()
      designRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widthMm, heightMm, wrapX])

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

  useEffect(() => {
    designRef.current?.paint(doc, images)
    const mat = active?.material
    if (mat instanceof THREE.MeshStandardMaterial && mat.map) mat.map.needsUpdate = true
    invalidate()
  }, [doc, images, active, invalidate])

  const onMove = useCallback(
    (origin: { xMm: number; yMm: number }) => {
      onLayerOrigin(origin)
    },
    [onLayerOrigin],
  )

  const drag = useSurfaceDrag({
    selectHit,
    isPrintable: (obj) => meshes.includes(obj as Mesh),
    template: { widthMm, heightMm },
    wrapX,
    layer: layerBox,
    onMove,
    setOrbitEnabled,
  })

  return <primitive object={root} {...drag} />
}
