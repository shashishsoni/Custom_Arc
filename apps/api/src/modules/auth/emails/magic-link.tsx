import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'react-email'

type MagicLinkEmailProps = {
  url: string
}

export function MagicLinkEmail({ url }: MagicLinkEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Your sign-in link for CustomArc — expires soon.</Preview>
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
              Sign in to CustomArc
            </Heading>
            <Text
              style={{
                margin: '0 0 28px',
                fontSize: '15px',
                lineHeight: '24px',
                color: '#7a6e76',
              }}
            >
              Click the button below to finish signing in. This link expires in about 10
              minutes.
            </Text>
            <Button
              href={url}
              style={{
                display: 'inline-block',
                backgroundColor: '#c45c6a',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: 600,
                textDecoration: 'none',
                textAlign: 'center',
                padding: '14px 28px',
                borderRadius: '4px',
                lineHeight: '20px',
              }}
            >
              Sign in
            </Button>
            <Text
              style={{
                margin: '28px 0 0',
                fontSize: '13px',
                lineHeight: '20px',
                color: '#7a6e76',
              }}
            >
              Button not working? Paste this into your browser:
            </Text>
            <Text
              style={{
                margin: '8px 0 0',
                fontSize: '12px',
                lineHeight: '18px',
                wordBreak: 'break-all',
                color: '#3d3440',
              }}
            >
              <Link href={url} style={{ color: '#c45c6a' }}>
                {url}
              </Link>
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

export function magicLinkText(url: string): string {
  return [
    'Sign in to CustomArc',
    '',
    'Open this link to finish signing in (expires in about 10 minutes):',
    url,
    '',
    'If you did not request this, ignore this email.',
  ].join('\n')
}
