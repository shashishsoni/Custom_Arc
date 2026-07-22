import { bulkLeadRequestSchema } from '@customarc/shared'
import { logger } from '../../logger.ts'
import { notifyFounderBulkLead } from './notify.ts'
import { bulkLeadRepo } from './repo.ts'

/** Captures a B2B inquiry. No system behind it (decision 04); the founder is notified by email. */
export class LeadService {
  constructor(private readonly repo = bulkLeadRepo) {}

  async capture(input: unknown, userId?: string): Promise<{ id: string }> {
    const { email, note } = bulkLeadRequestSchema.parse(input)
    const lead = await this.repo.create({ email, note, userId })
    logger.info('bulk lead captured', { leadId: lead.id, userId })
    await notifyFounderBulkLead({ leadId: lead.id, email, note })
    return lead
  }
}

export const leadService = new LeadService()
