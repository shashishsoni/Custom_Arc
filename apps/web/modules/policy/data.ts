import {
  WEB_CONTACT,
  WEB_PRIVACY,
  WEB_REFUND,
  WEB_SHIPPING,
  WEB_TERMS,
} from '@customarc/shared/constants'

/** Edit these before Razorpay KYC / public launch. */
export const CONTACT = {
  brand: 'CustomArc',
  email: 'hello@customarc.in',
  grievanceOfficer: 'Founder, CustomArc',
  grievanceEmail: 'grievance@customarc.in',
  responseDays: 48,
  address: 'India',
} as const

export type PolicySection = { heading: string; paragraphs: string[] }

export type PolicyDoc = {
  slug: 'privacy' | 'terms' | 'shipping' | 'refund' | 'contact'
  path: string
  title: string
  metaTitle: string
  lede: string
  updated: string
  sections: PolicySection[]
}

const UPDATED = '22 July 2026'

export const PRIVACY: PolicyDoc = {
  slug: 'privacy',
  path: WEB_PRIVACY,
  title: 'Privacy Policy',
  metaTitle: 'Privacy — CustomArc',
  lede: 'How CustomArc collects, uses, and protects your information.',
  updated: UPDATED,
  sections: [
    {
      heading: 'Who we are',
      paragraphs: [
        `${CONTACT.brand} (“we”, “us”) operates a browser customizer and print-on-demand store for products such as mugs and phone cases. Contact: ${CONTACT.email}.`,
      ],
    },
    {
      heading: 'What we collect',
      paragraphs: [
        'Account: email address and authentication data (magic link / OTP). We do not store card numbers — payments are handled by Razorpay.',
        'Orders: shipping address, product choices, design files, and order status needed to print and deliver.',
        'Designs & uploads: artwork, text, and AI prompts you submit. Generated images and print files are stored to fulfill your order and moderate content.',
        'Usage: basic logs (IP, device, errors) for security, fraud prevention, and reliability.',
      ],
    },
    {
      heading: 'How we use data',
      paragraphs: [
        'To create your account, save designs, process payments, render print files, fulfill orders via print partners, provide support, and enforce our content rules.',
        'AI features send prompts and (where needed) images to third-party model providers under our contracts. Do not submit personal data you do not want processed for generation.',
      ],
    },
    {
      heading: 'Sharing',
      paragraphs: [
        'We share data only as needed: payment processor (Razorpay), print/fulfillment partners, cloud storage and AI providers, email delivery, and when required by law.',
        'We do not sell your personal information.',
      ],
    },
    {
      heading: 'Retention & security',
      paragraphs: [
        'We keep account, order, and design records for as long as needed to fulfill orders, handle disputes, meet legal obligations, and operate the service. Reasonable technical and organizational safeguards apply; no method of transmission is perfectly secure.',
      ],
    },
    {
      heading: 'Your choices',
      paragraphs: [
        `Email ${CONTACT.email} to request access, correction, or deletion where applicable. Some order records may be retained for tax, fraud, or legal reasons.`,
      ],
    },
    {
      heading: 'Children',
      paragraphs: [
        'CustomArc is not directed at children under 18. Do not create an account if you are under 18.',
      ],
    },
    {
      heading: 'Changes',
      paragraphs: [
        'We may update this policy. The “Last updated” date at the top of this page will change when we do. Continued use after an update means you accept the revised policy.',
      ],
    },
  ],
}

export const TERMS: PolicyDoc = {
  slug: 'terms',
  path: WEB_TERMS,
  title: 'Terms of Service',
  metaTitle: 'Terms — CustomArc',
  lede: 'The rules for using CustomArc, ordering products, and submitting designs.',
  updated: UPDATED,
  sections: [
    {
      heading: 'Agreement',
      paragraphs: [
        `By using ${CONTACT.brand} you agree to these Terms and our Privacy Policy. If you do not agree, do not use the service.`,
      ],
    },
    {
      heading: 'The service',
      paragraphs: [
        'CustomArc lets you customize printable products in the browser, optionally generate artwork with AI, pay online, and receive a physical item produced by fulfillment partners. Screen colors are approximate; printed results may vary slightly.',
      ],
    },
    {
      heading: 'Accounts & credits',
      paragraphs: [
        'You must provide a valid email and keep your account secure. Credits for AI generation are non-transferable and have no cash value except where required by law. Unused promotional credits may expire as stated at grant time.',
      ],
    },
    {
      heading: 'Design rights',
      paragraphs: [
        'You retain ownership of original artwork you upload. You grant CustomArc a worldwide, non-exclusive license to store, process, moderate, render, and transmit your designs solely to provide the service and fulfill orders.',
        'For AI-generated images created through CustomArc, you may use the output on products you order from us, subject to the model provider’s terms and these Terms. We do not claim ownership of your prompts or of outputs we generate for your order.',
        'You represent that you have all rights needed for every upload, prompt, and text you submit — including trademarks, likenesses, and third-party IP — and that your content does not infringe others’ rights.',
      ],
    },
    {
      heading: 'Content policy',
      paragraphs: [
        'We prohibit illegal content; hate, harassment, or threats; sexual content involving minors; non-consensual intimate imagery; clear IP theft; and content we reasonably flag as unsafe for print partners.',
        'Automated and human review may block or hold designs and orders. We may refuse service, cancel orders, or remove content that violates this policy. Paid orders held for policy reasons are handled under our Refund Policy.',
      ],
    },
    {
      heading: 'Orders & pricing',
      paragraphs: [
        'Prices are shown at checkout in the stated currency. A contract forms when payment is confirmed by our payment provider. We may cancel and refund if we cannot fulfill (stock, partner, or policy).',
      ],
    },
    {
      heading: 'Disclaimer',
      paragraphs: [
        'The service is provided “as is.” To the fullest extent permitted by law, CustomArc is not liable for indirect, incidental, or consequential damages. Our total liability for any claim relating to an order is limited to the amount you paid for that order.',
      ],
    },
    {
      heading: 'Governing law',
      paragraphs: [
        `These Terms are governed by the laws of India. Consumer protections that cannot be waived still apply. Contact and grievance details are on our Contact page (${WEB_CONTACT}).`,
      ],
    },
  ],
}

