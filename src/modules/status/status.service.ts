import { prisma } from '../../lib/prisma';
import ApiError from '../../utils/ApiError';
import { CreateStatusBody, UpdateStatusBody } from './status.validation';
import { StatusResponse } from './status.types';
import { STATUS_SELECT } from './status.constant';


// ── Service functions ──────────────────────────────────────────────────────────
export const getStatuses = async (orgId: string): Promise<StatusResponse[]> => {
  return prisma.status.findMany({
    where:   { organizationId: orgId },
    select:  STATUS_SELECT,
    orderBy: { createdAt: 'asc' },
  });
};

export const createStatus = async (
  orgId: string,
  input: CreateStatusBody,
): Promise<StatusResponse> => {
  // Duplicate name check (case-insensitive)
  const existing = await prisma.status.findFirst({
    where: { organizationId: orgId, name: { equals: input.name, mode: 'insensitive' } },
  });
  if (existing) throw new ApiError(409, 'A status with this name already exists');

  // If this new status should be the default, unset the current default first
  if (input.isDefault) {
    return prisma.$transaction(async (tx) => {
      await tx.status.updateMany({
        where: { organizationId: orgId, isDefault: true },
        data:  { isDefault: false },
      });
      return tx.status.create({
        data:   { organizationId: orgId, name: input.name, color: input.color, isDefault: true },
        select: STATUS_SELECT,
      });
    });
  }

  return prisma.status.create({
    data:   { organizationId: orgId, name: input.name, color: input.color, isDefault: false },
    select: STATUS_SELECT,
  });
};

export const updateStatus = async (
  orgId:    string,
  statusId: string,
  input:    UpdateStatusBody,
): Promise<StatusResponse> => {
  const status = await prisma.status.findFirst({
    where: { id: statusId, organizationId: orgId },
  });
  if (!status) throw new ApiError(404, 'Status not found');

  // Duplicate name check if renaming
  if (input.name && input.name.toLowerCase() !== status.name.toLowerCase()) {
    const conflict = await prisma.status.findFirst({
      where: { organizationId: orgId, name: { equals: input.name, mode: 'insensitive' }, NOT: { id: statusId } },
    });
    if (conflict) throw new ApiError(409, 'A status with this name already exists');
  }

  // If setting as default, unset the current default first
  if (input.isDefault && !status.isDefault) {
    return prisma.$transaction(async (tx) => {
      await tx.status.updateMany({
        where: { organizationId: orgId, isDefault: true },
        data:  { isDefault: false },
      });
      return tx.status.update({
        where:  { id: statusId },
        data:   { name: input.name, color: input.color, isDefault: true },
        select: STATUS_SELECT,
      });
    });
  }

  return prisma.status.update({
    where:  { id: statusId },
    data:   {
      ...(input.name  !== undefined && { name:  input.name }),
      ...(input.color !== undefined && { color: input.color }),
    },
    select: STATUS_SELECT,
  });
};

export const deleteStatus = async (orgId: string, statusId: string): Promise<void> => {
  const status = await prisma.status.findFirst({
    where: { id: statusId, organizationId: orgId },
  });
  if (!status) throw new ApiError(404, 'Status not found');

  if (status.isDefault) {
    throw new ApiError(400, 'Set another status as default before deleting this one');
  }

  const count = await prisma.status.count({ where: { organizationId: orgId } });
  
  if (count <= 1) throw new ApiError(400, 'Cannot delete the last status');

  await prisma.status.delete({ where: { id: statusId } });
};

export const setDefaultStatus = async (orgId: string, statusId: string): Promise<StatusResponse> => {
  const status = await prisma.status.findFirst({
    where: { id: statusId, organizationId: orgId },
  });
  if (!status) throw new ApiError(404, 'Status not found');

  // Already default — no-op
  if (status.isDefault) {
    return prisma.status.findFirst({
      where:  { id: statusId },
      select: STATUS_SELECT,
    }) as Promise<StatusResponse>;
  }

  return prisma.$transaction(async (tx) => {
    await tx.status.updateMany({
      where: { organizationId: orgId, isDefault: true },
      data:  { isDefault: false },
    });
    return tx.status.update({
      where:  { id: statusId },
      data:   { isDefault: true },
      select: STATUS_SELECT,
    });
  });
};
