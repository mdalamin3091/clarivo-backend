import { Queue } from 'bullmq';
import { redisConnectionOptions } from './redis';
import type { EmailJobPayload } from '../modules/email/email.types';

const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential' as const,
    delay: 5000, // 5s → 10s → 20s
  },
  removeOnComplete: { count: 100 },
  removeOnFail: { count: 500 },
};

// Third generic (string) locks the job name type to plain string,
// preventing BullMQ from inferring names from the payload discriminator union
export const emailQueue = new Queue<EmailJobPayload, void, string>('email', {
  connection: redisConnectionOptions,
  defaultJobOptions,
});
