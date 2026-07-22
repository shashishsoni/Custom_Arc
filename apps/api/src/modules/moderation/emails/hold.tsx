import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'react-email'

export type HoldEmailProps = {
  designId: string
  orderId?: string
  reasons: string[]
}

export function ModerationHoldEmail({ designId, orderId, reasons }: HoldEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Moderation hold — design needs review before print</Preview>
      <Body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: '#fbf7f8',
          fontFamily:
            'Outfit, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        <Container style={{ margin: '0 auto', padding: '40px 20px', maxWidth: '520px' }}>
          <Heading
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: '28px',
              fontWeight: 600,
              color: '#1a1214',
              margin: '0 0 12px',
            }}
          >
            Moderation hold
          </Heading>
          <Text style={{ fontSize: '15px', lineHeight: '1.6', color: '#5c4a4e', margin: '0 0 16px' }}>
            A design is held before print. Review the flag in the API, then approve or block.
          </Text>
          <Section
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e8dce0',
              borderRadius: '4px',
              padding: '16px 20px',
            }}
          >
            <Text style={{ margin: '0 0 8px', fontSize: '13px', color: '#5c4a4e' }}>
              <strong>Design:</strong> {designId}
            </Text>
            {orderId ? (
              <Text style={{ margin: '0 0 8px', fontSize: '13px', color: '#5c4a4e' }}>
                <strong>Order:</strong> {orderId}
              </Text>
            ) : null}
            <Hr style={{ borderColor: '#e8dce0', margin: '12px 0' }} />
            <Text style={{ margin: 0, fontSize: '13px', color: '#5c4a4e' }}>
              <strong>Reasons</strong>
            </Text>
            {reasons.map((r) => (
              <Text key={r} style={{ margin: '4px 0 0', fontSize: '13px', color: '#1a1214' }}>
                · {r}
              </Text>
            ))}
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export function moderationHoldText(props: HoldEmailProps): string {
  const lines = [
    'Moderation hold — review before print',
    `Design: ${props.designId}`,
    props.orderId ? `Order: ${props.orderId}` : null,
    'Reasons:',
    ...props.reasons.map((r) => `- ${r}`),
  ]
  return lines.filter(Boolean).join('\n')
}
