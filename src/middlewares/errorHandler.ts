import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '../generated/client';
import handleZodError from '../errors/handleZodError';
import parsePrismaValidationError from '../errors/parsePrismaValidationError';

export interface AppError extends Error {
  statusCode?: number;
}

const isDev = process.env['NODE_ENV'] === 'development';

const handlePrismaKnownError = (
  err: Prisma.PrismaClientKnownRequestError,
): { status: number; message: string } => {
  switch (err.code) {
    case 'P2002': {
      const fields = (err.meta?.['target'] as string[])?.join(', ') ?? 'field';
      return { status: 409, message: `A record with this ${fields} already exists.` };
    }
    case 'P2025':
      return { status: 404, message: (err.meta?.['cause'] as string) ?? 'Record not found.' };
    case 'P2003': {
      const field = (err.meta?.['field_name'] as string) ?? 'field';
      return { status: 400, message: `Related record not found for ${field}.` };
    }
    case 'P2014':
      return { status: 400, message: 'The change violates a required relation.' };
    case 'P2000': {
      const field = (err.meta?.['column_name'] as string) ?? 'field';
      return { status: 400, message: `Value too long for field: ${field}.` };
    }
    case 'P2001':
      return { status: 404, message: 'The record searched does not exist.' };
    case 'P2004':
      return { status: 400, message: 'A database constraint was violated.' };
    default:
      return { status: 400, message: `Database error. [${err.code}]` };
  }
};

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Zod validation errors
  if (err instanceof ZodError) {
    const { statusCode, message, errorSources } = handleZodError(err);
    res.status(statusCode).json({ success: false, message, errorSources });
    return;
  }

  // Prisma known request errors (constraint violations, not found, etc.)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const { status, message } = handlePrismaKnownError(err);
    res.status(status).json({
      success: false,
      message,
      ...(isDev && { code: err.code, meta: err.meta }),
    });
    return;
  }

  // Prisma validation errors (invalid query shape, missing required fields)
  if (err instanceof Prisma.PrismaClientValidationError) {
    const detail = parsePrismaValidationError(err.message);
    res.status(400).json({
      success: false,
      message: 'Invalid data provided.',
      ...(isDev && { detail: detail || err.message }),
    });
    return;
  }

  // Prisma initialization errors (bad connection string, unreachable DB)
  if (err instanceof Prisma.PrismaClientInitializationError) {
    res.status(503).json({
      success: false,
      message: 'Database connection failed.',
      ...(isDev && { detail: err.message }),
    });
    return;
  }

  // Prisma unknown request errors
  if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    res.status(500).json({
      success: false,
      message: 'An unexpected database error occurred.',
      ...(isDev && { detail: err.message }),
    });
    return;
  }

  // Generic application errors
  const statusCode = err.statusCode ?? 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(isDev && { stack: err.stack }),
  });
};
