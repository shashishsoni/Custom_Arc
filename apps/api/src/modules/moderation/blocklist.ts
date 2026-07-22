/**
 * Keyword blocklist — issue 13 layer 1 (hard reject only).
 * Keep to clear illegal / extreme terms. Fan art & franchise styles are allowed
 * for Phase-1 POD; NSFW/illegal still blocked via AI + this list.
 */
const HARD = [
  'child porn',
  'childporn',
  'csam',
  'rape',
  'beheading',
  'nazi',
  'swastika',
]

export function scanText(text: string): { ok: boolean; reasons: string[] } {
  const hay = text.toLowerCase()
  const reasons = HARD.filter((term) => hay.includes(term)).map((term) => `blocklist:${term}`)
  return reasons.length ? { ok: false, reasons } : { ok: true, reasons: [] }
}
