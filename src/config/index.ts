import dotenv from 'dotenv';

dotenv.config();

export const config = {
  NODE_ENV: process.env['NODE_ENV'] ?? 'development',
  PORT: parseInt(process.env['PORT'] ?? '5000', 10),
  DATABASE_URL: process.env['DATABASE_URL'] ?? '',
  BETTER_AUTH_SECRET: process.env['BETTER_AUTH_SECRET'] ?? '',
  BETTER_AUTH_URL: process.env['BETTER_AUTH_URL'] ?? 'http://localhost:5000',
  FRONTEND_URL: process.env['FRONTEND_URL'] ?? 'http://localhost:3000',
  GOOGLE_CLIENT_ID: process.env['GOOGLE_CLIENT_ID'] ?? '',
  GOOGLE_CLIENT_SECRET: process.env['GOOGLE_CLIENT_SECRET'] ?? '',
} as const;
