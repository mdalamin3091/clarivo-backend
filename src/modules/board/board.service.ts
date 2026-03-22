import { prisma } from '../../lib/prisma';
import ApiError from '../../utils/ApiError';
import { Prisma } from '../../generated/client';
import { BoardResponse } from './board.types';
import { CreateBoardBody, UpdateBoardBody } from './board.validation';

// ── Helpers ────────────────────────────────────────────────────────────────────

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const BOARD_SELECT = {
  id:                      true,
  organizationId:          true,
  name:                    true,
  slug:                    true,
  icon:                    true,
  defaultSorting:          true,
  greeting:                true,
  visibility:              true,
  allowSubscribe:          true,
  disableFollowupQuestions: true,
  disableEndUserPosting:   true,
  order:                   true,
  createdAt:               true,
  updatedAt:               true,
} as const;

// ── Service functions ──────────────────────────────────────────────────────────

export const getBoards = async (orgId: string): Promise<BoardResponse[]> => {
  const boards = await prisma.board.findMany({
    where:   { organizationId: orgId },
    select:  BOARD_SELECT,
    orderBy: { order: 'asc' },
  });
  return boards as unknown as BoardResponse[];
};

export const getBoard = async (orgId: string, boardId: string): Promise<BoardResponse> => {
  const board = await prisma.board.findFirst({
    where:  { id: boardId, organizationId: orgId },
    select: BOARD_SELECT,
  });
  if (!board) throw new ApiError(404, 'Board not found');
  return board as unknown as BoardResponse;
};

export const createBoard = async (
  orgId: string,
  input: CreateBoardBody,
): Promise<BoardResponse> => {
  const slug = generateSlug(input.name);

  const existing = await prisma.board.findFirst({
    where: { organizationId: orgId, slug },
  });
  if (existing) throw new ApiError(409, 'A board with this name already exists');

  const maxOrder = await prisma.board.aggregate({
    where:   { organizationId: orgId },
    _max:    { order: true },
  });
  const nextOrder = (maxOrder._max.order ?? 0) + 1;

  const board = await prisma.board.create({
    data: {
      organizationId:          orgId,
      name:                    input.name,
      slug,
      icon:                    input.icon as unknown as Prisma.InputJsonValue,
      defaultSorting:          input.defaultSorting ?? 'trending',
      greeting:                (input.greeting ?? null) as unknown as Prisma.InputJsonValue,
      visibility:              input.visibility ?? 'public',
      allowSubscribe:          input.allowSubscribe ?? true,
      disableFollowupQuestions: input.disableFollowupQuestions ?? false,
      disableEndUserPosting:   input.disableEndUserPosting ?? false,
      order:                   nextOrder,
    },
    select: BOARD_SELECT,
  });

  return board as unknown as BoardResponse;
};

export const updateBoard = async (
  orgId:   string,
  boardId: string,
  input:   UpdateBoardBody,
): Promise<BoardResponse> => {
  const board = await prisma.board.findFirst({
    where: { id: boardId, organizationId: orgId },
  });
  if (!board) throw new ApiError(404, 'Board not found');

  // If renaming, ensure the new slug is not taken by another board in this org
  if (input.name && input.name !== board.name) {
    const newSlug = generateSlug(input.name);
    const conflict = await prisma.board.findFirst({
      where: { organizationId: orgId, slug: newSlug, NOT: { id: boardId } },
    });
    if (conflict) throw new ApiError(409, 'A board with this name already exists');

    const updated = await prisma.board.update({
      where:  { id: boardId },
      data: {
        ...buildUpdateData(input),
        slug: newSlug,
      },
      select: BOARD_SELECT,
    });
    return updated as unknown as BoardResponse;
  }

  const updated = await prisma.board.update({
    where:  { id: boardId },
    data:   buildUpdateData(input),
    select: BOARD_SELECT,
  });
  return updated as unknown as BoardResponse;
};

export const deleteBoard = async (orgId: string, boardId: string): Promise<void> => {
  const board = await prisma.board.findFirst({
    where: { id: boardId, organizationId: orgId },
  });
  if (!board) throw new ApiError(404, 'Board not found');

  await prisma.board.delete({ where: { id: boardId } });
};

// ── Internal helper ────────────────────────────────────────────────────────────

function buildUpdateData(input: UpdateBoardBody): Prisma.BoardUpdateInput {
  const data: Prisma.BoardUpdateInput = {};
  if (input.name                    !== undefined) data.name                    = input.name;
  if (input.icon                    !== undefined) data.icon                    = input.icon as unknown as Prisma.InputJsonValue;
  if (input.defaultSorting          !== undefined) data.defaultSorting          = input.defaultSorting;
  if (input.greeting                !== undefined) data.greeting                = (input.greeting ?? Prisma.JsonNull) as unknown as Prisma.InputJsonValue;
  if (input.visibility              !== undefined) data.visibility              = input.visibility;
  if (input.allowSubscribe          !== undefined) data.allowSubscribe          = input.allowSubscribe;
  if (input.disableFollowupQuestions !== undefined) data.disableFollowupQuestions = input.disableFollowupQuestions;
  if (input.disableEndUserPosting   !== undefined) data.disableEndUserPosting   = input.disableEndUserPosting;
  if (input.order                   !== undefined) data.order                   = input.order;
  return data;
}
