import { PolicyDoc, REFUND } from '@/modules/policy'

export const metadata = { title: REFUND.metaTitle }

export default function RefundPage() {
  return <PolicyDoc doc={REFUND} />
}
