import { config } from 'dotenv'
import { defineConfig, env } from 'prisma/config'

// Prisma v7 CLI does not load .env automatically; load the workspace root .env.
config({ path: '../../.env' })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'bun run prisma/seed.ts',
  },
  datasource: { url: env('DATABASE_URL') },
})
