import { Request } from 'express';
import { fromNodeHeaders } from 'better-auth/node';

import { prisma } from '../../lib/prisma';
import { auth } from '../../lib/auth';
import ApiError from '../../utils/ApiError';
import { Prisma } from '../../generated/client';
import { OrganizationResponse, BrandingResponse, PortalMenuItem, PortalMenusResponse } from './organization.types';
import { SetupOrganizationBody, UpdateBrandingBody, UpdatePortalMenusBody } from './organization.validation';

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

  // Activate the new org in the current session
  await auth.api.setActiveOrganization({
    headers,
    body: { organizationId: created.id },
  });

  return organization;
};

const BRANDING_SELECT = {
  id: true, name: true, slug: true, logo: true,
  displayName: true, brandColor: true, darkBgColor: true, defaultTheme: true, socialImage: true,
} as const;

export const updateOrgBranding = async (
  orgId: string,
  input: UpdateBrandingBody,
): Promise<BrandingResponse> => {
  const org = await prisma.organization.update({
    where: { id: orgId },
    data: input,
    select: BRANDING_SELECT,
  });
  return org;
};

export const replacePortalMenus = async (
  orgId: string,
  input: UpdatePortalMenusBody,
): Promise<PortalMenusResponse> => {
  const links = input.publicPortalMenus.map(m => m.link.toLowerCase().trim());
  const duplicateLink = links.find((link, i) => links.indexOf(link) !== i);
  if (duplicateLink) {
    throw new ApiError(409, `"${duplicateLink}" is already used by another menu item. Each link must be unique.`);
  }

  // Re-index order by position to close any gaps, then sort before persisting
  const menus: PortalMenuItem[] = input.publicPortalMenus
    .map((m, i) => ({ ...m, order: i + 1 }))
    .sort((a, b) => a.order - b.order);

  await prisma.organization.update({
    where: { id: orgId },
    data: { publicPortalMenus: menus as unknown as Prisma.InputJsonValue },
  });
  return { publicPortalMenus: menus };
};
