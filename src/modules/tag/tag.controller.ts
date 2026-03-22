import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import ApiError from '../../utils/ApiError';
import sendResponse from '../../utils/sendResponse';
import { AuthenticatedRequest } from '../../middlewares/requireAuth';
import { getTags, createTag, updateTag, deleteTag } from './tag.service';

const getOrgId = (req: Request): string => {
  const orgId = (req as AuthenticatedRequest).session.activeOrganizationId;
  if (!orgId) throw new ApiError(403, 'No active organization');
  return orgId;
};

export const listTags = catchAsync(async (req: Request, res: Response) => {
  const tags = await getTags(getOrgId(req));
  sendResponse(res, { statusCode: 200, success: true, message: 'Tags fetched', data: { tags } });
});

export const addTag = catchAsync(async (req: Request, res: Response) => {
  const tag = await createTag(getOrgId(req), req.body);
  sendResponse(res, { statusCode: 201, success: true, message: 'Tag created', data: { tag } });
});

export const editTag = catchAsync(async (req: Request, res: Response) => {
  const tag = await updateTag(getOrgId(req), req.params.id as string, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: 'Tag updated', data: { tag } });
});

export const removeTag = catchAsync(async (req: Request, res: Response) => {
  await deleteTag(getOrgId(req), req.params.id as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'Tag deleted', data: null });
});
