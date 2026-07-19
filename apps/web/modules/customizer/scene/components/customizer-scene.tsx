'use client'

import { Suspense, useCallback, useRef, useState, type ComponentRef } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  ContactShadows,
  Environment,
  Html,
  OrbitControls,
  PerspectiveCamera,
} from '@react-three/drei'
import * as THREE from 'three'
import type { Blank, DesignDocument, LayerTransform } from '@customarc/shared'
import type { DrawableImage } from '@customarc/design'
import { BlankModel } from './blank-model'
import type { DesignTexture } from '../../design/design-texture'
import {
  DEFAULT_CAMERA,
  DEFAULT_MODEL_POSE,
  type CustomizerCamera,
  type CustomizerModelPose,
} from '../view-config'

type Props = {
  blank: Blank
  doc: DesignDocument
  images: Map<string, DrawableImage>
  layerBox: Pick<LayerTransform, 'widthMm' | 'heightMm'> | null
  onLayerOrigin: (origin: { xMm: number; yMm: number }) => void
  onTextureReady?: (tex: DesignTexture) => void
  onActiveZone?: (name: string | null) => void
  camera?: CustomizerCamera
  model?: CustomizerModelPose
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 5, 2]} intensity={1.15} />
      <directionalLight position={[-2, 2, -2]} intensity={0.4} />
    </>
  )
}

function Loader() {
  return (
    <Html center>
      <p className="rounded border border-border bg-card px-3 py-2 text-sm text-fg-muted">
        Loading model…
      </p>
    </Html>
  )
}

export function CustomizerScene({
  blank,
  doc,
  images,
  layerBox,
  onLayerOrigin,
  onTextureReady,
  onActiveZone,
  camera: cameraProp,
  model: modelProp,
}: Props) {
  const [orbit, setOrbit] = useState(true)
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null)
  const cam = { ...DEFAULT_CAMERA, ...cameraProp }
  const pose = { ...DEFAULT_MODEL_POSE, ...modelProp }

  const setOrbitEnabled = useCallback((on: boolean) => {
    setOrbit(on)
    const c = controlsRef.current
    if (c) c.enabled = on
  }, [])

  return (
    <Canvas
      className="absolute inset-0 touch-none"
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      onCreated={({ gl }) => {
        gl.domElement.style.touchAction = 'none'
      }}
    >
      <color attach="background" args={['#f7f3ef']} />
      <PerspectiveCamera
        makeDefault
        fov={cam.fov}
        position={cam.position}
        near={0.05}
        far={50}
      />
      <Suspense fallback={<Loader />}>
        <Lights />
        <Environment preset="studio" environmentIntensity={0.3} />
        <group position={pose.position} scale={pose.scale} rotation={pose.rotation}>
          <BlankModel
            blank={blank}
            doc={doc}
            images={images}
            layerBox={layerBox}
            onLayerOrigin={onLayerOrigin}
            setOrbitEnabled={setOrbitEnabled}
            onTextureReady={onTextureReady}
            onActiveZone={onActiveZone}
          />
        </group>
        <ContactShadows position={[0, -1.2, 0]} opacity={0.3} scale={8} blur={2.5} far={3} />
      </Suspense>
      <OrbitControls
        ref={controlsRef}
        enabled={orbit}
        makeDefault
        enablePan={false}
        target={cam.target}
        minDistance={cam.minDistance}
        maxDistance={cam.maxDistance}
        maxPolarAngle={Math.PI * 0.86}
      />
    </Canvas>
  )
}
