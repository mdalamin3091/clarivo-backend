import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import ApiError from '../../utils/ApiError';
import sendResponse from '../../utils/sendResponse';
import { AuthenticatedRequest } from '../../middlewares/requireAuth';
import {
  getCustomFields,
  createCustomField,
  updateCustomField,
  deleteCustomField,
} from './custom-field.service';

const getOrgId = (req: Request): string => {
  const orgId = (req as AuthenticatedRequest).session.activeOrganizationId;
  if (!orgId) throw new ApiError(403, 'No active organization');
  return orgId;
};

export const listCustomFields = catchAsync(async (req: Request, res: Response) => {
  const fields = await getCustomFields(getOrgId(req));
  sendResponse(res, { statusCode: 200, success: true, message: 'Custom fields fetched', data: { fields } });
});

export const addCustomField = catchAsync(async (req: Request, res: Response) => {
  const field = await createCustomField(getOrgId(req), req.body);
  sendResponse(res, { statusCode: 201, success: true, message: 'Custom field created', data: { field } });
});

export const editCustomField = catchAsync(async (req: Request, res: Response) => {
  const field = await updateCustomField(getOrgId(req), req.params.id as string, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: 'Custom field updated', data: { field } });
});

export const removeCustomField = catchAsync(async (req: Request, res: Response) => {
  await deleteCustomField(getOrgId(req), req.params.id as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'Custom field deleted', data: null });
});
