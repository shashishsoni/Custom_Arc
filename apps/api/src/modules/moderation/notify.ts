import { createElement } from 'react'
import { Resend } from 'resend'
import { render } from 'react-email'
import {
  EMAIL_FROM,
  IS_PRODUCTION,
  MODERATION_NOTIFY_EMAIL,
  RESEND_API_KEY,
} from '@customarc/shared/constants'
import { logger } from '../../logger.ts'
import { ModerationHoldEmail, moderationHoldText } from './emails/hold.tsx'

const resend = new Resend(RESEND_API_KEY)

/** Issue 19 — email founder when print is held for review. */
export async function notifyFounderHold(input: {
  designId: string
  orderId?: string
  reasons: string[]
}): Promise<void> {
  if (!MODERATION_NOTIFY_EMAIL) {
    logger.info('moderation hold (no MODERATION_NOTIFY_EMAIL)', input)
    return
  }

  const html = await render(
    createElement(ModerationHoldEmail, {
      designId: input.designId,
      ...(input.orderId !== undefined ? { orderId: input.orderId } : {}),
      reasons: input.reasons,
    }),
  )
  const text = moderationHoldText({
    designId: input.designId,
    ...(input.orderId !== undefined ? { orderId: input.orderId } : {}),
    reasons: input.reasons,
  })

  if (!RESEND_API_KEY) {
    if (IS_PRODUCTION) {
      logger.error('moderation hold email skipped — RESEND_API_KEY required in production', input)
      return
    }
    logger.info('moderation hold email (dev)', {
      to: MODERATION_NOTIFY_EMAIL,
      ...input,
    })
    return
  }

  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: MODERATION_NOTIFY_EMAIL,
    subject: `Moderation hold · ${input.designId.slice(0, 8)}`,
    html,
    text,
    tags: [
      { name: 'category', value: 'moderation' },
      { name: 'type', value: 'print-hold' },
    ],
    headers: {
      'Idempotency-Key': `moderation-hold/${input.designId}/${input.reasons.join(',').slice(0, 80)}`,
    },
  })

  if (error) {
    logger.error('moderation hold email failed', { message: error.message })
    return
  }
  logger.info('moderation hold email sent', { id: data?.id, to: MODERATION_NOTIFY_EMAIL })
}
