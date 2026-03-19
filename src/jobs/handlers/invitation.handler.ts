import { sendEmail } from '../../modules/email/email.service';
import { renderInvitationEmail } from '../../modules/email/email.templates';
import type { InvitationEmailPayload } from '../../modules/email/email.types';

export async function handleInvitationEmail(payload: InvitationEmailPayload): Promise<void> {
  const html = await renderInvitationEmail({
    inviterName: payload.inviterName,
    orgName: payload.orgName,
    role: payload.role,
    inviteUrl: payload.inviteUrl,
    expiresAt: payload.expiresAt,
  });

  await sendEmail({
    to: payload.to,
    subject: `You're invited to join ${payload.orgName} on Clarivo`,
    html,
  });
}
