import { auth } from './instance.ts'

export type SessionUser = { userId: string; email: string; name: string }

/**
 * Session resolution for non-route callers (jobs, internal modules).
 * Routes should prefer `{ auth: true }` on the Elysia macro instead.
 */
export class AuthService {
  async resolveSession(
    headers: Headers | Record<string, string | undefined>,
  ): Promise<SessionUser | null> {
    const h = headers instanceof Headers ? headers : toHeaders(headers)
    const session = await auth.api.getSession({ headers: h })
    if (!session) return null
    return {
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name,
    }
  }
}

export const authService = new AuthService()

function toHeaders(record: Record<string, string | undefined>): Headers {
  const h = new Headers()
  for (const [k, v] of Object.entries(record)) {
    if (v !== undefined) h.set(k, v)
  }
  return h
}
