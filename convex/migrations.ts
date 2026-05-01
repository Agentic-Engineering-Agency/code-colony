import { Migrations } from "@convex-dev/migrations";
import { components, internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";

/**
 * Online batched migrations runner. Each migration tracks progress so it
 * resumes safely after failure or partial deploy.
 *
 * Run interactively with `npx convex run migrations:run` (no args runs all
 * registered migrations) or target one with
 * `npx convex run migrations:run '{"fn":"migrations:backfillWaitlistJoinedAt"}'`.
 */
export const migrations = new Migrations<DataModel>(components.migrations);

/**
 * No-op-ish backfill: ensures every `waitlistEntries` row has a `joinedAt`
 * timestamp. Rows created via the new `waitlist:join` mutation already set
 * it; this keeps any pre-existing or imported rows consistent.
 */
export const backfillWaitlistJoinedAt = migrations.define({
  table: "waitlistEntries",
  migrateOne: async (ctx, doc) => {
    if (doc.joinedAt === undefined) {
      await ctx.db.patch(doc._id, { joinedAt: doc._creationTime });
    }
  },
});

export const run = migrations.runner([
  internal.migrations.backfillWaitlistJoinedAt,
]);
