import { Worker, type Job } from 'bullmq';
import { redisConnectionOptions } from '../../lib/redis';
import type { EmailJobPayload } from '../../modules/email/email.types';
import { handleInvitationEmail } from '../handlers/invitation.handler';
import { handleVerificationEmail } from '../handlers/verification.handler';
import { handlePasswordResetEmail } from '../handlers/password-reset.handler';
import logger from '../../utils/logger';

async function processEmailJob(job: Job<EmailJobPayload>): Promise<void> {
  const { data } = job;

  logger.info(`Processing email job [${job.id}] type: ${data.type}`);

  switch (data.type) {
    case 'send-invitation':
      await handleInvitationEmail(data);
      break;
    case 'send-verification':
      await handleVerificationEmail(data);
      break;
    case 'send-password-reset':
      await handlePasswordResetEmail(data);
      break;
    default: {
      const exhaustiveCheck: never = data;
      logger.warn(`Unknown email job type: ${(exhaustiveCheck as EmailJobPayload).type}`);
    }
  }

  logger.info(`Email job [${job.id}] completed — type: ${data.type}`);
}

export function createEmailWorker(): Worker<EmailJobPayload, void, string> {
  const worker = new Worker<EmailJobPayload, void, string>('email', processEmailJob, {
    connection: redisConnectionOptions,
    concurrency: 5, // process up to 5 email jobs in parallel
  });

  worker.on('failed', (job, err) => {
    logger.error(`Email job [${job?.id}] failed (attempt ${job?.attemptsMade}):`, err.message);
  });

  worker.on('error', (err) => {
    logger.error('Email worker error:', err);
  });

  return worker;
}
