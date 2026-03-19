import { Resend } from 'resend';
import { config } from '../../config';
import logger from '../../utils/logger';

const resend = new Resend(config.RESEND_API_KEY);

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  const { error } = await resend.emails.send({
    from: config.EMAIL_FROM,
    to,
    subject,
    html,
  });

  if (error) {
    logger.error('Resend delivery error:', error);
    throw new Error(`Email delivery failed: ${error.message}`);
  }

  logger.info(`Email sent to ${to} — subject: "${subject}"`); 
}