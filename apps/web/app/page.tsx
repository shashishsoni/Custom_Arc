import Link from 'next/link'
import { listBlanks } from '@/lib/api'
import { HomeHero } from '@/components/home-hero'
import { HowItWorksScroll } from '@/components/how-it-works-scroll'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

export default async function HomePage() {
  const blanks = await listBlanks().catch(() => [])

  return (
    <main id="main" className="pb-12">
      <HomeHero />
      <HowItWorksScroll />

      <section className="py-10 md:py-14">
        <div className="grid gap-4 sm:grid-cols-2">
          {blanks.length === 0 ? (
            <p className="text-fg-muted">
              Catalog loads from the API. Start it with <code className="text-fg">pnpm dev</code>.
            </p>
          ) : (
            blanks.map((b) => (
              <Link key={b.slug} href={`/customize/${b.slug}`} className="group block">
                <Card className="h-full border-border transition-colors group-hover:border-primary">
                  <CardHeader className="gap-3">
                    <Badge variant="secondary" className="w-fit capitalize">
                      {b.category.replace('_', ' ')}
                    </Badge>
                    <CardTitle className="text-xl text-fg">{b.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-fg-muted">Open in the 3D customizer →</p>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </section>

      <section id="bulk" className="max-w-xl py-12">
        <h2 className="mb-2 text-2xl font-semibold tracking-tight text-fg">Bulk orders?</h2>
        <p className="mb-6 text-fg-muted">
          Tell us what you need and we&apos;ll be in touch. (Full B2B suite comes later.)
        </p>
        <form className="flex flex-col gap-3" action="/api/leads/bulk" method="post">
          <Input name="email" type="email" placeholder="you@company.com" required className="min-h-11" />
          <textarea
            name="note"
            placeholder="Quantities, products, timeline…"
            required
            rows={4}
            className="min-h-24 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-fg placeholder:text-fg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          />
          <Button type="submit" className="min-h-11 w-fit px-6">
            Send inquiry
          </Button>
        </form>
      </section>
    </main>
  )
}
