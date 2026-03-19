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

interface PasswordResetEmailProps {
  userName: string;
  resetUrl: string;
  expiresAt: Date;
}

export function PasswordResetEmail({ userName, resetUrl, expiresAt }: PasswordResetEmailProps) {
  const formattedExpiry = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(expiresAt);

  return (
    <Html>
      <Head />
      <Preview>Reset your Clarivo password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Reset your password</Heading>

          <Text style={paragraph}>Hi {userName},</Text>
          <Text style={paragraph}>
            We received a request to reset the password for your Clarivo account.
            Click the button below to choose a new password.
          </Text>

          <Section style={buttonSection}>
            <Button style={button} href={resetUrl}>
              Reset Password
            </Button>
          </Section>

          <Text style={muted}>This link expires on {formattedExpiry}.</Text>

          <Hr style={hr} />

          <Text style={footer}>
            If you didn&apos;t request a password reset, you can safely ignore this email.
            Your password will not be changed.
            <br />
            If the button doesn&apos;t work, copy and paste this link:
            <br />
            <span style={link}>{resetUrl}</span>
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
