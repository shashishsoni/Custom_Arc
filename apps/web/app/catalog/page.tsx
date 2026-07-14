import { listBlanks } from '@/lib/api'

export const metadata = { title: 'Catalog — CustomArc' }

export default async function CatalogPage() {
  const blanks = await listBlanks().catch(() => [])

  return (
    <main className="section">
      <h2>Catalog</h2>
      <p className="muted">Two blanks, one perfected pipeline.</p>
      <div className="grid" style={{ marginTop: 24 }}>
        {blanks.length === 0 ? (
          <p className="muted">No blanks loaded. Is the API running?</p>
        ) : (
          blanks.map((b) => (
            <a key={b.slug} className="card" href={`/customize/${b.slug}`}>
              <span className="tag">{b.category}</span>
              <h3>{b.name}</h3>
              <p>Customize →</p>
            </a>
          ))
        )}
      </div>
    </main>
  )
}
