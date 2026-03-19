import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface InvitationEmailProps {
  inviterName: string;
  orgName: string;
  role: string;
  inviteUrl: string;
  expiresAt: Date;
}

export function InvitationEmail({
  inviterName,
  orgName,
  role,
  inviteUrl,
  expiresAt,
}: InvitationEmailProps) {
  const formattedExpiry = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(expiresAt);

  const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <Html>
      <Head />
      <Preview>
        {inviterName} invited you to join {orgName} on Clarivo
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>You&apos;re invited to join {orgName}</Heading>

          <Text style={paragraph}>
            <strong>{inviterName}</strong> has invited you to join{' '}
            <strong>{orgName}</strong> as a <strong>{capitalizedRole}</strong> on Clarivo.
          </Text>

          <Section style={buttonSection}>
            <Button style={button} href={inviteUrl}>
              Accept Invitation
            </Button>
          </Section>

          <Text style={muted}>This invitation expires on {formattedExpiry}.</Text>

          <Hr style={hr} />

          <Text style={footer}>
            If you weren&apos;t expecting this invitation, you can ignore this email.
            <br />
            If the button above doesn&apos;t work, copy and paste this link:
            <br />
            <span style={link}>{inviteUrl}</span>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main: React.CSSProperties = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  padding: '40px',
  borderRadius: '8px',
  maxWidth: '560px',
  border: '1px solid #e6ebf1',
};

const heading: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: '700',
  color: '#1a1a1a',
  marginBottom: '16px',
};

const paragraph: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#374151',
};

const buttonSection: React.CSSProperties = {
  margin: '28px 0',
};

const button: React.CSSProperties = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600',
  padding: '12px 24px',
  textDecoration: 'none',
  display: 'inline-block',
};

const muted: React.CSSProperties = {
  fontSize: '13px',
  color: '#6b7280',
};

const hr: React.CSSProperties = {
  borderColor: '#e6ebf1',
  margin: '24px 0',
};

const footer: React.CSSProperties = {
  fontSize: '12px',
  color: '#9ca3af',
  lineHeight: '1.6',
};

const link: React.CSSProperties = {
  color: '#2563eb',
  wordBreak: 'break-all',
};
