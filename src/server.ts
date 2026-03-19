import { config } from './config'; // must be first — loads dotenv before any other module
import app from './app';
import { prisma } from './lib/prisma';
import { redis } from './lib/redis';
import { startWorkers, stopWorkers } from './jobs';
import logger from './utils/logger';

// Start BullMQ workers
startWorkers();

const server = app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT} in ${config.NODE_ENV} mode`);
});

async function shutdown(signal: string) {
  logger.info(`${signal} received. Shutting down gracefully...`);

  server.close(async () => {
    await stopWorkers();
    await redis.quit();
    await prisma.$disconnect();
    logger.info('Server closed');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled rejection:', err);
  process.exit(1);
});
