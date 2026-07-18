import type { Route } from 'next'

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
      { label: 'Catalog', href: '/catalog' },
      { label: 'Mugs', href: '/catalog' },
      { label: 'Cases', href: '/catalog' },
    ],
  },
  {
    title: 'Studio',
    tone: 'accent-2',
    kind: 'links',
    items: [{ label: 'Start customizing', href: '/catalog' }],
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
      // Phase 1 stubs — routes not shipped yet
      { label: 'Privacy', href: '/privacy' as Route },
      { label: 'Terms', href: '/terms' as Route },
    ],
  },
]

export const CLOSER = {
  volume: 'Vol. I · 2026 · CustomArc',
  fin: '— fin —',
  copyright: '© 2026 CustomArc. All rights reserved.',
} as const
