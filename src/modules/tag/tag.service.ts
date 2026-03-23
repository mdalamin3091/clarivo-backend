import { prisma } from '../../lib/prisma';
import ApiError from '../../utils/ApiError';
import { CreateTagBody, UpdateTagBody } from './tag.validation';
import { TagResponse } from './tag.types';

const TAG_SELECT = {
  id:             true,
  organizationId: true,
  name:           true,
  color:          true,
  isPrivate:      true,
  order:          true,
  createdAt:      true,
  updatedAt:      true,
} as const;

// ── Service functions ──────────────────────────────────────────────────────────

export const getTags = async (orgId: string): Promise<TagResponse[]> => {
  return prisma.tag.findMany({
    where:   { organizationId: orgId },
    select:  TAG_SELECT,
    orderBy: { order: 'asc' },
  });
};

export const createTag = async (
  orgId: string,
  input: CreateTagBody,
): Promise<TagResponse> => {
  const existing = await prisma.tag.findFirst({
    where: { organizationId: orgId, name: { equals: input.name, mode: 'insensitive' } },
  });
  if (existing) throw new ApiError(409, 'A tag with this name already exists');

  const maxOrder = await prisma.tag.aggregate({
    where: { organizationId: orgId },
    _max:  { order: true },
  });
  const nextOrder = (maxOrder._max.order ?? 0) + 1;

  return prisma.tag.create({
    data: {
      organizationId: orgId,
      name:           input.name,
      color:          input.color,
      isPrivate:      input.isPrivate ?? false,
      order:          nextOrder,
    },
    select: TAG_SELECT,
  });
};

export const updateTag = async (
  orgId:  string,
  tagId:  string,
  input:  UpdateTagBody,
): Promise<TagResponse> => {
  const tag = await prisma.tag.findFirst({
    where: { id: tagId, organizationId: orgId },
  });
  if (!tag) throw new ApiError(404, 'Tag not found');

  // Duplicate name check if renaming
  if (input.name && input.name.toLowerCase() !== tag.name.toLowerCase()) {
    const conflict = await prisma.tag.findFirst({
      where: { organizationId: orgId, name: { equals: input.name, mode: 'insensitive' }, NOT: { id: tagId } },
    });
    if (conflict) throw new ApiError(409, 'A tag with this name already exists');
  }

  return prisma.tag.update({
    where:  { id: tagId },
    data: {
      ...(input.name      !== undefined && { name:      input.name }),
      ...(input.color     !== undefined && { color:     input.color }),
      ...(input.isPrivate !== undefined && { isPrivate: input.isPrivate }),
      ...(input.order     !== undefined && { order:     input.order }),
    },
    select: TAG_SELECT,
  });
};

export const deleteTag = async (orgId: string, tagId: string): Promise<void> => {
  const tag = await prisma.tag.findFirst({
    where: { id: tagId, organizationId: orgId },
  });
  if (!tag) throw new ApiError(404, 'Tag not found');

  await prisma.tag.delete({ where: { id: tagId } });
};
