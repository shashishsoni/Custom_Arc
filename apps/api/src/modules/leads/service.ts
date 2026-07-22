import type { BulkLeadRequest } from '@customarc/shared'
import { logger } from '../../logger.ts'
import { notifyFounderBulkLead } from './notify.ts'
import { bulkLeadRepo } from './repo.ts'

/** Captures a B2B inquiry. No system behind it (decision 04); the founder is notified by email. */
export class LeadService {
  constructor(private readonly repo = bulkLeadRepo) {}

  async capture(input: BulkLeadRequest, userId?: string): Promise<{ id: string }> {
    const lead = await this.repo.create({ email: input.email, note: input.note, userId })
    logger.info('bulk lead captured', { leadId: lead.id, userId })
    await notifyFounderBulkLead({ leadId: lead.id, email: input.email, note: input.note })
    return lead
  }
}

export const leadService = new LeadService()
