import { notFound } from 'next/navigation'
import { getBlank } from '@/lib/api'
import { Customizer } from '@/components/customizer'

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
      <h2 className="mb-2 font-heading text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95] font-semibold tracking-tight text-fg">
        {blank.name}
      </h2>
      <p className="mb-8 text-lg leading-relaxed text-fg-muted md:text-xl">
        Printable area {blank.template.printableAreaMm.widthMm}×
        {blank.template.printableAreaMm.heightMm}mm ·{' '}
        {blank.template.printPixels.widthPx}×{blank.template.printPixels.heightPx}px @300 DPI
      </p>
      <Customizer blank={blank} />
    </main>
  )
}
