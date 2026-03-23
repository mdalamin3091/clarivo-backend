import { prisma } from '../../lib/prisma';
import ApiError from '../../utils/ApiError';
import { CreateCustomFieldBody, UpdateCustomFieldBody } from './custom-field.validation';
import { CustomFieldResponse } from './custom-field.types';
import { CUSTOM_FIELD_SELECT, OPTION_TYPES } from './custom-field.constant';


export const getCustomFields = async (orgId: string): Promise<CustomFieldResponse[]> => {
  return prisma.customField.findMany({
    where:   { organizationId: orgId },
    select:  CUSTOM_FIELD_SELECT,
    orderBy: { order: 'asc' },
  });
};

export const createCustomField = async (
  orgId: string,
  input: CreateCustomFieldBody,
): Promise<CustomFieldResponse> => {
  const existing = await prisma.customField.findFirst({
    where: { organizationId: orgId, name: { equals: input.name, mode: 'insensitive' } },
  });
  if (existing) throw new ApiError(409, 'A custom field with this name already exists');

  const agg = await prisma.customField.aggregate({
    where: { organizationId: orgId },
    _max:  { order: true },
  });
  const nextOrder = (agg._max.order ?? 0) + 1;

  return prisma.customField.create({
    data: {
      organizationId:       orgId,
      name:                 input.name,
      type:                 input.type,
      options:              input.options ?? [],
      placeholder:          input.placeholder ?? null,
      isRequired:           input.isRequired           ?? false,
      isPrivate:            input.isPrivate             ?? false,
      showAnswerToEveryone: input.showAnswerToEveryone  ?? false,
      order:                nextOrder,
    },
    select: CUSTOM_FIELD_SELECT,
  });
};

export const updateCustomField = async (
  orgId:   string,
  fieldId: string,
  input:   UpdateCustomFieldBody,
): Promise<CustomFieldResponse> => {
  const field = await prisma.customField.findFirst({
    where: { id: fieldId, organizationId: orgId },
  });
  if (!field) throw new ApiError(404, 'Custom field not found');

  // Duplicate name check if renaming
  if (input.name && input.name.toLowerCase() !== field.name.toLowerCase()) {
    const conflict = await prisma.customField.findFirst({
      where: {
        organizationId: orgId,
        name:           { equals: input.name, mode: 'insensitive' },
        NOT:            { id: fieldId },
      },
    });
    if (conflict) throw new ApiError(409, 'A custom field with this name already exists');
  }

  // Determine the effective type after this update
  const effectiveType = input.type ?? field.type;

  // Guard: options must not be empty when the effective type requires them
  if (OPTION_TYPES.has(effectiveType) && input.options !== undefined && input.options.length === 0) {
    throw new ApiError(400, `At least one option is required for ${effectiveType} fields`);
  }

  // When type changes away from dropdown/multiselect, clear options in DB
  const shouldClearOptions = input.type !== undefined && !OPTION_TYPES.has(input.type) && OPTION_TYPES.has(field.type);

  return prisma.customField.update({
    where: { id: fieldId },
    data: {
      ...(input.name                 !== undefined && { name:                 input.name }),
      ...(input.type                 !== undefined && { type:                 input.type }),
      ...(shouldClearOptions                       && { options:              [] }),
      ...(!shouldClearOptions && input.options !== undefined && { options:   input.options }),
      ...(input.placeholder          !== undefined && { placeholder:          input.placeholder }),
      ...(input.isRequired           !== undefined && { isRequired:           input.isRequired }),
      ...(input.isPrivate            !== undefined && { isPrivate:            input.isPrivate }),
      ...(input.showAnswerToEveryone !== undefined && { showAnswerToEveryone: input.showAnswerToEveryone }),
      ...(input.order                !== undefined && { order:                input.order }),
    },
    select: CUSTOM_FIELD_SELECT,
  });
};

export const deleteCustomField = async (orgId: string, fieldId: string): Promise<void> => {
  const field = await prisma.customField.findFirst({
    where: { id: fieldId, organizationId: orgId },
  });
  if (!field) throw new ApiError(404, 'Custom field not found');

  await prisma.customField.delete({ where: { id: fieldId } });
};
