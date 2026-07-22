import { PolicyDoc, PRIVACY } from '@/modules/policy'

export const metadata = { title: PRIVACY.metaTitle }

export default function PrivacyPage() {
  return <PolicyDoc doc={PRIVACY} />
}
