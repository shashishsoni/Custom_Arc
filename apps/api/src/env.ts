/** Typed, fail-fast env access. Missing required values stop boot rather than failing at request time. */

import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'

// Turbo/bun cwd is apps/api — load workspace-root `.env`
// (sections: ---- shared ---- / ---- backend ---- / ---- frontend ----).
const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '../../..')
const envFile = ['.env', '.env.example']
  .map((name) => resolve(root, name))
  .find((path) => existsSync(path))
if (envFile) config({ path: envFile })

const required = (name: string): string => {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

const optional = (name: string, fallback = ''): string => process.env[name] ?? fallback

export const API_PORT = Number(optional('API_PORT', '3001'))
export const API_BASE_URL = required('API_BASE_URL')
export const WEB_BASE_URL = required('WEB_BASE_URL')
export const LOG_LEVEL = optional('LOG_LEVEL', 'info')
export const DATABASE_URL = required('DATABASE_URL')
export const AUTH_SECRET = required('AUTH_SECRET')
export const GOOGLE_CLIENT_ID = optional('GOOGLE_CLIENT_ID')
export const GOOGLE_CLIENT_SECRET = optional('GOOGLE_CLIENT_SECRET')
export const RESEND_API_KEY = optional('RESEND_API_KEY')
export const EMAIL_FROM = optional('EMAIL_FROM', 'CustomArc <onboarding@resend.dev>')
export const IS_PRODUCTION = process.env.NODE_ENV === 'production'
