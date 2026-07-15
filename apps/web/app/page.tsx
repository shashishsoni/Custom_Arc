import Link from 'next/link'
import { listBlanks } from '@/lib/api'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export default async function HomePage() {
  const blanks = await listBlanks().catch(() => [])

  return (
    <main id="main" className="pb-12">
      <section className="max-w-2xl py-12 md:py-16" aria-labelledby="hero-title">
        <p className="mb-3 text-xs font-semibold tracking-[0.16em] text-primary uppercase">
          CustomArc
        </p>
        <h1
          id="hero-title"
          className="mb-4 text-4xl font-semibold tracking-tight text-fg md:text-5xl"
        >
          the arc of customization
        </h1>
        <p className="mb-8 text-lg text-fg-muted">
          Design mugs and phone cases in 3D — AI text to texture, print-partner fulfilled.
        </p>
        <Link
          href="/catalog"
          className={cn(buttonVariants({ size: 'lg' }), 'min-h-11 px-6')}
        >
          Start customizing
        </Link>
      </section>

      <section className="py-6">
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
