import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * One root `.env` for the monorepo (---- backend ---- / ---- frontend ----).
 * Next only auto-loads apps/web/.env*, so we load the workspace root here.
 * Only NEXT_PUBLIC_* vars are exposed to the browser.
 */
const monorepoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..')

function loadRootEnv(filePath) {
  if (!existsSync(filePath)) return
  for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = value
  }
}

loadRootEnv(path.join(monorepoRoot, '.env'))

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@customarc/shared', '@customarc/design'],
  typedRoutes: true,
  env: {
    // Ensure public frontend vars from root `.env` are available to the client bundle.
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? '',
    NEXT_PUBLIC_R2_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ?? '',
  },
}

export default nextConfig
