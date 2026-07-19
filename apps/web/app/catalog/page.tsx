import Link from 'next/link'
import { listBlanks } from '@/modules/catalog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata = { title: 'Catalog — CustomArc' }

export default async function CatalogPage() {
  const blanks = await listBlanks().catch(() => [])

  return (
    <main id="main" className="py-10 pb-16">
      <h2 className="mb-2 font-heading text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95] font-semibold tracking-tight text-fg">
        Catalog
      </h2>
      <p className="mb-8 text-lg leading-relaxed text-fg-muted md:text-xl">
        Two blanks, one perfected pipeline.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {blanks.length === 0 ? (
          <p className="text-fg-muted">No blanks loaded. Run <code className="text-fg">pnpm db:seed</code>.</p>
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
                  <p className="text-sm text-fg-muted">Customize →</p>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </main>
  )
}
