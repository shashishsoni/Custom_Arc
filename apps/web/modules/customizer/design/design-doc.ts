import type { Blank, DesignDocument, ImageLayer, Layer, LayerTransform, TextLayer } from '@customarc/shared'
import { createEmptyDesign } from '@customarc/shared'

export function emptyDocForBlank(blank: Blank): DesignDocument {
  const { widthMm, heightMm } = blank.template.printableAreaMm
  return createEmptyDesign(blank.slug, widthMm, heightMm)
}

export function defaultImageTransform(
  widthMm: number,
  heightMm: number,
  naturalW: number,
  naturalH: number,
  scale = 0.22,
): LayerTransform {
  const aspect = naturalW / Math.max(1, naturalH)
  let w = widthMm * scale
  let h = w / aspect
  const maxH = heightMm * Math.min(0.85, scale + 0.1)
  if (h > maxH) {
    h = maxH
    w = h * aspect
  }
  return {
    xMm: (widthMm - w) / 2,
    yMm: (heightMm - h) / 2,
    widthMm: w,
    heightMm: h,
    rotationDeg: 0,
    opacity: 1,
  }
}

export function makeImageLayer(
  upload: { id: string; previewUrl: string; widthPx: number; heightPx: number },
  template: { widthMm: number; heightMm: number },
  scale = 0.22,
): ImageLayer {
  return {
    id: crypto.randomUUID(),
    type: 'image',
    uploadId: upload.id,
    previewUrl: upload.previewUrl,
    naturalWidthPx: upload.widthPx,
    naturalHeightPx: upload.heightPx,
    transform: defaultImageTransform(
      template.widthMm,
      template.heightMm,
      upload.widthPx,
      upload.heightPx,
      scale,
    ),
  }
}

/** AI wrap — larger coverage of the printable area. */
export function makeAiImageLayer(
  upload: { id: string; previewUrl: string; widthPx: number; heightPx: number },
  template: { widthMm: number; heightMm: number },
): ImageLayer {
  return makeImageLayer(upload, template, 0.72)
}

export function makeTextLayer(
  text: string,
  template: { widthMm: number; heightMm: number },
): TextLayer {
  const w = template.widthMm * 0.4
  const h = 18
  return {
    id: crypto.randomUUID(),
    type: 'text',
    text,
    fontFamily: 'system-ui, sans-serif',
    fontSizeMm: 8,
    color: '#1a1a1a',
    fontWeight: 'bold',
    textAlign: 'center',
    transform: {
      xMm: (template.widthMm - w) / 2,
      yMm: (template.heightMm - h) / 2,
      widthMm: w,
      heightMm: h,
      rotationDeg: 0,
      opacity: 1,
    },
  }
}

export function updateLayer(
  doc: DesignDocument,
  layerId: string,
  patch: Partial<Layer> | ((layer: Layer) => Layer),
): DesignDocument {
  return {
    ...doc,
    layers: doc.layers.map((layer) => {
      if (layer.id !== layerId) return layer
      return typeof patch === 'function' ? patch(layer) : ({ ...layer, ...patch } as Layer)
    }),
  }
}

export function patchTransform(
  doc: DesignDocument,
  layerId: string,
  transform: Partial<LayerTransform>,
): DesignDocument {
  return updateLayer(doc, layerId, (layer) => ({
    ...layer,
    transform: { ...layer.transform, ...transform },
  }))
}
