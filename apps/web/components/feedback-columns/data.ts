export type Review = {
  name: string
  product: 'Mug' | 'Case'
  quote: string
}

export const SAMPLE_REVIEWS: Review[] = [
  {
    name: 'Priya N.',
    product: 'Mug',
    quote: 'The wrap landed exactly where the 3D preview showed. No surprises when it arrived.',
  },
  {
    name: 'Marcus T.',
    product: 'Case',
    quote: 'Graphite and rose arc print looks premium, not sticker-cheap.',
  },
  {
    name: 'Dana K.',
    product: 'Case',
    quote: 'As a creator, prompt to wrap to placing text felt calm, not noisy.',
  },
  {
    name: 'Owen R.',
    product: 'Mug',
    quote: 'Shipping took a beat longer than I expected, but the print quality made up for it.',
  },
  {
    name: 'Sofia L.',
    product: 'Mug',
    quote: 'Loved rotating the mug before committing — what I saw is what printed.',
  },
  {
    name: 'Ines P.',
    product: 'Case',
    quote: 'The text placement tool saved me three redo cycles on my case.',
  },
  {
    name: 'Farid A.',
    product: 'Mug',
    quote: 'Colors matched the AI preview almost exactly, even the gradient edge.',
  },
  {
    name: 'Lena W.',
    product: 'Case',
    quote: 'Support answered fast when my upload was the wrong aspect ratio.',
  },
  {
    name: 'Theo B.',
    product: 'Mug',
    quote: 'Ceramic finish felt sturdy, not thin like some print-on-demand mugs.',
  },
]

export const COLUMN_CONFIG = [
  { dir: 'up' as const, duration: '48s' },
  { dir: 'down' as const, duration: '36s' },
  { dir: 'up' as const, duration: '58s' },
]

export function bucketReviews(reviews: Review[]): [Review[], Review[], Review[]] {
  const buckets: [Review[], Review[], Review[]] = [[], [], []]
  reviews.forEach((r, i) => {
    const col = (i % 3) as 0 | 1 | 2
    buckets[col].push(r)
  })
  return buckets
}
