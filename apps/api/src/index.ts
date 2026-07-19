// Load workspace-root .env before shared constants / prisma.
import './load-env.ts'
import {
  API_BASE_URL,
  API_PORT,
  assertServerEnv,
} from '@customarc/shared/constants'
import { app } from './app.ts'
import { logger } from './logger.ts'

assertServerEnv()

app.listen(API_PORT, (handler) => {
  logger.info('api listening', { port: API_PORT, baseUrl: API_BASE_URL, host: handler.hostname })
})

process.on('beforeExit', async () => {
  const { prisma } = await import('@customarc/db')
  await prisma.$disconnect()
})
