import { notFound } from 'next/navigation'
import { getBlank } from '@/lib/api'
import { CustomizerStub } from './customizer-stub'

export const metadata = { title: 'Customize — CustomArc' }

export default async function CustomizePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  let blank
  try {
    blank = await getBlank(slug)
  } catch {
    notFound()
  }

  return (
    <main id="main" className="py-10 pb-16">
      <h2 className="mb-2 text-3xl font-semibold tracking-tight text-fg">{blank.name}</h2>
      <p className="mb-8 text-fg-muted">
        Printable area {blank.template.printableAreaMm.widthMm}×
        {blank.template.printableAreaMm.heightMm}mm ·{' '}
        {blank.template.printPixels.widthPx}×{blank.template.printPixels.heightPx}px @300 DPI
      </p>
      <CustomizerStub slug={slug} />
    </main>
  )
}
