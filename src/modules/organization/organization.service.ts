import { Request } from 'express';
import { fromNodeHeaders } from 'better-auth/node';

import { prisma } from '../../lib/prisma';
import { auth } from '../../lib/auth';
import ApiError from '../../utils/ApiError';
import { SetupOrganizationBody } from './organization.validation';

export const checkSlugAvailability = async (slug: string): Promise<boolean> => {
  const existing = await prisma.organization.findUnique({ where: { slug } });
  return !existing;
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

export const createOrganizationService = async (
  req: Request,
  input: SetupOrganizationBody,
) => {
  const { name, modules, accessibility } = input;
  const teamSize = input.teamSize || "";
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

  // Create via better-auth — triggers afterCreateOrganization hook which seeds
  // the default board and portal menus automatically
  const createdOrganization = await auth.api.createOrganization({
    headers,
    body: { name, slug, modules, accessibility, teamSize },
     
  });

  // Activate the new org in the current session
  await auth.api.setActiveOrganization({
    headers,
    body: { organizationId: createdOrganization.id },
  });

  return createdOrganization;
};
