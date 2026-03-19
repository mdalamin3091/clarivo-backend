import { sendEmail } from '../../modules/email/email.service';
import { renderVerificationEmail } from '../../modules/email/email.templates';
import type { VerificationEmailPayload } from '../../modules/email/email.types';

export async function handleVerificationEmail(payload: VerificationEmailPayload): Promise<void> {
  const html = await renderVerificationEmail({
    userName: payload.userName,
    verificationUrl: payload.verificationUrl,
  });

  await sendEmail({
    to: payload.to,
    subject: 'Verify your Clarivo email address',
    html,
  });
}
