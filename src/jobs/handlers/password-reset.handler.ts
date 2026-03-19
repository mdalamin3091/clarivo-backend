import { sendEmail } from '../../modules/email/email.service';
import { renderPasswordResetEmail } from '../../modules/email/email.templates';
import type { PasswordResetEmailPayload } from '../../modules/email/email.types';

export async function handlePasswordResetEmail(
  payload: PasswordResetEmailPayload,
): Promise<void> {
  const html = await renderPasswordResetEmail({
    userName: payload.userName,
    resetUrl: payload.resetUrl,
    expiresAt: payload.expiresAt,
  });

  await sendEmail({
    to: payload.to,
    subject: 'Reset your Clarivo password',
    html,
  });
}
