import { OrderStatusView } from '@/modules/order-status'

export const metadata = { title: 'Order status — CustomArc' }

type Props = { params: Promise<{ id: string }> }

export default async function OrderStatusPage({ params }: Props) {
  const { id } = await params
  return (
    <main id="main" className="py-10 pb-16">
      <OrderStatusView orderId={id} />
    </main>
  )
}
