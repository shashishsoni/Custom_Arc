import Link from 'next/link'
import { WEB_CUSTOMIZE } from '@customarc/shared/constants'
import { listBlanks } from '@/modules/catalog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { STUDIO_STAGE_BG } from '@/lib/studio-stage-bg'

export const metadata = { title: 'Catalog — CustomArc' }

export default async function CatalogPage() {
  const blanks = await listBlanks().catch(() => [])

  return (
    <main
      id="main"
      className={cn(
        'relative flex min-h-[calc(100dvh-var(--header-h))] w-full flex-col justify-center overflow-x-clip',
        STUDIO_STAGE_BG,
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-10 pb-16 md:px-6">
        <h2 className="mb-2 font-heading text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95] font-semibold tracking-tight text-fg">
          Catalog
        </h2>
        <p className="mb-8 text-lg leading-relaxed text-fg-muted md:text-xl">
          Two blanks, one perfected pipeline.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {blanks.length === 0 ? (
            <p className="text-fg-muted">
              No blanks loaded. Run <code className="text-fg">pnpm db:seed</code>.
            </p>
          ) : (
            blanks.map((b) => (
              <Link key={b.slug} href={`${WEB_CUSTOMIZE}/${b.slug}`} className="group block">
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
      </div>
    </main>
  )
}
