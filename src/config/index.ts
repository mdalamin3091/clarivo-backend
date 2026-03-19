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
  // Redis
  REDIS_HOST: process.env['REDIS_HOST'] ?? 'localhost',
  REDIS_PORT: parseInt(process.env['REDIS_PORT'] ?? '6379', 10),
  REDIS_PASSWORD: process.env['REDIS_PASSWORD'] ?? undefined,
  // Email (Resend)
  RESEND_API_KEY: process.env['RESEND_API_KEY'] ?? '',
  EMAIL_FROM: process.env['EMAIL_FROM'] ?? 'Clarivo <onboarding@resend.dev>',
} as const;
