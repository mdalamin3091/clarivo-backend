import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import ApiError from '../../utils/ApiError';
import sendResponse from '../../utils/sendResponse';
import { AuthenticatedRequest } from '../../middlewares/requireAuth';
import {
  getBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
} from './board.service';

const getOrgId = (req: Request): string => {
  const orgId = (req as AuthenticatedRequest).session.activeOrganizationId;
  if (!orgId) throw new ApiError(403, 'No active organization');
  return orgId;
};

export const listBoards = catchAsync(async (req: Request, res: Response) => {
  const boards = await getBoards(getOrgId(req));
  sendResponse(res, { statusCode: 200, success: true, message: 'Boards fetched', data: { boards } });
});

export const fetchBoard = catchAsync(async (req: Request, res: Response) => {
  const board = await getBoard(getOrgId(req), req.params.id as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'Board fetched', data: { board } });
});

export const addBoard = catchAsync(async (req: Request, res: Response) => {
  const board = await createBoard(getOrgId(req), req.body);
  sendResponse(res, { statusCode: 201, success: true, message: 'Board created', data: { board } });
});

export const editBoard = catchAsync(async (req: Request, res: Response) => {
  const board = await updateBoard(getOrgId(req), req.params.id as string, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: 'Board updated', data: { board } });
});

export const removeBoard = catchAsync(async (req: Request, res: Response) => {
  await deleteBoard(getOrgId(req), req.params.id as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'Board deleted', data: null });
});
