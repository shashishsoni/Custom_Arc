import { CONTACT_PAGE, PolicyDoc } from '@/modules/policy'

export const metadata = { title: CONTACT_PAGE.metaTitle }

export default function ContactPage() {
  return <PolicyDoc doc={CONTACT_PAGE} />
}
