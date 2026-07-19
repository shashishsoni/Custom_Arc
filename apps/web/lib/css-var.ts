/** Resolve a CSS custom property from `:root` (globals.css / Tailwind `@theme`). */
export function cssVar(name: `--${string}`, fallback = ''): string {
  if (typeof document === 'undefined') return fallback
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}
