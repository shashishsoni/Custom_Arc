import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../prisma/generated/prisma/client'

/**
 * Prisma client on the v7 Rust-free engine via @prisma/adapter-pg
 * (spec §4; prisma-expert: connection management). Dev enables query logging.
 *
 * Module singleton. The only consumer is the Bun API, which restarts the whole
 * process on `--watch` reload — so the globalThis guard used to prevent
 * connection leaks under Next.js dev hot-reload is unnecessary here (YAGNI).
 */
export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
})

export { PrismaClient } from '../prisma/generated/prisma/client'
export type * from '../prisma/generated/prisma/client'
