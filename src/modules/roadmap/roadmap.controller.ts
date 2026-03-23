import { Request, Response } from 'express';
import catchAsync            from '../../utils/catchAsync';
import sendResponse          from '../../utils/sendResponse';
import { AuthenticatedRequest } from '../../middlewares/requireAuth';
import * as service          from './roadmap.service';

const getOrgId = (req: Request): string => {
  const orgId = (req as AuthenticatedRequest).session.activeOrganizationId;
  if (!orgId) throw new Error('No active organization');
  return orgId;
};

export const listRoadmaps = catchAsync(async (req: Request, res: Response) => {
  const roadmaps = await service.getRoadmaps(getOrgId(req));
  sendResponse(res, { statusCode: 200, success: true, message: 'Roadmaps fetched', data: { roadmaps } });
});

export const getOneRoadmap = catchAsync(async (req: Request, res: Response) => {
  const roadmap = await service.getRoadmap(getOrgId(req), req.params.id as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'Roadmap fetched', data: { roadmap } });
});

export const addRoadmap = catchAsync(async (req: Request, res: Response) => {
  const roadmap = await service.createRoadmap(getOrgId(req), req.body);
  sendResponse(res, { statusCode: 201, success: true, message: 'Roadmap created', data: { roadmap } });
});

export const editRoadmap = catchAsync(async (req: Request, res: Response) => {
  const roadmap = await service.updateRoadmap(getOrgId(req), req.params.id as string, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: 'Roadmap updated', data: { roadmap } });
});

export const removeRoadmap = catchAsync(async (req: Request, res: Response) => {
  await service.deleteRoadmap(getOrgId(req), req.params.id as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'Roadmap deleted', data: null });
});

export const reorderRoadmapsCtrl = catchAsync(async (req: Request, res: Response) => {
  const roadmaps = await service.reorderRoadmaps(getOrgId(req), req.body);
  sendResponse(res, { statusCode: 200, success: true, message: 'Roadmaps reordered', data: { roadmaps } });
});

// ── Column controllers ─────────────────────────────────────────────────────────

export const addColumn = catchAsync(async (req: Request, res: Response) => {
  const roadmap = await service.createColumn(getOrgId(req), req.params.roadmapId as string);
  sendResponse(res, { statusCode: 201, success: true, message: 'Column created', data: { roadmap } });
});

export const editColumn = catchAsync(async (req: Request, res: Response) => {
  const roadmap = await service.updateColumn(
    getOrgId(req),
    req.params.roadmapId as string,
    req.params.columnId  as string,
    req.body,
  );
  sendResponse(res, { statusCode: 200, success: true, message: 'Column updated', data: { roadmap } });
});

export const removeColumn = catchAsync(async (req: Request, res: Response) => {
  const roadmap = await service.deleteColumn(
    getOrgId(req),
    req.params.roadmapId as string,
    req.params.columnId  as string,
  );
  sendResponse(res, { statusCode: 200, success: true, message: 'Column deleted', data: { roadmap } });
});

export const reorderRoadmapColumns = catchAsync(async (req: Request, res: Response) => {
  const roadmap = await service.reorderColumns(
    getOrgId(req),
    req.params.roadmapId as string,
    req.body,
  );
  sendResponse(res, { statusCode: 200, success: true, message: 'Columns reordered', data: { roadmap } });
});
