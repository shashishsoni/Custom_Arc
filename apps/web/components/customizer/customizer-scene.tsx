'use client'

import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, Environment, Html, OrbitControls, useProgress } from '@react-three/drei'
import * as THREE from 'three'
import type { Blank } from '@customarc/shared'
import { BlankModel, type Marker } from './blank-model'
import type { DesignTexture } from './design-texture'

type Props = {
  blank: Blank
  marker: Marker
  onMarkerChange: (m: Marker) => void
  onTextureReady?: (tex: DesignTexture) => void
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 2]} intensity={1.1} />
      <directionalLight position={[-2, 2, -2]} intensity={0.35} />
    </>
  )
}

function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <p className="rounded border border-border bg-card px-3 py-2 text-sm text-fg-muted">
        Loading model {progress.toFixed(0)}%
      </p>
    </Html>
  )
}

export function CustomizerScene({ blank, marker, onMarkerChange, onTextureReady }: Props) {
  const [orbit, setOrbit] = useState(true)

  return (
    <Canvas
      className="h-full w-full touch-none"
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.4, 3.2], fov: 40, near: 0.1, far: 50 }}
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
      <Lights />
      <Environment preset="studio" environmentIntensity={0.35} />
      <Suspense fallback={<Loader />}>
        <BlankModel
          blank={blank}
          marker={marker}
          onMarkerChange={onMarkerChange}
          setOrbitEnabled={setOrbit}
          onTextureReady={onTextureReady}
        />
      </Suspense>
      <ContactShadows position={[0, -1.15, 0]} opacity={0.35} scale={8} blur={2.5} far={3} />
      <OrbitControls
        enabled={orbit}
        makeDefault
        enablePan={false}
        minDistance={1.6}
        maxDistance={5}
        maxPolarAngle={Math.PI * 0.86}
      />
    </Canvas>
  )
}
