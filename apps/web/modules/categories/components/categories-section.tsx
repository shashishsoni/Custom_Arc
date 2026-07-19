import { CATEGORIES } from '../data'
import { CategoryRail } from './category-rail'

export function CategoriesSection() {
  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-x-clip bg-[linear-gradient(180deg,color-mix(in_srgb,var(--accent-warm)_80%,var(--bg))_0%,var(--bg)_50%,color-mix(in_srgb,var(--accent-warm)_80%,var(--bg))_100%)]">
      <div className="mx-auto w-full max-w-7xl px-4 pt-[clamp(4.5rem,10vw,9rem)] pb-[clamp(5.25rem,10vw,9.5rem)] md:px-6">
        <header className="pb-[clamp(3.4rem,7vw,5.75rem)]">
          <h2 className="font-heading max-w-[9ch] text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.9] font-semibold tracking-tight text-fg md:max-w-[11ch]">
            3D Ready
            <span className="mt-1 block text-primary italic">Categories</span>
          </h2>
          <p className="mt-8 max-w-[600px] text-lg leading-relaxed text-fg-muted md:text-xl max-md:mt-6">
            Instantly customizable products across all categories. Experience the future of tactile
            e-commerce.
          </p>
        </header>

        <div id="categories" className="relative pt-3" aria-label="Customizable product categories">
          {CATEGORIES.map((category) => (
            <CategoryRail key={category.title} category={category} />
          ))}

          <aside
            className="mx-auto flex min-h-[86px] w-full items-center justify-between gap-6 rounded border border-dashed border-border-strong bg-bg-elev px-6 py-[18px] text-fg-muted max-md:flex-col max-md:items-start max-md:gap-3 md:w-[calc(100%-14%)]"
            aria-label="Future categories"
          >
            <span className="flex items-center gap-3.5 text-[0.9rem] font-semibold before:size-2 before:rounded-full before:border before:border-accent-warm before:content-['']">
              More categories later
            </span>
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="min-h-11 cursor-not-allowed rounded border border-border bg-bg px-4 text-[0.78rem] text-fg-muted opacity-80 max-md:w-full"
            >
              Phase 1 is mugs + cases
            </button>
          </aside>
        </div>
      </div>
    </section>
  )
}
