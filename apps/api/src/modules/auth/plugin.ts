import { Elysia } from 'elysia'
import { unauthorized } from '../../errors.ts'
import { auth } from './instance.ts'

/** Session guard for protected modules. Compose with `.use(withAuth)`. */
export const withAuth = new Elysia({ name: 'with-auth' }).derive(
  { as: 'scoped' },
  async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) throw unauthorized()
    return { user: session.user, session: session.session }
  },
)

/** Mounts better-auth HTTP handler (`/api/auth/*`). */
export const authPlugin = new Elysia({ name: 'auth' }).mount(auth.handler)
