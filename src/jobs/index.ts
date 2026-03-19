import { type Worker } from 'bullmq';
import { createEmailWorker } from './workers/email.worker';
import logger from '../utils/logger';

let emailWorker: Worker | null = null;

export function startWorkers(): void {
  emailWorker = createEmailWorker();
  logger.info('Email worker started');
}

export async function stopWorkers(): Promise<void> {
  if (emailWorker) {
    await emailWorker.close();
    logger.info('Email worker stopped');
  }
}
