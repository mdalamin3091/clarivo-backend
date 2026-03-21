import { Request, Response } from 'express';
import path from 'path';
import catchAsync from '../../utils/catchAsync';
import ApiError from '../../utils/ApiError';
import sendResponse from '../../utils/sendResponse';
import { config } from '../../config';

export const uploadImage = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded');
  }

  const type    = (req.query.type as string) === 'social' ? 'social' : 'logos';
  const fileUrl = `${config.BACKEND_URL}/uploads/${type}/${path.basename(req.file.path)}`;

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'File uploaded successfully',
    data: { url: fileUrl },
  });
});
