import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { rateLimiter } from "./rateLimiter";

/**
 * Pure helpers exported so unit tests can lock down the dedupe contract
 * without re-implementing the regex.
 *
 * Email matching is permissive on purpose — we accept the entire RFC-5321
 * surface short of cosmetic validation, then dedupe via a normalised key
 * (trimmed + lowercased local- and domain-parts).
 */
export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw);
}

const role = v.union(
  v.literal("founder"),
  v.literal("engineer"),
  v.literal("operator"),
  v.literal("investor"),
  v.literal("curious"),
);

/**
 * Landing-page waitlist join (AGE-54). Two rate-limit gates sit in front:
 *
 *   1. `waitlistGlobal`: a coarse global cap so a single attacker spamming
 *      millions of *unique* emails cannot bypass per-email limits.
 *   2. `waitlistJoin`: per-email cap (1/email/24h) for human users.
 *
 * Both gates run before the dedupe lookup so the response time is constant
 * regardless of whether the email exists — closing the email-existence
 * oracle that the original implementation leaked.
 *
 * Return shape always carries `rateLimited` so callers can branch on it
 * instead of catching exceptions for the limited case.
 */
export const join = mutation({
  args: {
    email: v.string(),
    role,
    repo: v.optional(v.string()),
  },
  returns: v.object({
    ok: v.boolean(),
    id: v.optional(v.id("waitlistEntries")),
    rateLimited: v.boolean(),
    retryAfterMs: v.optional(v.number()),
  }),
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);
    if (!isValidEmail(email)) {
      throw new Error("Invalid email");
    }

    const globalLimit = await rateLimiter.limit(ctx, "waitlistGlobal", {
      key: "global",
    });
    if (!globalLimit.ok) {
      return {
        ok: false,
        rateLimited: true,
        retryAfterMs: globalLimit.retryAfter,
      };
    }

    const perEmailLimit = await rateLimiter.limit(ctx, "waitlistJoin", {
      key: email,
    });
    if (!perEmailLimit.ok) {
      return {
        ok: false,
        rateLimited: true,
        retryAfterMs: perEmailLimit.retryAfter,
      };
    }

    const existing = await ctx.db
      .query("waitlistEntries")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (existing) {
      return { ok: true, id: existing._id, rateLimited: false };
    }

    const id = await ctx.db.insert("waitlistEntries", {
      email,
      role: args.role,
      repo: args.repo,
      joinedAt: Date.now(),
    });
    return { ok: true, id, rateLimited: false };
  },
});

/**
 * Bounded count for the landing-page footer. Returns at most 5000 to keep
 * the read O(1)-ish even as the table grows; replace with a `@convex-dev/
 * sharded-counter` lookup once the waitlist tops 5000 entries.
 */
export const count = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const cap = 5000;
    const rows = await ctx.db.query("waitlistEntries").take(cap);
    return rows.length;
  },
});