export const SHIPPING: PolicyDoc = {
  slug: 'shipping',
  path: WEB_SHIPPING,
  title: 'Shipping Policy',
  metaTitle: 'Shipping — CustomArc',
  lede: 'How print-on-demand orders are produced, shipped, and tracked.',
  updated: UPDATED,
  sections: [
    {
      heading: 'Made to order',
      paragraphs: [
        'Products are printed after payment clears and the design passes our print gate. We do not hold finished stock of your custom design.',
      ],
    },
    {
      heading: 'Production & delivery',
      paragraphs: [
        'Typical production is a few business days after approval, then carrier transit. Combined timelines often fall in roughly 7–21 business days depending on destination, partner load, and customs. These are estimates, not guarantees.',
        'You receive tracking when the fulfillment partner provides a carrier number. International shipments may incur duties or taxes payable by the recipient.',
      ],
    },
    {
      heading: 'Address accuracy',
      paragraphs: [
        'You are responsible for a complete, correct shipping address. Failed delivery due to address errors may require a new paid order or return shipping at your cost.',
      ],
    },
    {
      heading: 'Order lifecycle',
      paragraphs: [
        'Statuses progress roughly: paid → print preparing → submitted to partner → in transit → delivered (or cancelled / held). Holds may occur for moderation, payment review, or partner issues. See Refund Policy for defects and cancellations.',
      ],
    },
    {
      heading: 'Questions',
      paragraphs: [
        `Email ${CONTACT.email} with your order ID. We will check partner status and help resolve delays where we can.`,
      ],
    },
  ],
}

export const REFUND: PolicyDoc = {
  slug: 'refund',
  path: WEB_REFUND,
  title: 'Refund & Return Policy',
  metaTitle: 'Refunds — CustomArc',
  lede: 'When we refund, reprint, or cannot accept returns on custom goods.',
  updated: UPDATED,
  sections: [
    {
      heading: 'Custom goods',
      paragraphs: [
        'Because items are printed to your design, we generally do not accept returns for change of mind, color preference, or sizing once production has started.',
      ],
    },
    {
      heading: 'Before production',
      paragraphs: [
        'If you cancel before we submit the job to a print partner, we will refund the product payment (minus non-refundable fees if any). AI credits already spent on generation are not restored unless we caused the failure.',
      ],
    },
    {
      heading: 'Defects & damage',
      paragraphs: [
        'If the item arrives damaged, misprinted, or materially different from your approved design file, contact us within 7 days of delivery with photos and your order ID. We will offer a reprint or refund at our discretion after review.',
        'Minor variances in color, placement tolerance within print specs, or carrier packaging wear that does not affect the product may not qualify.',
      ],
    },
    {
      heading: 'Policy / moderation holds',
      paragraphs: [
        'If we cannot print because content violates our Terms or partner rules after payment, we will refund the product payment where the order cannot proceed. We may still refuse future orders for repeated violations.',
      ],
    },
    {
      heading: 'How refunds are issued',
      paragraphs: [
        'Approved refunds go back to the original payment method via Razorpay, typically within several business days after approval (bank timing varies).',
      ],
    },
    {
      heading: 'Contact',
      paragraphs: [
        `Email ${CONTACT.email}. For unresolved complaints, see the Grievance Officer on the Contact page.`,
      ],
    },
  ],
}

export const CONTACT_PAGE: PolicyDoc = {
  slug: 'contact',
  path: WEB_CONTACT,
  title: 'Contact',
  metaTitle: 'Contact — CustomArc',
  lede: 'Reach CustomArc for orders, privacy requests, and grievances.',
  updated: UPDATED,
  sections: [
    {
      heading: 'Support',
      paragraphs: [
        `Email: ${CONTACT.email}`,
        `Service area: ${CONTACT.address}`,
        'Include your order ID and a short description. We aim to reply within two business days.',
      ],
    },
    {
      heading: 'Grievance Officer (IT Rules, 2021)',
      paragraphs: [
        `Name / role: ${CONTACT.grievanceOfficer}`,
        `Email: ${CONTACT.grievanceEmail}`,
        `We acknowledge grievances within ${CONTACT.responseDays} hours and aim to resolve them within the timelines expected under applicable Indian intermediary guidelines, where they apply to our service.`,
      ],
    },
    {
      heading: 'Legal pages',
      paragraphs: [
        `Privacy: ${WEB_PRIVACY} · Terms: ${WEB_TERMS} · Shipping: ${WEB_SHIPPING} · Refunds: ${WEB_REFUND}`,
      ],
    },
  ],
}

export const POLICY_DOCS = [PRIVACY, TERMS, SHIPPING, REFUND, CONTACT_PAGE] as const

export function policyBySlug(slug: PolicyDoc['slug']): PolicyDoc {
  const doc = POLICY_DOCS.find((d) => d.slug === slug)
  if (!doc) throw new Error(`Unknown policy: ${slug}`)
  return doc
}
