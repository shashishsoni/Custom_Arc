/**
 * Side-effect: load workspace-root `.env` before any `@customarc/shared/constants` reads.
 * Import this module first from `env.ts` / `index.ts`.
 */
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '../../..')
const envFile = ['.env', '.env.example']
  .map((name) => resolve(root, name))
  .find((path) => existsSync(path))
if (envFile) config({ path: envFile })

// Bun's bundled CA store can fail TLS on Windows/macOS (corporate AV, system roots).
// Prefer the OS trust store for outbound HTTPS (Cloudflare AI, fal, R2, Neon).
if (process.env.NODE_USE_SYSTEM_CA == null) {
  process.env.NODE_USE_SYSTEM_CA = '1'
}