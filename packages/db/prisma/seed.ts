/**
 * P1-06 — catalog seed: mug + phone_case as data (decision 03).
 * Idempotent. Run: `pnpm db:seed`
 */
import { config } from 'dotenv'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PrismaPg } from '@prisma/adapter-pg'
import { blankTemplateSpecSchema, type BlankTemplateSpec } from '@customarc/shared'
import { PrismaClient } from './generated/prisma/client'

config({ path: resolve(fileURLToPath(new URL('.', import.meta.url)), '../../../.env') })

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
})

const DPI = 300
const mmToPx = (mm: number) => Math.round((mm * DPI) / 25.4)

function template(
  widthMm: number,
  heightMm: number,
  safeMarginMm: number,
  modelUrl: string,
): BlankTemplateSpec {
  const widthPx = mmToPx(widthMm)
  const heightPx = mmToPx(heightMm)
  return blankTemplateSpecSchema.parse({
    printableAreaMm: { widthMm, heightMm, safeMarginMm },
    printPixels: { widthPx, heightPx },
    uvAspectRatio: widthPx / heightPx,
    modelUrl,
  })
}

type VariantSeed = {
  name: string
  partnerSku: string
  priceMinor: number
  currency: 'INR'
}

const BLANKS: {
  slug: string
  name: string
  category: 'mug' | 'phone_case'
  template: BlankTemplateSpec
  variants: VariantSeed[]
}[] = [
  {
    slug: 'mug',
    name: 'Classic Mug',
    category: 'mug',
    template: template(210, 95, 3, '/model/mug.glb'),
    variants: [
      { name: '11oz', partnerSku: 'CA-MUG-11', priceMinor: 49900, currency: 'INR' },
      { name: '15oz', partnerSku: 'CA-MUG-15', priceMinor: 59900, currency: 'INR' },
    ],
  },
  {
    slug: 'phone-case',
    name: 'Phone Case',
    category: 'phone_case',
    template: template(70, 145, 2, '/model/mobile.glb'),
    variants: [
      { name: 'iPhone 15', partnerSku: 'CA-CASE-IP15', priceMinor: 69900, currency: 'INR' },
      { name: 'iPhone 15 Pro', partnerSku: 'CA-CASE-IP15P', priceMinor: 74900, currency: 'INR' },
      { name: 'Galaxy S24', partnerSku: 'CA-CASE-S24', priceMinor: 69900, currency: 'INR' },
    ],
  },
]

async function upsertBlank(blank: (typeof BLANKS)[number]) {
  const existing = await prisma.blank.findUnique({ where: { slug: blank.slug } })

  if (existing) {
    await prisma.blankVariant.deleteMany({ where: { blankId: existing.id } })
    await prisma.blank.update({
      where: { id: existing.id },
      data: {
        name: blank.name,
        category: blank.category,
        template: blank.template,
        isActive: true,
        variants: { create: blank.variants },
      },
    })
    return
  }

  await prisma.blank.create({
    data: {
      slug: blank.slug,
      name: blank.name,
      category: blank.category,
      template: blank.template,
      variants: { create: blank.variants },
    },
  })
}

async function main() {
  for (const blank of BLANKS) await upsertBlank(blank)
  console.log(`Seeded ${BLANKS.length} blanks: ${BLANKS.map((b) => b.slug).join(', ')}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
