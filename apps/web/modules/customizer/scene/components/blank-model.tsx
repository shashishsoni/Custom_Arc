'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import {
  bodyFinishPreset,
  type Blank,
  type DesignDocument,
  type LayerTransform,
} from '@customarc/shared'
import type { DrawableImage } from '@customarc/design'
import { createDesignTexture, type DesignTexture } from '../../design/design-texture'
import {
  applyBodyFinish,
  bindPrintableTexture,
  findPrintableMeshes,
  normalizeModel,
  paintMugWhite,
  paintPrintableBases,
} from '../printable'
import { useActivePrintable } from '../../interaction/use-active-printable'
import { useSurfaceDrag } from '../../interaction/use-surface-drag'

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

function preferCheapGlass() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(max-width: 768px)').matches
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
  const isMug = blank.category === 'mug'
  const finishId = doc.bodyFinish?.id ?? 'ceramic'

  const root = useMemo(() => {
    const clone = scene.clone(true)
    normalizeModel(clone)
    if (isMug) {
      const preset = bodyFinishPreset(finishId)
      paintPrintableBases(clone, preset)
      applyBodyFinish(clone, preset, { cheapGlass: preferCheapGlass() })
    } else {
      paintMugWhite(clone)
    }
    return clone
    // finish re-applied in effect so wrap bind survives switches
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, isMug])

  const meshes = useMemo(() => findPrintableMeshes(root), [root])
  const { active, selectHit } = useActivePrintable(meshes)
  const wrapX = blank.template.wrapHorizontal
  const finishPreset = bodyFinishPreset(finishId)

  useEffect(() => {
    if (!isMug) return
    applyBodyFinish(root, finishPreset, { cheapGlass: preferCheapGlass() })
    invalidate()
  }, [finishPreset, isMug, root, invalidate])

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
    unbindRef.current = bindPrintableTexture(active, design.texture, finishPreset)
    onActiveZone?.(active.name || null)
    invalidate()
    return () => {
      unbindRef.current?.()
      unbindRef.current = null
    }
  }, [active, finishPreset, onActiveZone, invalidate])

  useEffect(() => {
    designRef.current?.paint(doc, images)
    const mat = active?.material
    if (
      (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) &&
      mat.map
    ) {
      mat.map.needsUpdate = true
    }
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
    isPrintable: (obj) => meshes.includes(obj as THREE.Mesh),
    template: { widthMm, heightMm },
    wrapX,
    layer: layerBox,
    onMove,
    setOrbitEnabled,
  })

  return <primitive object={root} {...drag} />
}
