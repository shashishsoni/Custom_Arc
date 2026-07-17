import Link from 'next/link'
import { listBlanks } from '@/lib/api'
import { HomeHero } from '@/components/home-hero'
import { HomeCategories } from '@/components/home-categories'
import { HomeGenerationTrace } from '@/components/home-generation-trace'
import { MugJourneyScroll } from '@/components/product-journey/mug-journey-scroll'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

export default async function HomePage() {
  const blanks = await listBlanks().catch(() => [])

  return (
    <main id="main" className="pb-12">
      <HomeHero />
      <HomeCategories />
      <MugJourneyScroll />
      <HomeGenerationTrace />
    </main>
  )
}
