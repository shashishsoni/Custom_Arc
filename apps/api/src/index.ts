// Load workspace-root .env before anything else (prisma reads DATABASE_URL at import).
import { API_BASE_URL, API_PORT } from './env.ts'
import { app } from './app.ts'
import { logger } from './logger.ts'

app.listen(API_PORT, (handler) => {
  logger.info('api listening', { port: API_PORT, baseUrl: API_BASE_URL, host: handler.hostname })
})

process.on('beforeExit', async () => {
  const { prisma } = await import('@customarc/db')
  await prisma.$disconnect()
})
