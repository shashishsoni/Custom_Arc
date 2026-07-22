import { OrderStatusView } from '@/modules/order-status'

export const metadata = { title: 'Order status — CustomArc' }

type Props = { params: Promise<{ id: string }> }

export default async function OrderStatusPage({ params }: Props) {
  const { id } = await params
  return (
    <main id="main" className="mx-auto w-full max-w-7xl px-4 py-10 pb-16 md:px-6">
      <OrderStatusView orderId={id} />
    </main>
  )
}
