/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import authConfig from "./auth.config";

/**
 * Better Auth + Convex glue. The component manages user/session/account
 * tables internally; we expose `authComponent.getAuthUser(ctx)` and
 * `createAuth(ctx)` for use by HTTP routes and Convex functions.
 *
 * Configure in production with:
 *   npx convex env set BETTER_AUTH_SECRET <random>
 *   npx convex env set SITE_URL https://codecolony.dev
 */
export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: any) =>
  betterAuth({
    baseURL: process.env.SITE_URL ?? "http://localhost:3000",
    database: authComponent.adapter(ctx),
    emailAndPassword: { enabled: true, requireEmailVerification: false },
    plugins: [convex({ authConfig })],
  });
