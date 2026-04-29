import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { trustAggregate } from "./aggregate";

/**
 * AGE-62 demo: aggregate-backed trust queries. Reads return totals in
 * O(log n) without scanning the full `agentEmployees` table. Mutations
 * keep the aggregate in sync with the underlying table — every insert /
 * patch / delete on `agentEmployees` must flow through these helpers (or
 * the equivalent inline calls) once the aggregate is backfilled.
 */

export const totalTrust = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    return await trustAggregate.sum(ctx, {});
  },
});

export const employeeCount = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    return await trustAggregate.count(ctx, {});
  },
});

/**
 * Backfill helper: rebuilds the aggregate from the current
 * `agentEmployees` table. Run once after deploy via
 * `npx convex run trustLedger:backfill`.
 */
export const backfill = mutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    await trustAggregate.clear(ctx, {});
    let n = 0;
    for await (const doc of ctx.db.query("agentEmployees")) {
      await trustAggregate.insert(ctx, doc);
      n += 1;
    }
    return n;
  },
});
