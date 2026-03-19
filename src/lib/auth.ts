import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { organization } from 'better-auth/plugins';
import { prisma } from './prisma';
import { config } from '../config';
import { emailQueue } from './queue';
import logger from '../utils/logger';

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
