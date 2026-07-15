import { createElement } from 'react'
import { Resend } from 'resend'
import { render } from 'react-email'
import { EMAIL_FROM, IS_PRODUCTION, RESEND_API_KEY } from '../../env.ts'
import { logger } from '../../logger.ts'
import { MagicLinkEmail, magicLinkText } from './emails/magic-link.tsx'
import { OtpEmail, otpText } from './emails/otp.tsx'

const resend = new Resend(RESEND_API_KEY)

type SendArgs = {
  to: string
  subject: string
  html: string
  text: string
  idempotencyKey: string
  tags: { name: string; value: string }[]
  /** Logged in local/dev when Resend is not configured */
  devPayload?: Record<string, string>
}

/**
 * Send transactional email via Resend.
 * Without RESEND_API_KEY in non-production: logs payload (OTP visible in API console).
 * Production requires RESEND_API_KEY + verified EMAIL_FROM domain.
 */
async function sendAuthEmail(args: SendArgs): Promise<void> {
  if (!RESEND_API_KEY) {
    if (IS_PRODUCTION) {
      throw new Error('RESEND_API_KEY is required in production')
    }
    logger.info('auth email (dev — set RESEND_API_KEY to deliver)', {
      to: args.to,
      subject: args.subject,
      ...args.devPayload,
    })
    return
  }

  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: args.to,
    subject: args.subject,
    html: args.html,
    text: args.text,
    tags: args.tags,
    headers: {
      'Idempotency-Key': args.idempotencyKey,
    },
  })

  if (error) {
    logger.error('resend send failed', { message: error.message, name: error.name })
    throw new Error(error.message)
  }

  logger.info('auth email sent', { id: data?.id, to: args.to })
}

export async function sendMagicLinkEmail(args: {
  to: string
  url: string
}): Promise<void> {
  const html = await render(createElement(MagicLinkEmail, { url: args.url }))
  const text = magicLinkText(args.url)

  await sendAuthEmail({
    to: args.to,
    subject: 'Sign in to CustomArc',
    html,
    text,
    idempotencyKey: `auth-magic-link/${args.to}/${Date.now()}`,
    tags: [
      { name: 'category', value: 'auth' },
      { name: 'type', value: 'magic-link' },
    ],
    devPayload: { type: 'magic-link', url: args.url },
  })
}

export async function sendOtpEmail(args: {
  to: string
  otp: string
  type: string
}): Promise<void> {
  const html = await render(createElement(OtpEmail, { otp: args.otp }))
  const text = otpText(args.otp)

  await sendAuthEmail({
    to: args.to,
    subject: 'Your CustomArc sign-in code',
    html,
    text,
    idempotencyKey: `auth-otp/${args.type}/${args.to}/${args.otp}`,
    tags: [
      { name: 'category', value: 'auth' },
      { name: 'type', value: `otp-${args.type}` },
    ],
    devPayload: { type: `otp:${args.type}`, otp: args.otp },
  })
}
