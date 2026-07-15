import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CustomArc — customize it, we print it',
  description:
    'Customize a mug or phone case in a 3D browser customizer — your art or AI-generated — and order the physical item.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(outfit.variable, 'font-sans')}>
      <body>
        <Link
          href="#main"
          className="fixed top-2 left-2 z-[var(--z-skip)] -translate-y-[200%] rounded bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform focus:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary"
        >
          Skip to content
        </Link>
        <SiteHeader />
        <div className="mx-auto w-full max-w-content px-4 md:px-6">
          {children}
          <footer className="mt-16 flex flex-col gap-2 border-t border-border py-8 text-sm text-fg-muted sm:flex-row sm:items-center sm:justify-between">
            <span>CustomArc — the arc of customization.</span>
            <span>Phase 1 · build in progress</span>
          </footer>
        </div>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
