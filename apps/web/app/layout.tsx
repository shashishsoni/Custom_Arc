import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CustomArc — customize it, we print it',
  description:
    'Customize a mug or phone case in a 3D browser customizer — your art or AI-generated — and order the physical item.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <nav className="nav">
            <a href="/" className="nav-brand">
              CustomArc
            </a>
            <div className="nav-links">
              <a href="/catalog">Catalog</a>
              <a href="/#bulk">Bulk orders</a>
            </div>
          </nav>
          {children}
          <footer className="footer">
            <span>CustomArc — the arc of customization.</span>
            <span>Phase 1 · build in progress</span>
          </footer>
        </div>
      </body>
    </html>
  )
}
