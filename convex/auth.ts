/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import authConfig from "./auth.config";
import { getAuthRuntimeConfig, validateBetterAuthSecret } from "./authEnv";

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
export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: any) => {
  const runtime = getAuthRuntimeConfig();
  const secret = validateBetterAuthSecret();

  return betterAuth({
    appName: "Code Colony",
    baseURL: runtime.baseURL,
    ...(secret ? { secret } : {}),
    trustedOrigins: runtime.trustedOrigins,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      minPasswordLength: 12,
      maxPasswordLength: 256,
      revokeSessionsOnPasswordReset: true,
      resetPasswordTokenExpiresIn: 60 * 30,
      sendResetPassword: async () => {
        throw new Error("Password reset email delivery is not configured for Code Colony");
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
        sendInvitationEmail: async () => {
          throw new Error("Organization invitation email delivery is not configured for Code Colony");
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

export async function requireActiveOrganization(ctx: any) {
  await requireAuthUser(ctx);
  throw new Error("Active organization verification requires an explicit organizationId; tenant-owned data access is blocked until that guard is wired");
}
