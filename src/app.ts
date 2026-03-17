import { config } from './config'; // must be first — ensures dotenv is loaded
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { toNodeHandler } from 'better-auth/node';

import { auth } from './lib/auth';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';

const app: Application = express();

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

// 5. API routes
app.use('/api/v1', routes);

// 6. 404 & error handlers
app.use(notFound);
app.use(errorHandler);

export default app;
