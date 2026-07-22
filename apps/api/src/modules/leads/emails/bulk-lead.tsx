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

export type BulkLeadEmailProps = {
  leadId: string
  email: string
  note: string
}

export function BulkLeadEmail({ leadId, email, note }: BulkLeadEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>New bulk order inquiry from {email}</Preview>
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
            Bulk order inquiry
          </Heading>
          <Text style={{ fontSize: '15px', lineHeight: '1.6', color: '#5c4a4e', margin: '0 0 16px' }}>
            A visitor submitted the bulk lead form. Reply to their email to continue.
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
              <strong>Lead:</strong> {leadId}
            </Text>
            <Text style={{ margin: '0 0 8px', fontSize: '13px', color: '#5c4a4e' }}>
              <strong>Email:</strong> {email}
            </Text>
            <Hr style={{ borderColor: '#e8dce0', margin: '12px 0' }} />
            <Text style={{ margin: '0 0 8px', fontSize: '13px', color: '#5c4a4e' }}>
              <strong>Note</strong>
            </Text>
            <Text style={{ margin: 0, fontSize: '14px', lineHeight: '1.55', color: '#1a1214', whiteSpace: 'pre-wrap' }}>
              {note}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export function bulkLeadText(props: BulkLeadEmailProps): string {
  return [
    'Bulk order inquiry',
    `Lead: ${props.leadId}`,
    `Email: ${props.email}`,
    '',
    'Note:',
    props.note,
  ].join('\n')
}
