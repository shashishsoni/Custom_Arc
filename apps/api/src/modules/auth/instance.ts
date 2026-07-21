import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { emailOTP, magicLink } from 'better-auth/plugins'
import { prisma } from '@customarc/db'
import { API_BASE_URL, AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, IS_DEVELOPMENT, WEB_BASE_URL } from '@customarc/shared/constants'
import { creditsService } from '../credits/service.ts'
import { sendMagicLinkEmail, sendOtpEmail } from './mail.ts'

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
