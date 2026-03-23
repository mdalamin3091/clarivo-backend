import { prisma }    from '../../lib/prisma';
import ApiError      from '../../utils/ApiError';
import { Prisma }    from '../../generated/client';
import { RoadmapResponse } from './roadmap.types';
import { CreateRoadmapBody, UpdateRoadmapBody, ReorderRoadmapsBody } from './roadmap.validation';

// ── Selects ────────────────────────────────────────────────────────────────────

const COLUMN_SELECT = {
  id:          true,
  roadmapId:   true,
  name:        true,
  description: true,
  icon:        true,
  color:       true,
  baseFilter:  true,
  order:       true,
  createdAt:   true,
  updatedAt:   true,
} as const;

const ROADMAP_SELECT = {
  id:             true,
  organizationId: true,
  name:           true,
  description:    true,
  icon:           true,
  visibility:     true,
  baseFilter:     true,
  copiedFromId:   true,
  order:          true,
  createdAt:      true,
  updatedAt:      true,
  columns: {
    select:  COLUMN_SELECT,
    orderBy: { order: 'asc' as const },
  },
} as const;

// ── Default columns ────────────────────────────────────────────────────────────

const DEFAULT_COLUMN_DEFS = [
  { name: 'Backlog',     color: '#6366f1', order: 1, statusName: 'In Review'   },
  { name: 'Planned',     color: '#f59e0b', order: 2, statusName: 'Planned'     },
  { name: 'In Progress', color: '#3b82f6', order: 3, statusName: 'In Progress' },
  { name: 'Done',        color: '#22c55e', order: 4, statusName: 'Completed'   },
];

async function buildDefaultColumns(orgId: string, roadmapId: string) {
  const statuses = await prisma.status.findMany({
    where:  { organizationId: orgId },
    select: { id: true, name: true },
  });
  const byName = Object.fromEntries(statuses.map(s => [s.name, s.id]));

  return DEFAULT_COLUMN_DEFS.map(col => ({
    roadmapId,
    name:       col.name,
    color:      col.color,
    order:      col.order,
    baseFilter: byName[col.statusName] ? `statusId=${byName[col.statusName]}` : '',
  }));
}

// ── Service functions ──────────────────────────────────────────────────────────

export const getRoadmaps = async (orgId: string): Promise<RoadmapResponse[]> => {
  const roadmaps = await prisma.roadmap.findMany({
    where:   { organizationId: orgId },
    select:  ROADMAP_SELECT,
    orderBy: { order: 'asc' },
  });
  return roadmaps as unknown as RoadmapResponse[];
};

export const getRoadmap = async (orgId: string, id: string): Promise<RoadmapResponse> => {
  const roadmap = await prisma.roadmap.findFirst({
    where:  { id, organizationId: orgId },
    select: ROADMAP_SELECT,
  });
  if (!roadmap) throw new ApiError(404, 'Roadmap not found');
  return roadmap as unknown as RoadmapResponse;
};

export const createRoadmap = async (
  orgId: string,
  input: CreateRoadmapBody,
): Promise<RoadmapResponse> => {
  const maxOrder = await prisma.roadmap.aggregate({
    where: { organizationId: orgId },
    _max:  { order: true },
  });
  const nextOrder = (maxOrder._max.order ?? 0) + 1;

  const roadmap = await prisma.roadmap.create({
    data: {
      organizationId: orgId,
      name:           input.name,
      description:    input.description,
      icon:           input.icon as unknown as Prisma.InputJsonValue,
      visibility:     input.visibility ?? 'everyone',
      baseFilter:     input.baseFilter ?? '',
      copiedFromId:   input.copiedFromId ?? null,
      order:          nextOrder,
    },
    select: { id: true },
  });

  // Seed columns — either copy from source or create defaults
  if (input.copiedFromId) {
    const source = await prisma.roadmap.findFirst({
      where:  { id: input.copiedFromId, organizationId: orgId },
      select: { columns: { select: COLUMN_SELECT, orderBy: { order: 'asc' as const } } },
    });
    if (source?.columns.length) {
      await prisma.roadmapColumn.createMany({
        data: source.columns.map(col => ({
          roadmapId:   roadmap.id,
          name:        col.name,
          description: col.description,
          icon:        col.icon    as unknown as Prisma.InputJsonValue ?? Prisma.JsonNull,
          color:       col.color,
          baseFilter:  col.baseFilter,
          order:       col.order,
        })),
      });
    }
  } else {
    const defaultCols = await buildDefaultColumns(orgId, roadmap.id);
    await prisma.roadmapColumn.createMany({ data: defaultCols });
  }

  return getRoadmap(orgId, roadmap.id);
};

