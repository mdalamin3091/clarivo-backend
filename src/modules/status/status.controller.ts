import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import ApiError from '../../utils/ApiError';
import sendResponse from '../../utils/sendResponse';
import { AuthenticatedRequest } from '../../middlewares/requireAuth';
import {
  getStatuses,
  createStatus,
  updateStatus,
  deleteStatus,
  setDefaultStatus,
} from './status.service';

const getOrgId = (req: Request): string => {
  const orgId = (req as AuthenticatedRequest).session.activeOrganizationId;
  if (!orgId) throw new ApiError(403, 'No active organization');
  return orgId;
};

export const listStatuses = catchAsync(async (req: Request, res: Response) => {
  const statuses = await getStatuses(getOrgId(req));
  sendResponse(res, { statusCode: 200, success: true, message: 'Statuses fetched', data: { statuses } });
});

export const addStatus = catchAsync(async (req: Request, res: Response) => {
  const status = await createStatus(getOrgId(req), req.body);
  sendResponse(res, { statusCode: 201, success: true, message: 'Status created', data: { status } });
});

export const editStatus = catchAsync(async (req: Request, res: Response) => {
  const status = await updateStatus(getOrgId(req), req.params.id as string, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: 'Status updated', data: { status } });
});

export const removeStatus = catchAsync(async (req: Request, res: Response) => {
  await deleteStatus(getOrgId(req), req.params.id as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'Status deleted', data: null });
});

export const makeDefault = catchAsync(async (req: Request, res: Response) => {
  const status = await setDefaultStatus(getOrgId(req), req.params.id as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'Default status updated', data: { status } });
});
