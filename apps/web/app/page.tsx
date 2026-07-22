import { HomeHero } from '@/modules/home-hero'
import { CategoriesSection } from '@/modules/categories'
import { LookbookFlip } from '@/modules/lookbook-flip'
import { GenerationTrace } from '@/modules/generation-trace'
import { FeedbackColumns } from '@/modules/feedback-columns'
import { BulkLeadSection } from '@/modules/bulk-lead'
import { InviteArc } from '@/modules/invite-arc'
import { MugJourneyScroll } from '@/modules/product-journey'

export default async function HomePage() {
  return (
    <main id="main">
      <HomeHero />
      <CategoriesSection />
      <MugJourneyScroll />
      <GenerationTrace />
      <LookbookFlip />
      <FeedbackColumns />
      <BulkLeadSection />
      <InviteArc />
    </main>
  )
}
