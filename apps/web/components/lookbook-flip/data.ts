export type ProductKey = 'mug' | 'case'

export type LookbookProduct = {
  key: ProductKey
  toggleLabel: string
  name: string
  wrap: string
  blank: { src: string; alt: string }
  design: { src: string; alt: string }
}

export const LOOKBOOK_PRODUCTS: Record<ProductKey, LookbookProduct> = {
  mug: {
    key: 'mug',
    toggleLabel: 'Mug',
    name: 'Ceramic mug',
    wrap: 'Rose & graphite arc',
    blank: {
      src: '/lookbook/blank-mug.png',
      alt: 'Blank white ceramic mug with no print',
    },
    design: {
      src: '/lookbook/custom-mug.png',
      alt: 'Mug printed with a custom rose and graphite arc wrap',
    },
  },
  case: {
    key: 'case',
    toggleLabel: 'Phone case',
    name: 'Phone case',
    wrap: 'Rose & graphite arc',
    blank: {
      src: '/lookbook/blank-case.png',
      alt: 'Blank white phone case with no print',
    },
    design: {
      src: '/lookbook/custom-case.png',
      alt: 'Phone case printed with a custom rose and graphite arc wrap',
    },
  },
}

export const PRODUCT_KEYS = ['mug', 'case'] as const satisfies readonly ProductKey[]

export const PLATE_LABELS = {
  blank: {
    index: '01',
    tag: 'Plate 01 — Blank',
    fig: 'Fig. A — Blank',
    credit: '01 · Blank',
    live: 'Showing Plate 01 — Blank',
    flipBtn: 'Flip to the Design',
  },
  design: {
    index: '02',
    tag: 'Plate 02 — Design',
    fig: 'Fig. B — Design',
    credit: '02 · Design',
    live: 'Showing Plate 02 — Design',
    flipBtn: 'Flip back to the Blank',
  },
} as const

export const LOOKBOOK_COPY = {
  issueNo: 'No. 04',
  issueTitle: 'The wrap issue',
  title: 'See the wrap',
  titleEm: 'before it ships',
  lede:
    'Flip the plate to move from the Blank to your customized Design — a lookbook page turn, not a slider or a split screen.',
} as const
