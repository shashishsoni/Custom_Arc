import type { Metadata } from 'next'
import { Outfit, Playfair_Display } from 'next/font/google'
import { SiteHeader } from '@/modules/site-header'
import { SiteFooter } from '@/modules/site-footer'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CustomArc — customize it, we print it',
  description:
    'Customize a mug or phone case in a 3D browser customizer — your art or AI-generated — and order the physical item.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={cn(outfit.variable, playfair.variable, 'font-sans')}
    >
      <body>
        <SiteHeader />
        <div className="mx-auto w-full max-w-content px-4 md:px-6">{children}</div>
        <SiteFooter />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
