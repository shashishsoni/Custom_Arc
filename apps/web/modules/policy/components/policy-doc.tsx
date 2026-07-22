import type { PolicyDoc as Doc } from '../data'

export function PolicyDoc({ doc }: { doc: Doc }) {
  return (
    <main id="main" className="mx-auto w-full max-w-7xl px-4 py-10 pb-16 md:px-6">
      <p className="mb-3 text-xs font-bold tracking-widest text-primary uppercase">Legal</p>
      <h1 className="max-w-[14ch] font-heading text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95] font-semibold tracking-tight text-fg">
        {doc.title}
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-fg-muted md:text-xl">{doc.lede}</p>
      <p className="mt-2 text-sm text-fg-muted">Last updated {doc.updated}</p>

      <div className="mt-12 max-w-3xl space-y-10">
        {doc.sections.map((s, i) => (
          <section key={s.heading} aria-labelledby={`policy-${doc.slug}-${i}`}>
            <h2
              id={`policy-${doc.slug}-${i}`}
              className="mb-3 font-heading text-2xl font-semibold tracking-tight text-fg md:text-3xl"
            >
              {s.heading}
            </h2>
            <div className="space-y-3">
              {s.paragraphs.map((p, j) => (
                <p key={j} className="text-base leading-relaxed text-fg-muted md:text-lg">
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
