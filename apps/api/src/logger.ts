/** Structured JSON logger (backend-patterns skill). Single sink, leveled, context-aware. */

type Level = 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

function emit(level: Level, message: string, context?: LogContext): void {
  const entry = { timestamp: new Date().toISOString(), level, message, ...context }
  const sink = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
  sink(JSON.stringify(entry))
}

export const logger = {
  info: (message: string, context?: LogContext) => emit('info', message, context),
  warn: (message: string, context?: LogContext) => emit('warn', message, context),
  error: (message: string, error: unknown, context?: LogContext) =>
    emit('error', message, {
      ...context,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }),
}
