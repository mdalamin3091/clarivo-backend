import winston from 'winston';
import { config } from '../config';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf((info) => {
  const level = info['level'] as string;
  const message = info['message'] as string;
  const ts = info['timestamp'] as string | undefined;
  const stack = info['stack'] as string | undefined;
  return `${ts} [${level}]: ${stack ?? message}`;
});

const logger = winston.createLogger({
  level: config.NODE_ENV === 'production' ? 'warn' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    config.NODE_ENV !== 'production' ? colorize() : winston.format.uncolorize(),
    logFormat,
  ),
  transports: [
    new winston.transports.Console(),
    ...(config.NODE_ENV === 'production'
      ? [
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' }),
        ]
      : []),
  ],
});

export default logger;
