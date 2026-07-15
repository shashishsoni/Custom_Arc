import { createAuthClient } from 'better-auth/react'
import { emailOTPClient, magicLinkClient } from 'better-auth/client/plugins'

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001'

export const authClient = createAuthClient({
  baseURL,
  plugins: [magicLinkClient(), emailOTPClient()],
})
