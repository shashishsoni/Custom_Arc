/**
 * Keyword blocklist — issue 13 layer 1 (reject-only).
 * Keep short; OpenAI + semantic layers cover nuance when keyed.
 */
const NSFW = [
  'child porn',
  'childporn',
  'csam',
  'rape',
  'beheading',
  'nazi',
  'swastika',
]

/** Brand / franchise / character cues — common POD IP traps. */
const IP = [
  'disney',
  'marvel',
  'pokemon',
  'pokémon',
  'hello kitty',
  'nike',
  'adidas',
  'gucci',
  'louis vuitton',
  'harry potter',
  'star wars',
  'spider-man',
  'spiderman',
  'mickey mouse',
  'in the style of',
]

const BLOCKED = [...NSFW, ...IP]

export function scanText(text: string): { ok: true } | { ok: false; reasons: string[] } {
  const hay = text.toLowerCase()
  const reasons = BLOCKED.filter((term) => hay.includes(term)).map((term) => `blocklist:${term}`)
  return reasons.length ? { ok: false, reasons } : { ok: true }
}
