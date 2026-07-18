import { HomeHero } from '@/components/home-hero'
import { CategoriesSection } from '@/components/categories'
import { LookbookFlip } from '@/components/lookbook-flip'
import { GenerationTrace } from '@/components/generation-trace'
import { FeedbackColumns } from '@/components/feedback-columns'
import { InviteArc } from '@/components/invite-arc'
import { MugJourneyScroll } from '@/components/product-journey/mug-journey-scroll'

export default async function HomePage() {
  return (
    <main id="main">
      <HomeHero />
      <CategoriesSection />
      <MugJourneyScroll />
      <GenerationTrace />
      <LookbookFlip />
      <FeedbackColumns />
      <InviteArc />
    </main>
  )
}
