'use client'

import dynamic from 'next/dynamic'
import type { Blank } from '@customarc/shared'
import { viewForSlug, type CustomizerCamera, type CustomizerModelPose } from './scene/view-config'

const CustomizerView = dynamic(
  () => import('./components/customizer-view').then((m) => m.CustomizerView),
  {
    ssr: false,
    loading: () => (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded border border-border bg-card text-sm text-fg-muted md:aspect-[16/10]">
        Loading 3D customizer…
      </div>
    ),
  },
)

export type CustomizerProps = {
  blank: Blank
  camera?: CustomizerCamera
  model?: CustomizerModelPose
}

export function Customizer({ blank, camera, model }: CustomizerProps) {
  const preset = viewForSlug(blank.slug)
  return (
    <CustomizerView
      blank={blank}
      camera={camera ?? preset.camera}
      model={model ?? preset.model}
    />
  )
}
