import { Resend } from 'resend'
import { EMAIL_FROM, IS_PRODUCTION, RESEND_API_KEY } from '../../env.ts'
import { logger } from '../../logger.ts'

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
  const subject = 'Sign in to CustomArc'
  const text = `Sign in to CustomArc:\n${args.url}\n\nThis link expires soon. If you did not request it, ignore this email.`
  const html = `<p>Click to sign in:</p><p><a href="${args.url}">Sign in to CustomArc</a></p><p>Or open: ${args.url}</p><p>Expires soon. If you did not request this, ignore it.</p>`

  await sendAuthEmail({
    to: args.to,
    subject,
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
  const subject = 'Your CustomArc sign-in OTP'
  const text = `Your CustomArc sign-in OTP is ${args.otp}. It expires soon. If you did not request this, ignore this email.`
  const html = `<p>Your sign-in OTP:</p><p style="font-size:24px;letter-spacing:4px;font-weight:700">${args.otp}</p><p>Expires soon. If you did not request this, ignore it.</p>`

  await sendAuthEmail({
    to: args.to,
    subject,
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
