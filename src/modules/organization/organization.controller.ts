import { Request, Response } from 'express';

import catchAsync from '../../utils/catchAsync';
import ApiError from '../../utils/ApiError';
import sendResponse from '../../utils/sendResponse';
import { checkNameSchema } from './organization.validation';
import { SetupOrganizationBody } from './organization.validation';
import { checkNameAvailability, setupOrganization } from './organization.service';

export const checkName = catchAsync(async (req: Request, res: Response) => {
  const result = checkNameSchema.safeParse(req.query);
  if (!result.success) {
    throw new ApiError(400, result.error.issues[0].message);
  }

  const available = await checkNameAvailability(result.data.name);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: available ? 'Name is available' : 'Name is already taken',
    data: { available },
  });
});

export const setup = catchAsync(async (req: Request, res: Response) => {
  // Body already validated by validate(setupOrganizationSchema) middleware
  const organization = await setupOrganization(req, req.body as SetupOrganizationBody);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Organization created successfully',
    data: { organization },
  });
});
