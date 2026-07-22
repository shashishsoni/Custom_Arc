import { PolicyDoc, SHIPPING } from '@/modules/policy'

export const metadata = { title: SHIPPING.metaTitle }

export default function ShippingPage() {
  return <PolicyDoc doc={SHIPPING} />
}
