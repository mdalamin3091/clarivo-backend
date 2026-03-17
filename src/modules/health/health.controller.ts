import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';

export const healthCheck = (_req: Request, res: Response): void => {
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Server is running',
    data: { timestamp: new Date().toISOString() },
  });
};
