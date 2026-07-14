import { app } from './app.ts'
import { env } from './env.ts'
import { logger } from './logger.ts'

app.listen(env.apiPort, (handler) => {
  logger.info('api listening', { port: env.apiPort, baseUrl: env.apiBaseUrl, host: handler.hostname })
})

process.on('beforeExit', async () => {
  const { prisma } = await import('@customarc/db')
  await prisma.$disconnect()
})