export const updateRoadmap = async (
  orgId: string,
  id:    string,
  input: UpdateRoadmapBody,
): Promise<RoadmapResponse> => {
  const existing = await prisma.roadmap.findFirst({ where: { id, organizationId: orgId } });
  if (!existing) throw new ApiError(404, 'Roadmap not found');

  const data: Prisma.RoadmapUpdateInput = {};
  if (input.name        !== undefined) data.name        = input.name;
  if (input.description !== undefined) data.description = input.description;
  if (input.icon        !== undefined) data.icon        = input.icon as unknown as Prisma.InputJsonValue;
  if (input.visibility  !== undefined) data.visibility  = input.visibility;
  if (input.baseFilter  !== undefined) data.baseFilter  = input.baseFilter;
  if (input.order       !== undefined) data.order       = input.order;

  await prisma.roadmap.update({ where: { id }, data });
  return getRoadmap(orgId, id);
};

export const deleteRoadmap = async (orgId: string, id: string): Promise<void> => {
  const existing = await prisma.roadmap.findFirst({ where: { id, organizationId: orgId } });
  if (!existing) throw new ApiError(404, 'Roadmap not found');
  await prisma.roadmap.delete({ where: { id } });
};

export const reorderRoadmaps = async (
  orgId:  string,
  input:  ReorderRoadmapsBody,
): Promise<RoadmapResponse[]> => {
  await Promise.all(
    input.items.map(({ id, order }) =>
      prisma.roadmap.update({
        where: { id, organizationId: orgId },
        data:  { order },
      }),
    ),
  );
  return getRoadmaps(orgId);
};

// ── Column service functions ───────────────────────────────────────────────────

import { UpdateColumnBody, ReorderColumnsBody } from './roadmap.validation';

async function assertRoadmapOwner(orgId: string, roadmapId: string) {
  const roadmap = await prisma.roadmap.findFirst({ where: { id: roadmapId, organizationId: orgId } });
  if (!roadmap) throw new ApiError(404, 'Roadmap not found');
}

export const createColumn = async (orgId: string, roadmapId: string): Promise<RoadmapResponse> => {
  await assertRoadmapOwner(orgId, roadmapId);

  const maxOrder = await prisma.roadmapColumn.aggregate({
    where: { roadmapId },
    _max:  { order: true },
  });
  const nextOrder = (maxOrder._max.order ?? 0) + 1;

  await prisma.roadmapColumn.create({
    data: {
      roadmapId,
      name:  'New Column',
      color: '#6366f1',
      order: nextOrder,
    },
  });

  return getRoadmap(orgId, roadmapId);
};

export const updateColumn = async (
  orgId:     string,
  roadmapId: string,
  columnId:  string,
  input:     UpdateColumnBody,
): Promise<RoadmapResponse> => {
  await assertRoadmapOwner(orgId, roadmapId);

  const column = await prisma.roadmapColumn.findFirst({ where: { id: columnId, roadmapId } });
  if (!column) throw new ApiError(404, 'Column not found');

  const data: Prisma.RoadmapColumnUpdateInput = {};
  if (input.name       !== undefined) data.name       = input.name;
  if (input.color      !== undefined) data.color      = input.color;
  if (input.baseFilter !== undefined) data.baseFilter = input.baseFilter;
  if (input.order      !== undefined) data.order      = input.order;

  await prisma.roadmapColumn.update({ where: { id: columnId }, data });
  return getRoadmap(orgId, roadmapId);
};

export const deleteColumn = async (
  orgId:     string,
  roadmapId: string,
  columnId:  string,
): Promise<RoadmapResponse> => {
  await assertRoadmapOwner(orgId, roadmapId);

  const column = await prisma.roadmapColumn.findFirst({ where: { id: columnId, roadmapId } });
  if (!column) throw new ApiError(404, 'Column not found');

  await prisma.roadmapColumn.delete({ where: { id: columnId } });
  return getRoadmap(orgId, roadmapId);
};

export const reorderColumns = async (
  orgId:     string,
  roadmapId: string,
  input:     ReorderColumnsBody,
): Promise<RoadmapResponse> => {
  await assertRoadmapOwner(orgId, roadmapId);

  await Promise.all(
    input.items.map(({ id, order }) =>
      prisma.roadmapColumn.update({
        where: { id, roadmapId },
        data:  { order },
      }),
    ),
  );

  return getRoadmap(orgId, roadmapId);
};
