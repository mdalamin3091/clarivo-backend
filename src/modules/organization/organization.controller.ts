import { Request, Response } from 'express';

import catchAsync from '../../utils/catchAsync';
import ApiError from '../../utils/ApiError';
import sendResponse from '../../utils/sendResponse';
import { checkNameSchema, SetupOrganizationBody } from './organization.validation';
import {
  checkNameAvailability,
  setupOrganization,
  updateOrgBranding,
  replacePortalMenus,
} from './organization.service';
import { AuthenticatedRequest } from '../../middlewares/requireAuth';

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
  const organization = await setupOrganization(req, req.body as SetupOrganizationBody);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Organization created successfully',
    data: { organization },
  });
});

export const updateBranding = catchAsync(async (req: Request, res: Response) => {
  const orgId = (req as AuthenticatedRequest).session.activeOrganizationId;
  if (!orgId) throw new ApiError(403, 'No active organization');

  const branding = await updateOrgBranding(orgId, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: 'Branding updated', data: branding });
});

export const updatePortalMenus = catchAsync(async (req: Request, res: Response) => {
  const orgId = (req as AuthenticatedRequest).session.activeOrganizationId;
  if (!orgId) throw new ApiError(403, 'No active organization');

  const data = await replacePortalMenus(orgId, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: 'Portal menus updated', data });
});
