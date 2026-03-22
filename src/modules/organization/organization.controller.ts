import { Request, Response } from 'express';

import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { SetupOrganizationBody } from './organization.validation';
import { setupOrganization } from './organization.service';

export const setup = catchAsync(async (req: Request, res: Response) => {
  const organization = await setupOrganization(req, req.body as SetupOrganizationBody);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Organization created successfully',
    data: { organization },
  });
});
