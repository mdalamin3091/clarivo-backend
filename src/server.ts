import app from './app';
import { config } from './config';
import { prisma } from './lib/prisma';
import logger from './utils/logger';

const server = app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT} in ${config.NODE_ENV} mode`);
});

async function shutdown(signal: string) {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(async () => {
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
