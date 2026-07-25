import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { emailOTP, magicLink } from 'better-auth/plugins'
import { prisma } from '@customarc/db'
import { API_BASE_URL, AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, IS_DEVELOPMENT, WEB_BASE_URL } from '@customarc/shared/constants'
import { creditsService } from '../credits/service.ts'
import { sendMagicLinkEmail, sendOtpEmail } from './mail.ts'

/**
 * Web and API run on different registrable domains in production
 * (vercel.app vs code.run). The session cookie must be SameSite=None; Secure
 * or the browser silently drops it and sign-in never sticks in the UI.
 */
const CROSS_SITE_COOKIES = (() => {
  try {
    const api = new URL(API_BASE_URL)
    const web = new URL(WEB_BASE_URL)
    return api.protocol === 'https:' && api.host !== web.host
  } catch {
    return false
  }
})()

/**
 * Passwordless auth (settled): magic link + email OTP + optional Google OAuth.
 * Passwords are intentionally disabled — do not enable emailAndPassword.
 */
export const auth = betterAuth({
  baseURL: API_BASE_URL,
  secret: AUTH_SECRET,
  trustedOrigins: [WEB_BASE_URL],
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  emailAndPassword: { enabled: false },
  ...googleAuth(),
  advanced: {
    ...(CROSS_SITE_COOKIES
      ? {
          defaultCookieAttributes: {
            sameSite: 'none' as const,
            secure: true,
            // CHIPS — keeps the cookie usable as browsers phase out third-party cookies.
            partitioned: true,
          },
        }
      : {}),
    ipAddress: {
      ipAddressHeaders: ['cf-connecting-ip', 'x-real-ip', 'x-forwarded-for'],
      ...(IS_DEVELOPMENT ? { disableIpTracking: true } : {}),
    },
  },
  plugins: [
    magicLink({
      expiresIn: 60 * 10,
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLinkEmail({ to: email, url })
      },
    }),
    emailOTP({
      otpLength: 6,
      expiresIn: 60 * 10,
      sendVerificationOTP: async ({ email, otp, type }) => {
        if (type === 'forget-password') return
        await sendOtpEmail({ to: email, otp, type })
      },
    }),
  ],
  rateLimit: {
    enabled: true,
    window: 60,
    max: 20,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await creditsService.grantFreeAllocation(user.id)
        },
      },
    },
  },
})

export type AuthSession = typeof auth.$Infer.Session
export type AuthUser = AuthSession['user']

function googleAuth() {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) return {}
  return {
    socialProviders: {
      google: {
        clientId: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
      },
    },
  } as const
}
