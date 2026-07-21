import type { DrawableImage } from '@customarc/design'
import { blankTemplateSpecSchema, parseDesignDocument, type DesignDocument } from '@customarc/shared'
import { badRequest, forbidden, notFound } from '../../errors.ts'
import { logger } from '../../logger.ts'
import { ordersRepo } from '../orders/repo.ts'
import { uploadsRepo } from '../uploads/repo.ts'
import { putUploadObject, readUploadObject } from '../uploads/storage.ts'
import { loadDrawableImage, PRINT_DPI, renderPrintPng } from './render.ts'
import { printFilesRepo, type OrderItemForPrint, type PrintFileRow } from './repo.ts'

const PRINT_ROOT = 'CustomArc-Local/printfiles'

export type PrintFileSummary = {
  id: string
  orderItemId: string
  widthPx: number
  heightPx: number
  dpi: number
  format: string
  validated: boolean
}

/** Issue 15 — server print file at 300 DPI from Design JSON. */
export class PrintFilesService {
  constructor(
    private readonly repo = printFilesRepo,
    private readonly orders = ordersRepo,
  ) {}

  async generateForOrder(orderId: string): Promise<PrintFileSummary[]> {
    const items = await this.repo.listOrderItems(orderId)
    if (items.length === 0) throw notFound('Order has no items')

    const out: PrintFileSummary[] = []
    for (const item of items) {
      out.push(await this.generateForItem(item))
    }
    return out
  }

  async generateForOwnedOrder(orderId: string, userId: string): Promise<PrintFileSummary[]> {
    await this.requireOrderOwner(orderId, userId)
    return this.generateForOrder(orderId)
  }

  async listForOwnedOrder(orderId: string, userId: string): Promise<PrintFileSummary[]> {
    await this.requireOrderOwner(orderId, userId)
    return (await this.repo.listByOrderId(orderId)).map(toSummary)
  }

  async readContentForUser(
    printFileId: string,
    userId: string,
  ): Promise<{ body: Buffer; contentType: string }> {
    const row = await this.repo.getById(printFileId)
    if (!row) throw notFound('Print file not found')
    if (row.orderItem.order.userId !== userId) throw forbidden()
    return readUploadObject(row.storageKey)
  }

  private async requireOrderOwner(orderId: string, userId: string): Promise<void> {
    const order = await this.orders.getById(orderId)
    if (!order) throw notFound('Order not found')
    if (order.userId !== userId) throw forbidden()
  }

  private async generateForItem(item: OrderItemForPrint): Promise<PrintFileSummary> {
    const doc = parseDesignDocument(item.design.document) as DesignDocument
    const template = blankTemplateSpecSchema.parse(item.design.blank.template)
    const images = await loadDesignImages(doc)

    const { png, widthPx, heightPx } = await renderPrintPng({
      doc,
      images,
      wrapHorizontal: template.wrapHorizontal,
    })

    const key = `${PRINT_ROOT}/${item.orderId}/${item.id}.png`
    const storageKey = await putUploadObject(key, png, 'image/png')
    const row = await this.repo.upsertForItem({
      orderItemId: item.id,
      storageKey,
      widthPx,
      heightPx,
      dpi: PRINT_DPI,
      format: 'png',
    })

    logger.info('print file generated', {
      orderId: item.orderId,
      orderItemId: item.id,
      widthPx,
      heightPx,
      dpi: PRINT_DPI,
    })

    return toSummary(row)
  }
}

async function loadDesignImages(doc: DesignDocument): Promise<Map<string, DrawableImage>> {
  const map = new Map<string, DrawableImage>()
  for (const layer of doc.layers) {
    if (layer.type !== 'image') continue
    if (layer.uploadId.startsWith('local-')) {
      throw badRequest('Design has local-only images; re-upload while signed in before print')
    }
    if (map.has(layer.uploadId)) continue
    const upload = await uploadsRepo.getById(layer.uploadId)
    if (!upload) throw badRequest(`Missing upload ${layer.uploadId}`)
    const { body } = await readUploadObject(upload.storageKey)
    map.set(layer.uploadId, await loadDrawableImage(body))
  }
  return map
}

function toSummary(row: PrintFileRow): PrintFileSummary {
  return {
    id: row.id,
    orderItemId: row.orderItemId,
    widthPx: row.widthPx,
    heightPx: row.heightPx,
    dpi: row.dpi,
    format: row.format,
    validated: row.validated,
  }
}

export const printFilesService = new PrintFilesService()
