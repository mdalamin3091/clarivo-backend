import { render } from '@react-email/render';
import * as React from 'react';
import { InvitationEmail } from './templates/InvitationEmail';
import { VerificationEmail } from './templates/VerificationEmail';
import { PasswordResetEmail } from './templates/PasswordResetEmail';

// @react-email/render v2 is async — must await render()
export async function renderInvitationEmail(props: {
  inviterName: string;
  orgName: string;
  role: string;
  inviteUrl: string;
  expiresAt: Date;
}): Promise<string> {
  return await render(React.createElement(InvitationEmail, props));
}

export async function renderVerificationEmail(props: {
  userName: string;
  verificationUrl: string;
}): Promise<string> {
  return await render(React.createElement(VerificationEmail, props));
}

export async function renderPasswordResetEmail(props: {
  userName: string;
  resetUrl: string;
  expiresAt: Date;
}): Promise<string> {
  return await render(React.createElement(PasswordResetEmail, props));
}
