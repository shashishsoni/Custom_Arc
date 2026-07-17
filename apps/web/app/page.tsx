import { HomeHero } from '@/components/home-hero'
import { HomeCategories } from '@/components/home-categories'
import { HomeGenerationTrace } from '@/components/home-generation-trace'
import { MugJourneyScroll } from '@/components/product-journey/mug-journey-scroll'

export default async function HomePage() {
  return (
    <main id="main" className="pb-12">
      <HomeHero />
      <HomeCategories />
      <MugJourneyScroll />
      <HomeGenerationTrace />
    </main>
  )
}
