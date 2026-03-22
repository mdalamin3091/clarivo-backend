import { Request, Response } from 'express';

import catchAsync from '../../utils/catchAsync';
import ApiError from '../../utils/ApiError';
import sendResponse from '../../utils/sendResponse';
import { checkSlugSchema, SetupOrganizationBody } from './organization.validation';
import { checkSlugAvailability, createOrganizationService } from './organization.service';

export const checkSlug = catchAsync(async (req: Request, res: Response) => {
  const result = checkSlugSchema.safeParse(req.query);
  if (!result.success) {
    throw new ApiError(400, result.error.issues[0].message);
  }

  const available = await checkSlugAvailability(result.data.slug);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: available ? 'Slug is available' : 'Slug is already taken',
    data: { available },
  });
});

export const createOrganization = catchAsync(async (req: Request, res: Response) => {
  const organization = await createOrganizationService(req, req.body as SetupOrganizationBody);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Organization created successfully',
    data: { organization },
  });
});
