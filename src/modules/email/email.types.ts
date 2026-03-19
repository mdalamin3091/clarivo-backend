export type InvitationEmailPayload = {
  type: 'send-invitation';
  to: string;
  inviterName: string;
  orgName: string;
  role: string;
  inviteUrl: string;
  expiresAt: Date;
};

export type VerificationEmailPayload = {
  type: 'send-verification';
  to: string;
  userName: string;
  verificationUrl: string;
};

export type PasswordResetEmailPayload = {
  type: 'send-password-reset';
  to: string;
  userName: string;
  resetUrl: string;
  expiresAt: Date;
};

export type EmailJobPayload =
  | InvitationEmailPayload
  | VerificationEmailPayload
  | PasswordResetEmailPayload;
