export type Category = {
  index: string
  title: string
  description: string
  finishes: string[]
  finishesLabel: string
  cta: string
  href: '/catalog'
  mirror?: boolean
  product: 'mug' | 'case'
}

export const CATEGORIES: Category[] = [
  {
    index: '01 / Ceramic blank',
    title: 'Mugs',
    description:
      'Preview your artwork around a classic ceramic mug before ordering through our print partner.',
    finishes: ['Gloss ceramic', 'Full wrap preview'],
    finishesLabel: 'Available mug finishes',
    cta: 'Customize mug',
    href: '/catalog',
    product: 'mug',
  },
  {
    index: '02 / Device shell',
    title: 'Phone cases',
    description:
      'Place a custom texture across a fitted phone-case preview and inspect the composition before print.',
    finishes: ['Gloss shell', 'Soft-touch shell'],
    finishesLabel: 'Available phone case finishes',
    cta: 'Customize case',
    href: '/catalog',
    mirror: true,
    product: 'case',
  },
]
