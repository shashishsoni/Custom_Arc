'use client'

import { useEffect, useMemo, useState } from 'react'
import type { DesignDocument } from '@customarc/shared'
import type { DrawableImage } from '@customarc/design'

/** Load preview images keyed by uploadId for renderDesign. */
export function useDesignImages(doc: DesignDocument) {
  const [images, setImages] = useState<Map<string, DrawableImage>>(() => new Map())

  const imageKey = useMemo(
    () =>
      doc.layers
        .filter((l) => l.type === 'image')
        .map((l) => `${l.uploadId}\0${l.previewUrl}`)
        .join('|'),
    [doc.layers],
  )

  useEffect(() => {
    let cancelled = false
    const imageLayers = doc.layers.filter((l) => l.type === 'image')
    if (!imageLayers.length) {
      setImages(new Map())
      return
    }

    const next = new Map<string, DrawableImage>()
    void Promise.all(
      imageLayers.map(async (layer) => {
        const img = await loadImage(layer.previewUrl)
        if (!cancelled) next.set(layer.uploadId, img)
      }),
    ).then(() => {
      if (!cancelled) setImages(new Map(next))
    })

    return () => {
      cancelled = true
    }
    // intentionally keyed by imageKey (upload set), not full doc transforms
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageKey])

  return images
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load ${url}`))
    img.src = url
  })
}
