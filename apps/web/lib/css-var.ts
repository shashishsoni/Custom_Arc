/** Resolve a CSS custom property from `:root` (globals.css / Tailwind `@theme`). */
export function cssVar(name: `--${string}`): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}
