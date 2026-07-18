import Link from 'next/link'

import { NAV_COLUMNS } from './data'

const TONE = {
  primary: 'text-primary',
  'accent-2': 'text-accent-2',
} as const

export function FooterNav() {
  return (
    <nav
      aria-label="Footer navigation"
      className="mt-[clamp(2rem,5vw,3rem)] grid grid-cols-1 gap-[clamp(2rem,4vw,2.75rem)] sm:grid-cols-2 lg:grid-cols-4 lg:gap-[clamp(1.5rem,3vw,2.5rem)]"
    >
      {NAV_COLUMNS.map((col) => {
        const labelId = `footer-col-${col.title.toLowerCase()}`
        return (
          <section key={col.title} aria-labelledby={labelId}>
            <h2
              id={labelId}
              className={`mb-3.5 text-[0.6875rem] font-bold tracking-[0.22em] uppercase ${TONE[col.tone]}`}
            >
              {col.title}
            </h2>
            {col.kind === 'note' ? (
              <p className="py-1.5 text-[0.9375rem] leading-relaxed text-fg-muted">
                <strong className="block font-semibold text-fg">{col.strong}</strong>
                {col.body}
              </p>
            ) : (
              <ul className="flex list-none flex-col p-0">
                {col.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="flex min-h-11 items-center py-1.5 text-base font-medium tracking-[0.01em] text-fg transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </nav>
  )
}
