import { createAuthClient } from 'better-auth/react'
import { emailOTPClient, magicLinkClient } from 'better-auth/client/plugins'
import { API_BASE_URL } from '@customarc/shared/constants'

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  // API lives on another domain in production — always send the session cookie.
  fetchOptions: { credentials: 'include' },
  plugins: [magicLinkClient(), emailOTPClient()],
})
