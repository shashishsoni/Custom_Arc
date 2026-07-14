/** Typed, fail-fast env access. Missing required values stop boot rather than failing at request time. */

const required = (name: string): string => {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

const optional = (name: string, fallback = ''): string => process.env[name] ?? fallback

export const env = {
  apiPort: Number(optional('API_PORT', '3001')),
  apiBaseUrl: required('API_BASE_URL'),
  webBaseUrl: required('WEB_BASE_URL'),
  logLevel: optional('LOG_LEVEL', 'info'),
  databaseUrl: required('DATABASE_URL'),
  authSecret: required('AUTH_SECRET'),
  isProduction: process.env.NODE_ENV === 'production',
} as const

export type Env = typeof env
