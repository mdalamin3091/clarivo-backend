import { Request } from 'express';
import { fromNodeHeaders } from 'better-auth/node';

import { prisma } from '../../lib/prisma';
import { auth } from '../../lib/auth';
import ApiError from '../../utils/ApiError';
import { Prisma } from '../../generated/client';
import { OrganizationResponse, PortalMenuItem } from './organization.types';
import { SetupOrganizationBody } from './organization.validation';

// Default board created for every new organization
const DEFAULT_BOARD = {
  name:                    'Feature Request',
  slug:                    'feature-request',
  icon:                    { type: 'predefined', value: 'MessageSquare' },
  defaultSorting:          'trending' as const,
  visibility:              'public'   as const,
  allowSubscribe:          true,
  disableFollowupQuestions: false,
  disableEndUserPosting:   false,
};

// Always-created default portal menus — order is fixed regardless of module selection
const DEFAULT_PORTAL_MENUS: Omit<PortalMenuItem, 'id'>[] = [
  { name: 'Feedback',  icon: { type: 'predefined', value: 'MessageSquare' }, link: '/feedback',  order: 1 },
  { name: 'Roadmap',   icon: { type: 'predefined', value: 'Map' },           link: '/roadmap',   order: 2 },
  { name: 'Changelog', icon: { type: 'predefined', value: 'RefreshCw' },     link: '/changelog', order: 3 },
];

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export const checkNameAvailability = async (name: string): Promise<boolean> => {
  const slug = generateSlug(name);
  const existing = await prisma.organization.findFirst({
    where: {
      OR: [{ name: { equals: name, mode: 'insensitive' } }, { slug }],
    },
  });
  return !existing;
};

export const setupOrganization = async (
  req: Request,
  input: SetupOrganizationBody,
): Promise<OrganizationResponse> => {
  const { name, modules, accessibility } = input;
  const teamSize = input.teamSize || null; // normalize '' / undefined → null
  const slug = generateSlug(name);

  const existing = await prisma.organization.findFirst({
    where: {
      OR: [{ name: { equals: name, mode: 'insensitive' } }, { slug }],
    },
  });

  if (existing) {
    throw new ApiError(409, 'Organization name is already taken');
  }

  const headers = fromNodeHeaders(req.headers);

  // Always seed the three default portal menus with fixed order
  const publicPortalMenus: PortalMenuItem[] = DEFAULT_PORTAL_MENUS.map(m => ({
    ...m,
    id: crypto.randomUUID(),
  }));

  // Create via better-auth (handles member record + session linkage)
  const created = await auth.api.createOrganization({
    headers,
    body: { name, slug },
  });

  // Patch with onboarding fields — modules stays as the original string array
  const organization = await prisma.organization.update({
    where: { id: created.id },
    data: {
      modules,
      accessibility,
      teamSize,
      publicPortalMenus: publicPortalMenus as unknown as Prisma.InputJsonValue,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      modules: true,
      accessibility: true,
      teamSize: true,
      createdAt: true,
    },
  });

  // Seed the default "Feature Request" board for the new org
  await prisma.board.create({
    data: {
      organizationId: created.id,
      ...DEFAULT_BOARD,
      icon:    DEFAULT_BOARD.icon    as unknown as Prisma.InputJsonValue,
    },
  });

  // Activate the new org in the current session
  await auth.api.setActiveOrganization({
    headers,
    body: { organizationId: created.id },
  });

  return organization;
};
