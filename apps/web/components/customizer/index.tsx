'use client'

import dynamic from 'next/dynamic'
import type { Blank } from '@customarc/shared'
import type { CustomizerCamera, CustomizerModelPose } from './view-config'

const CustomizerView = dynamic(
  () => import('./customizer-view').then((m) => m.CustomizerView),
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
  return <CustomizerView blank={blank} camera={camera} model={model} />
}

export type { CustomizerCamera, CustomizerModelPose, CustomizerViewConfig } from './view-config'
export { viewForSlug, DEFAULT_VIEW, VIEW_BY_SLUG } from './view-config'
