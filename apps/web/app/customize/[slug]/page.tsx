import { notFound } from 'next/navigation'
import { getBlank } from '@/modules/catalog'
import { Customizer } from '@/modules/customizer'

export const metadata = { title: 'Customize — CustomArc' }

export default async function CustomizePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ design?: string }>
}) {
  const { slug } = await params
  const { design } = await searchParams
  let blank
  try {
    blank = await getBlank(slug)
  } catch {
    notFound()
  }

  return (
    <main id="main" className="h-full min-h-0">
      <h1 className="sr-only">{blank.name} customizer</h1>
      <Customizer blank={blank} initialDesignId={design?.trim() || null} />
    </main>
  )
}
