/** Minimal keyword blocklist (issue 13 layer 1). Keep short; OpenAI covers nuance when keyed. */
const BLOCKED = [
  'child porn',
  'childporn',
  'csam',
  'rape',
  'beheading',
  'nazi',
  'swastika',
]

export function scanText(text: string): { ok: true } | { ok: false; reasons: string[] } {
  const hay = text.toLowerCase()
  const reasons = BLOCKED.filter((term) => hay.includes(term)).map((term) => `blocklist:${term}`)
  return reasons.length ? { ok: false, reasons } : { ok: true }
}
