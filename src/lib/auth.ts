import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { organization } from 'better-auth/plugins';
import { z } from 'zod';
import { prisma } from './prisma';
import { Prisma } from '../generated/client';
import { config } from '../config';
import { emailQueue } from './queue';
import logger from '../utils/logger';

const DEFAULT_BOARD = {
  name:                     'Feature Request',
  slug:                     'feature-request',
  icon:                     { type: 'predefined', value: 'MessageSquare' },
  defaultSorting:           'trending' as const,
  visibility:               'public'   as const,
  allowSubscribe:           true,
  disableFollowupQuestions: false,
  disableEndUserPosting:    false,
};

const DEFAULT_PORTAL_MENUS = [
  { name: 'Feedback',  icon: { type: 'predefined', value: 'MessageSquare' }, link: '/feedback',  order: 1 },
  { name: 'Roadmap',   icon: { type: 'predefined', value: 'Map' },           link: '/roadmap',   order: 2 },
  { name: 'Changelog', icon: { type: 'predefined', value: 'RefreshCw' },     link: '/changelog', order: 3 },
] as const;

const BOARD_GREETING = {
     welcomingTitle:        "Welcoming title will be here",
    welcomingDescription:  "welcoming description will be here",
    postCreationButtonText: "create new post",
} as const;



const portalMenusValidator = z.array(
  z.object({
    id:    z.string().min(1),
    name:  z.string().min(1).max(100),
    icon:  z.object({
      type:  z.enum(['predefined', 'custom']),
      value: z.string().min(1),
    }),
    link:  z.string(),
    order: z.number().int().nonnegative(),
  }),
);

const boardGreetingValidator = z
  .object({
    welcomingTitle:         z.string().max(200).default("Welcoming title will be here"),
    welcomingDescription:   z.string().max(500).default("welcoming description will be here"),
    postCreationButtonText: z.string().max(50).default("create new post"),
  })

export const auth = betterAuth({
  baseURL: config.BETTER_AUTH_URL,
  secret: config.BETTER_AUTH_SECRET,
  trustedOrigins: [config.FRONTEND_URL],

  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
    requireEmailVerification: false,
    sendResetPassword: async (data: { user: { email: string; name: string }; url: string }) => {
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now
      await emailQueue.add('send-password-reset', {
        type: 'send-password-reset',
        to: data.user.email,
        userName: data.user.name ?? data.user.email,
        resetUrl: data.url,
        expiresAt,
      });
      logger.info(`Password reset email job queued for ${data.user.email}`);
    },
  },

  socialProviders: {
    google: {
      clientId: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh if older than 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 min client-side cache
    },
  },

  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      creatorRole: 'owner',
      invitationExpiresIn: 60 * 60 * 48, // 48 hours

      schema: {
        organization: {
          additionalFields: {
            modules:           { type: 'string[]', required: false },
            publicPortalMenus: { type: 'json',     required: false, validator: { input: portalMenusValidator } },
            accessibility:     { type: 'string',   required: false },
            teamSize:          { type: 'string',   required: false },
            displayName:       { type: 'string',   required: false },
            brandColor:        { type: 'string',   required: false },
            darkBgColor:       { type: 'string',   required: false },
            defaultTheme:      { type: 'string',   required: false },
            socialImage:       { type: 'string',   required: false },
            hideLeaderBoard:   { type: 'boolean',  required: false },
            defaultSorting:    { type: 'string',   required: false },
            boardGreeting:     { type: 'json',     required: false, validator: { input: boardGreetingValidator } },
          },
        },
      },

      organizationHooks: {
        afterCreateOrganization: async ({ organization }) => {
          const publicPortalMenus = DEFAULT_PORTAL_MENUS.map(m => ({
            ...m,
            id: crypto.randomUUID(),
          }));

          await Promise.all([
            prisma.board.create({
              data: {
                organizationId: organization.id,
                ...DEFAULT_BOARD,
                icon: DEFAULT_BOARD.icon as unknown as Prisma.InputJsonValue,
              },
            }),
            prisma.organization.update({
              where: { id: organization.id },
              data: {
                publicPortalMenus: publicPortalMenus as unknown as Prisma.InputJsonValue,
                // Global board settings — explicit defaults so they're always initialised
                defaultSorting:  'trending',
                hideLeaderBoard: false,
                defaultTheme:    'system',
                boardGreeting:   BOARD_GREETING as unknown as Prisma.InputJsonObject,
              },
            }),
          ]);
          
          logger.info(`Default board and portal menus seeded for org: ${organization.id}`);
        },
      },

      sendInvitationEmail: async (data) => {
        const inviteUrl = `${config.FRONTEND_URL}/invite/${data.invitation.id}`;
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 48);

        await emailQueue.add('send-invitation', {
          type: 'send-invitation',
          to: data.invitation.email,
          inviterName: data.inviter.user.name ?? data.inviter.user.email,
          orgName: data.organization.name,
          role: data.invitation.role,
          inviteUrl,
          expiresAt,
        });

        logger.info(
          `Invitation email job queued for ${data.invitation.email} → org: ${data.organization.name}`,
        );
      },
    }),
  ],
});

export type Auth = typeof auth;
