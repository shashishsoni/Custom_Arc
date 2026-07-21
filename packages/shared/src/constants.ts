/**
 * Shared constants — single source for env + route paths (web + API).
 * Prefer these names everywhere; do not scatter `process.env` or hard-coded API paths.
 *
 * PUBLIC  — safe in browser / RSC (`NEXT_PUBLIC_*` first where needed).
 * SERVER  — API / Node only. Never import secrets into Client Components.
 *
 * Next inlines only **static** `process.env.NEXT_PUBLIC_*` — keep those literal.
 * API entry must `import './load-env'` before this module is first imported.
 */

function optional(name: keyof NodeJS.ProcessEnv, fallback = ''): string {
  return process.env[name]?.trim() || fallback
}

// ─── PUBLIC env ───────────────────────────────────────────────────

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
  process.env.API_BASE_URL?.trim() ||
  'http://localhost:3001'

export const WEB_BASE_URL =
  (globalThis as { location?: { origin?: string } }).location?.origin ||
  process.env.NEXT_PUBLIC_WEB_BASE_URL?.trim() ||
  process.env.WEB_BASE_URL?.trim() ||
  'http://localhost:3000'

export const R2_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL?.trim() || ''

export const IS_PRODUCTION = process.env.NODE_ENV === 'production'
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'

// ─── SERVER env ───────────────────────────────────────────────────

export const API_PORT = Number(optional('API_PORT', '3001'))
export const LOG_LEVEL = optional('LOG_LEVEL', 'info')
export const DATABASE_URL = optional('DATABASE_URL')
export const AUTH_SECRET = optional('AUTH_SECRET')
export const AUTH_TRUST_HOST = optional('AUTH_TRUST_HOST', 'true') === 'true'
export const GOOGLE_CLIENT_ID = optional('GOOGLE_CLIENT_ID')
export const GOOGLE_CLIENT_SECRET = optional('GOOGLE_CLIENT_SECRET')
export const RESEND_API_KEY = optional('RESEND_API_KEY')
export const EMAIL_FROM = optional('EMAIL_FROM', 'CustomArc <onboarding@resend.dev>')

export const R2_ACCOUNT_ID = optional('R2_ACCOUNT_ID')
export const R2_ACCESS_KEY_ID = optional('R2_ACCESS_KEY_ID')
export const R2_SECRET_ACCESS_KEY = optional('R2_SECRET_ACCESS_KEY')
export const R2_BUCKET = optional('R2_BUCKET', 'customarc-uploads')
export const R2_PUBLIC_BASE_URL_SERVER = optional('R2_PUBLIC_BASE_URL')
export const R2_ENABLED = Boolean(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY)

export const FAL_KEY = optional('FAL_KEY')
export const CLOUDFLARE_ACCOUNT_ID = optional('CLOUDFLARE_ACCOUNT_ID')
export const CLOUDFLARE_AI_TOKEN = optional('CLOUDFLARE_AI_TOKEN')

export const RAZORPAY_KEY_ID = optional('RAZORPAY_KEY_ID')
export const RAZORPAY_KEY_SECRET = optional('RAZORPAY_KEY_SECRET')
export const RAZORPAY_WEBHOOK_SECRET = optional('RAZORPAY_WEBHOOK_SECRET')
/** True when Razorpay keys are configured; otherwise checkout uses mock pay. */
export const RAZORPAY_ENABLED = Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET)
/** Razorpay Standard Checkout minimum order amount (paise). */
export const RAZORPAY_MIN_AMOUNT_PAISE = 100

export const PRINT_PARTNER = optional('PRINT_PARTNER', 'qikink')
export const PRINT_PARTNER_API_KEY = optional('PRINT_PARTNER_API_KEY')

/** Auto-approve uploads when true (default). Set false + reviewer ids for manual gate. */
export const MODERATION_AUTO_APPROVE = optional('MODERATION_AUTO_APPROVE', 'true') === 'true'
/** Comma-separated user ids allowed to POST /moderation/flags/:id/review. */
export const MODERATION_REVIEWER_IDS = optional('MODERATION_REVIEWER_IDS')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
export const OPENAI_API_KEY = optional('OPENAI_API_KEY')


export const SENTRY_DSN = optional('SENTRY_DSN')

/** API boot: throw if required server vars are missing. */
export function assertServerEnv(): void {
  const required = {
    API_BASE_URL: process.env.API_BASE_URL?.trim(),
    WEB_BASE_URL: process.env.WEB_BASE_URL?.trim(),
    DATABASE_URL,
    AUTH_SECRET,
  } as const
  for (const [name, value] of Object.entries(required)) {
    if (!value) throw new Error(`Missing required env var: ${name}`)
  }
}

// ─── API route paths (Elysia prefixes + fetch targets) ────────────

export const API_HEALTH = '/health'
export const API_CATALOG = '/catalog'
export const API_CATALOG_BLANKS = '/catalog/blanks'
export const API_DESIGNS = '/designs'
export const API_UPLOADS = '/uploads'
export const API_CREDITS = '/credits'
export const API_CREDITS_BALANCE = '/credits/balance'
export const API_CREDITS_SPEND = '/credits/spend'
export const API_LEADS = '/leads'
export const API_LEADS_BULK = '/leads/bulk'
export const API_AUTH = '/api/auth'
export const API_ORDERS = '/orders'
export const API_BILLING = '/billing'
export const API_BILLING_WEBHOOK = '/billing/webhook'
export const API_PRINT_FILES = '/print-files'
export const API_MODERATION = '/moderation'
export const API_FULFILLMENT = '/fulfillment'

/** Sandbox partner when API key unset (issue 17 first proof). */
export const PRINT_PARTNER_SANDBOX = !PRINT_PARTNER_API_KEY

/** Partner shipment webhook shared secret (issue 18). Empty = dev/sandbox only. */
export const FULFILLMENT_WEBHOOK_SECRET = optional('FULFILLMENT_WEBHOOK_SECRET')


/** Absolute URL for an API path. */
export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${p}`
}

// ─── Web app routes (Next.js) ─────────────────────────────────────

export const WEB_HOME = '/'
export const WEB_CATALOG = '/catalog'
export const WEB_CUSTOMIZE = '/customize'
export const WEB_ORDERS = '/orders'
