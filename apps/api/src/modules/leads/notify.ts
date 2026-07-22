import { createElement } from 'react'
import { Resend } from 'resend'
import { render } from 'react-email'
import {
  EMAIL_FROM,
  IS_PRODUCTION,
  LEADS_NOTIFY_EMAIL,
  RESEND_API_KEY,
} from '@customarc/shared/constants'
import { logger } from '../../logger.ts'
import { BulkLeadEmail, bulkLeadText } from './emails/bulk-lead.tsx'

const resend = new Resend(RESEND_API_KEY)

/** Issue 21 — email founder when a bulk inquiry is captured. Never throws. */
export async function notifyFounderBulkLead(input: {
  leadId: string
  email: string
  note: string
}): Promise<void> {
  if (!LEADS_NOTIFY_EMAIL) {
    logger.info('bulk lead (no LEADS_NOTIFY_EMAIL)', { leadId: input.leadId })
    return
  }

  const html = await render(createElement(BulkLeadEmail, input))
  const text = bulkLeadText(input)

  if (!RESEND_API_KEY) {
    if (IS_PRODUCTION) {
      logger.error('bulk lead email skipped — RESEND_API_KEY required in production', {
        leadId: input.leadId,
      })
      return
    }
    logger.info('bulk lead email (dev)', {
      to: LEADS_NOTIFY_EMAIL,
      leadId: input.leadId,
      email: input.email,
      note: input.note,
    })
    return
  }

  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: LEADS_NOTIFY_EMAIL,
    subject: `Bulk inquiry · ${input.email}`,
    html,
    text,
    replyTo: input.email,
    tags: [
      { name: 'category', value: 'leads' },
      { name: 'type', value: 'bulk' },
    ],
    headers: {
      'Idempotency-Key': `bulk-lead/${input.leadId}`,
    },
  })

  if (error) {
    logger.error('bulk lead email failed', { message: error.message, leadId: input.leadId })
    return
  }
  logger.info('bulk lead email sent', { id: data?.id, to: LEADS_NOTIFY_EMAIL, leadId: input.leadId })
}
