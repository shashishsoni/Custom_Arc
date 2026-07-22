'use client'

import dynamic from 'next/dynamic'
import type { Blank } from '@customarc/shared'
import { StudioStage } from './components/studio-stage'
import { viewForSlug, type CustomizerCamera, type CustomizerModelPose } from './scene/view-config'

export { StudioStage, STUDIO_STAGE_BG } from './components/studio-stage'
export type { StudioStageProps } from './components/studio-stage'

const CustomizerView = dynamic(
  () => import('./components/customizer-view').then((m) => m.CustomizerView),
  {
    ssr: false,
    loading: () => (
      <StudioStage className="h-full min-h-[50vh] w-full" showViewportMark={false}>
        <p className="relative z-[1] text-sm text-fg-muted">Loading 3D customizer…</p>
      </StudioStage>
    ),
  },
)

export type CustomizerProps = {
  blank: Blank
  initialDesignId?: string | null
  camera?: CustomizerCamera
  model?: CustomizerModelPose
}

export function Customizer({ blank, initialDesignId = null, camera, model }: CustomizerProps) {
  const preset = viewForSlug(blank.slug)
  return (
    <CustomizerView
      blank={blank}
      initialDesignId={initialDesignId}
      camera={camera ?? preset.camera}
      model={model ?? preset.model}
    />
  )
}
