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

type OtpEmailProps = {
  otp: string
}

export function OtpEmail({ otp }: OtpEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{`Your CustomArc code is ${otp} — expires soon.`}</Preview>
      <Body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: '#fbf7f8',
          fontFamily:
            'Outfit, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        <Container
          style={{
            margin: '0 auto',
            padding: '40px 20px',
            maxWidth: '520px',
          }}
        >
          <Section style={{ textAlign: 'center', marginBottom: '28px' }}>
            <Text
              style={{
                margin: 0,
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: '#c45c6a',
              }}
            >
              CustomArc
            </Text>
            <Text
              style={{
                margin: '6px 0 0',
                fontSize: '12px',
                fontWeight: 400,
                color: '#7a6e76',
                letterSpacing: '0.02em',
              }}
            >
              the arc of customization
            </Text>
          </Section>

          <Section
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e8d5d9',
              borderRadius: '4px',
              padding: '36px 32px',
            }}
          >
            <Heading
              as="h1"
              style={{
                margin: '0 0 12px',
                fontSize: '22px',
                fontWeight: 600,
                lineHeight: '28px',
                color: '#3d3440',
                letterSpacing: '-0.02em',
              }}
            >
              Your sign-in code
            </Heading>
            <Text
              style={{
                margin: '0 0 28px',
                fontSize: '15px',
                lineHeight: '24px',
                color: '#7a6e76',
              }}
            >
              Enter this one-time code to continue. It expires in about 10 minutes.
            </Text>
            <Text
              style={{
                margin: 0,
                padding: '20px 16px',
                backgroundColor: '#fbf7f8',
                border: '1px solid #e8d5d9',
                borderRadius: '4px',
                textAlign: 'center',
                fontSize: '32px',
                fontWeight: 700,
                letterSpacing: '0.35em',
                color: '#3d3440',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {otp}
            </Text>
            <Text
              style={{
                margin: '28px 0 0',
                fontSize: '13px',
                lineHeight: '20px',
                color: '#7a6e76',
              }}
            >
              Never share this code. CustomArc will never ask for it by phone or chat.
            </Text>
          </Section>

          <Hr
            style={{
              borderColor: '#e8d5d9',
              borderTop: '1px solid #e8d5d9',
              margin: '28px 0 16px',
            }}
          />
          <Text
            style={{
              margin: 0,
              fontSize: '12px',
              lineHeight: '18px',
              color: '#7a6e76',
              textAlign: 'center',
            }}
          >
            You received this because someone used this address with CustomArc.
            If that was not you, you can ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export function otpText(otp: string): string {
  return [
    'Your CustomArc sign-in code',
    '',
    otp,
    '',
    'Enter this code to continue. It expires in about 10 minutes.',
    'If you did not request this, ignore this email.',
  ].join('\n')
}
