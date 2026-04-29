import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { rateLimiter } from "./rateLimiter";

const role = v.union(
  v.literal("founder"),
  v.literal("engineer"),
  v.literal("operator"),
  v.literal("investor"),
  v.literal("curious"),
);

/**
 * Landing-page waitlist join (AGE-54). Rate-limited to one signup per email
 * per 24h via `@convex-dev/rate-limiter`. Idempotent on email — repeated
 * submissions return the existing entry rather than erroring.
 */
export const join = mutation({
  args: {
    email: v.string(),
    role,
    repo: v.optional(v.string()),
  },
  returns: v.object({
    ok: v.boolean(),
    id: v.id("waitlistEntries"),
    rateLimited: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      throw new Error("Invalid email");
    }

    const existing = await ctx.db
      .query("waitlistEntries")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .first();
    if (existing) {
      return { ok: true, id: existing._id, rateLimited: false };
    }

    const { ok, retryAfter } = await rateLimiter.limit(ctx, "waitlistJoin", {
      key: normalizedEmail,
    });
    if (!ok) {
      throw new Error(
        `Already signed up. Retry in ${Math.ceil(retryAfter / 1000)}s.`,
      );
    }

    const id = await ctx.db.insert("waitlistEntries", {
      email: normalizedEmail,
      role: args.role,
      repo: args.repo,
      joinedAt: Date.now(),
    });
    return { ok: true, id, rateLimited: false };
  },
});

export const count = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    return (await ctx.db.query("waitlistEntries").collect()).length;
  },
});
