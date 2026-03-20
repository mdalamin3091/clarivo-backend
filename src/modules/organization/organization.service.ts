import { Request } from 'express';
import { fromNodeHeaders } from 'better-auth/node';

import { prisma } from '../../lib/prisma';
import { auth } from '../../lib/auth';
import ApiError from '../../utils/ApiError';
import { OrganizationResponse, BrandingResponse } from './organization.types';
import { SetupOrganizationBody, UpdateBrandingBody } from './organization.validation';

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

  // Create via better-auth (handles member record + session linkage)
  const created = await auth.api.createOrganization({
    headers,
    body: { name, slug },
  });

  // Patch with onboarding fields
  const organization = await prisma.organization.update({
    where: { id: created.id },
    data: { modules, accessibility, teamSize },
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
  brandColor: true, darkBgColor: true, defaultTheme: true, socialImage: true,
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
