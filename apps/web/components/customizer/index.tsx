'use client'

import dynamic from 'next/dynamic'
import type { Blank } from '@customarc/shared'

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

export function Customizer({ blank }: { blank: Blank }) {
  return <CustomizerView blank={blank} />
}
