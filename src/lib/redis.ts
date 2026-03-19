import Redis from 'ioredis';
import { config } from '../config';
import logger from '../utils/logger';

// Plain options passed to BullMQ Queue and Worker — avoids ioredis version conflicts
// since BullMQ bundles its own ioredis internally
export const redisConnectionOptions = {
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  password: config.REDIS_PASSWORD,
  maxRetriesPerRequest: null as null, // required by BullMQ
  enableReadyCheck: false,            // required by BullMQ
};

// ioredis instance for direct usage (health checks, graceful shutdown, Bull Board)
export const redis = new Redis(redisConnectionOptions);

redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (err) => logger.error('Redis error:', err));
