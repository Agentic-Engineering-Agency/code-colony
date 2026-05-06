/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import authConfig from "./auth.config";
import authSchema from "./authSchema";
import { getAuthEmailConfig, getAuthRuntimeConfig, validateBetterAuthSecret } from "./authEnv";
import { resendEmails } from "./resendEmails";

export const AUTH_ROLE_OWNER = "owner";
export const AUTH_ROLE_ADMIN = "admin";
export const AUTH_ROLE_MEMBER = "member";

/**
 * Better Auth + Convex glue. The component manages user/session/account and
 * organization tables internally. Domain functions must still enforce the
 * active organization before reading or writing tenant-owned Code Colony data.
 *
 * Configure production with:
 *   npx convex env set BETTER_AUTH_SECRET <random-32+-chars>
 *   npx convex env set BETTER_AUTH_URL https://app.codecolony.online
 *   npx convex env set BETTER_AUTH_TRUSTED_ORIGINS https://app.codecolony.online
 */
export const authComponent = createClient<DataModel, typeof authSchema>(components.betterAuth, {
  local: { schema: authSchema },
});

type AuthEmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

async function sendAuthEmail(ctx: any, payload: AuthEmailPayload) {
  if (!resendEmails) {
    throw new Error("Auth email delivery requires RESEND_API_KEY");
  }

  const email = getAuthEmailConfig();
  await resendEmails.sendEmail(ctx, {
    from: email.from,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
    ...(email.replyTo ? { replyTo: [email.replyTo] } : {}),
  });
}

export const createAuth = (ctx: any) => {
  const runtime = getAuthRuntimeConfig();
  const secret = validateBetterAuthSecret();
  const email = getAuthEmailConfig();

  return betterAuth({
    appName: "Code Colony",
    baseURL: runtime.baseURL,
    ...(secret ? { secret } : {}),
    trustedOrigins: runtime.trustedOrigins,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: email.hasProvider,
      minPasswordLength: 12,
      maxPasswordLength: 256,
      revokeSessionsOnPasswordReset: true,
      resetPasswordTokenExpiresIn: 60 * 30,
      sendResetPassword: async ({ user, url }) => {
        await sendAuthEmail(ctx, {
          to: user.email,
          subject: "Reset your Code Colony password",
          html: `<p>Reset your Code Colony password:</p><p><a href="${url}">Reset password</a></p>`,
          text: `Reset your Code Colony password: ${url}`,
        });
      },
    },
    emailVerification: {
      sendOnSignUp: email.hasProvider,
      sendOnSignIn: false,
      sendVerificationEmail: async ({ user, url }) => {
        await sendAuthEmail(ctx, {
          to: user.email,
          subject: "Verify your Code Colony email",
          html: `<p>Verify your Code Colony email:</p><p><a href="${url}">Verify email</a></p>`,
          text: `Verify your Code Colony email: ${url}`,
        });
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      freshAge: 60 * 60,
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5,
      },
    },
    rateLimit: {
      enabled: true,
      storage: "database",
      customRules: {
        "/api/auth/sign-in/email": { window: 60, max: 5 },
        "/api/auth/sign-up/email": { window: 60, max: 3 },
        "/api/auth/request-password-reset": { window: 60 * 15, max: 3 },
      },
    },
    advanced: {
      useSecureCookies: runtime.baseURL.startsWith("https://"),
      disableCSRFCheck: false,
      disableOriginCheck: false,
      ipAddress: {
        ipAddressHeaders: ["cf-connecting-ip", "x-forwarded-for", "x-real-ip"],
      },
    },
    plugins: [
      organization({
        allowUserToCreateOrganization: true,
        organizationLimit: 5,
        membershipLimit: 100,
        creatorRole: AUTH_ROLE_OWNER,
        invitationExpiresIn: 60 * 60 * 24 * 7,
        invitationLimit: 50,
        cancelPendingInvitationsOnReInvite: true,
        disableOrganizationDeletion: true,
        sendInvitationEmail: async (data) => {
          const invitationUrl = `${runtime.baseURL}/organization/accept-invitation?id=${encodeURIComponent(data.id)}`;
          await sendAuthEmail(ctx, {
            to: data.email,
            subject: `Join ${data.organization.name} on Code Colony`,
            html: `<p>${data.inviter.user.name} invited you to join ${data.organization.name} on Code Colony.</p><p><a href="${invitationUrl}">Accept invitation</a></p>`,
            text: `${data.inviter.user.name} invited you to join ${data.organization.name} on Code Colony: ${invitationUrl}`,
          });
        },
      }),
      convex({ authConfig }),
    ],
  });
};

export type CodeColonyAuth = ReturnType<typeof createAuth>;

export async function requireAuthUser(ctx: any) {
  const user = await authComponent.getAuthUser(ctx);
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}

type BetterAuthOrganization = {
  id?: unknown;
  role?: unknown;
  members?: Array<{ userId?: unknown; role?: unknown }>;
};

type BetterAuthSessionResult = {
  activeOrganizationId?: unknown;
  session?: { activeOrganizationId?: unknown };
};

type VerifiedOrganization = {
  organizationId: string;
  user: Awaited<ReturnType<typeof requireAuthUser>>;
  role?: string;
};

function extractActiveOrganizationId(session: BetterAuthSessionResult | null | undefined) {
  const organizationId = session?.session?.activeOrganizationId ?? session?.activeOrganizationId;
  return typeof organizationId === "string" && organizationId.length > 0 ? organizationId : undefined;
}

function normalizeOrganizationList(result: unknown): BetterAuthOrganization[] {
  if (Array.isArray(result)) return result as BetterAuthOrganization[];
  if (result && typeof result === "object" && Array.isArray((result as { data?: unknown }).data)) {
    return (result as { data: BetterAuthOrganization[] }).data;
  }
  return [];
}

export function verifyOrganizationMembership(
  organizations: BetterAuthOrganization[],
  organizationId: string,
  userId: string,
): { organizationId: string; role?: string } {
  const organization = organizations.find((candidate) => candidate.id === organizationId);
  if (!organization) {
    throw new Error("Authenticated user is not a member of the requested organization");
  }

  const directRole = typeof organization.role === "string" ? organization.role : undefined;
  const memberRole = organization.members?.find((member) => member.userId === userId)?.role;
  return {
    organizationId,
    role: directRole ?? (typeof memberRole === "string" ? memberRole : undefined),
  };
}

export async function requireActiveOrganization(ctx: any, organizationId?: string): Promise<VerifiedOrganization> {
  const user = await requireAuthUser(ctx);
  const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
  const session = (await auth.api.getSession({ headers })) as BetterAuthSessionResult | null;
  const activeOrganizationId = organizationId ?? extractActiveOrganizationId(session);

  if (!activeOrganizationId) {
    throw new Error("Active organization required");
  }

  const organizations = normalizeOrganizationList(await auth.api.listOrganizations({ headers }));
  const membership = verifyOrganizationMembership(organizations, activeOrganizationId, String(user._id));
  return { ...membership, user };
}

