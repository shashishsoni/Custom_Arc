import { ApiError } from '../../errors.ts'

/**
 * Auth via better-auth (spec §7.1, issue 10) — battle-tested, httpOnly session cookies,
 * rate-limited endpoints. No hand-rolled auth. This stub marks the boundary until issue 10
 * wires the real better-auth instance + Elysia guard.
 */
export class AuthService {
  async resolveSession(_headers: Record<string, string | undefined>): Promise<{ userId: string } | null> {
    throw new ApiError(501, 'Auth not implemented (issue 10)')
  }
}

export const authService = new AuthService()
