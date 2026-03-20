import { config } from './config'; // must be first — ensures dotenv is loaded
import path from 'path';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { toNodeHandler } from 'better-auth/node';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';

import { auth } from './lib/auth';
import { emailQueue } from './lib/queue';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';

const app: Application = express();

// Bull Board — queue monitoring UI (development only)
if (config.NODE_ENV === 'development') {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');
  createBullBoard({
    queues: [new BullMQAdapter(emailQueue)],
    serverAdapter,
  });
  app.use('/admin/queues', serverAdapter.getRouter());
}

// 1. CORS — must be before all handlers, credentials required for auth cookies
app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// 2. Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

// 3. better-auth handler — MUST come before express.json()
app.all('/api/auth/*splat', toNodeHandler(auth));

// 4. Body parsing — AFTER better-auth handler
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// 5. Static files — serve uploaded images before API routes
app.use(
  '/uploads',
  express.static(path.join(process.cwd(), 'uploads')),
);

// 6. API routes
app.use('/api/v1', routes);

// 6. 404 & error handlers
app.use(notFound);
app.use(errorHandler);

export default app;
