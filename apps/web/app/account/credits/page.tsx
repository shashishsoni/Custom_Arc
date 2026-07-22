import { CreditsPanel } from '@/modules/credits'

export const metadata = { title: 'Credits — CustomArc' }

export default function CreditsPage() {
  return (
    <main id="main" className="mx-auto w-full max-w-7xl px-4 py-10 pb-16 md:px-6">
      <p className="mb-3 text-xs font-bold tracking-widest text-primary uppercase">Account</p>
      <h1 className="mb-2 font-heading text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95] font-semibold tracking-tight text-fg">
        Credits
      </h1>
      <p className="mb-10 max-w-2xl text-lg leading-relaxed text-fg-muted md:text-xl">
        AI texture generation spends credits. Top up when you need more.
      </p>
      <CreditsPanel />
    </main>
  )
}
