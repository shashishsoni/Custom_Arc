import { listBlanks } from '@/lib/api'

export default async function HomePage() {
  // API may be down in dev (start it with `pnpm dev`) — render an empty catalog.
  const blanks = await listBlanks().catch(() => [])

  return (
    <main>
      <section className="hero">
        <h1>Customize it. We print it.</h1>
        <p>
          Wrap your own artwork — or a prompt — onto a mug or phone case in a live 3D editor. What
          you see is what comes off the printer.
        </p>
        <a className="btn" href="/catalog">
          Start customizing
        </a>
      </section>

      <section className="section">
        <div className="grid">
          {blanks.length === 0 ? (
            <p className="muted">
              Catalog loads from the API. Start it with <code>pnpm dev</code>.
            </p>
          ) : (
            blanks.map((b) => (
              <a key={b.slug} className="card" href={`/customize/${b.slug}`}>
                <span className="tag">{b.category}</span>
                <h3>{b.name}</h3>
                <p>Open in the 3D customizer →</p>
              </a>
            ))
          )}
        </div>
      </section>

      <section id="bulk" className="section">
        <h2>Bulk orders?</h2>
        <p className="muted">
          Tell us what you need and we&apos;ll be in touch. (Full B2B suite comes later.)
        </p>
        <form className="lead" action="/api/leads/bulk" method="post">
          <input name="email" type="email" placeholder="you@company.com" required />
          <textarea name="note" placeholder="Quantities, products, timeline…" required />
          <button className="btn" type="submit">
            Send inquiry
          </button>
        </form>
      </section>
    </main>
  )
}
