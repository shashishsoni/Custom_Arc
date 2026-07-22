import { PolicyDoc, TERMS } from '@/modules/policy'

export const metadata = { title: TERMS.metaTitle }

export default function TermsPage() {
  return <PolicyDoc doc={TERMS} />
}
