import type { Route } from 'next'
import {
  WEB_BULK,
  WEB_CATALOG,
  WEB_CONTACT,
  WEB_PRIVACY,
  WEB_REFUND,
  WEB_SHIPPING,
  WEB_TERMS,
} from '@customarc/shared/constants'

export const TITLE_ID = 'site-footer-wordmark'

export const MASTHEAD = {
  wordmark: 'CustomArc',
  tagline: 'the arc of customization',
} as const

export type FooterNavItem = { label: string; href: Route }

export type FooterNavColumn =
  | {
      title: string
      tone: 'primary' | 'accent-2'
      kind: 'links'
      items: FooterNavItem[]
    }
  | {
      title: string
      tone: 'primary' | 'accent-2'
      kind: 'note'
      strong: string
      body: string
    }

export const NAV_COLUMNS: FooterNavColumn[] = [
  {
    title: 'Explore',
    tone: 'primary',
    kind: 'links',
    items: [
      { label: 'Catalog', href: WEB_CATALOG },
      { label: 'Mugs', href: WEB_CATALOG },
      { label: 'Cases', href: WEB_CATALOG },
    ],
  },
  {
    title: 'Studio',
    tone: 'accent-2',
    kind: 'links',
    items: [
      { label: 'Start customizing', href: WEB_CATALOG },
      { label: 'Bulk orders', href: WEB_BULK as Route },
    ],
  },
  {
    title: 'Notes',
    tone: 'primary',
    kind: 'note',
    strong: 'Phase 1',
    body: 'Screen color approximate',
  },
  {
    title: 'Legal',
    tone: 'accent-2',
    kind: 'links',
    items: [
      { label: 'Privacy', href: WEB_PRIVACY as Route },
      { label: 'Terms', href: WEB_TERMS as Route },
      { label: 'Shipping', href: WEB_SHIPPING as Route },
      { label: 'Refunds', href: WEB_REFUND as Route },
      { label: 'Contact', href: WEB_CONTACT as Route },
    ],
  },
]

export const CLOSER = {
  volume: 'Vol. I · 2026 · CustomArc',
  fin: '— fin —',
  copyright: '© 2026 CustomArc. All rights reserved.',
} as const
