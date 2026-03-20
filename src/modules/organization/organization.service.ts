import { Request } from 'express';
import { fromNodeHeaders } from 'better-auth/node';

import { prisma } from '../../lib/prisma';
import { auth } from '../../lib/auth';
import ApiError from '../../utils/ApiError';
import { Prisma } from '../../generated/client';
import { OrganizationResponse, BrandingResponse, PortalMenuItem, PortalMenusResponse } from './organization.types';
import { SetupOrganizationBody, UpdateBrandingBody, UpdatePortalMenusBody } from './organization.validation';

// Default portal menu configs for each onboarding module key
const PORTAL_MENU_DEFAULTS: Record<string, { name: string; icon: { type: 'predefined'; value: string }; link: string }> = {
  feedback:  { name: 'Feedback',  icon: { type: 'predefined', value: 'MessageSquare' }, link: '/feedback' },
  roadmap:   { name: 'Roadmap',   icon: { type: 'predefined', value: 'Map' },           link: '/roadmap' },
  changelog: { name: 'Changelog', icon: { type: 'predefined', value: 'RefreshCw' },     link: '/changelog' },
  survey:    { name: 'Survey',    icon: { type: 'predefined', value: 'ClipboardList' }, link: '/survey' },
};

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

  // Seed publicPortalMenus from onboarding module selections
  const publicPortalMenus: PortalMenuItem[] = modules.map(key => ({
    id: crypto.randomUUID(),
    ...(PORTAL_MENU_DEFAULTS[key] ?? { name: key, icon: { type: 'predefined', value: 'Box' }, link: `/${key}` }),
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
  await prisma.organization.update({
    where: { id: orgId },
    data: { publicPortalMenus: input.publicPortalMenus as unknown as Prisma.InputJsonValue },
  });
  return { publicPortalMenus: input.publicPortalMenus };
};
