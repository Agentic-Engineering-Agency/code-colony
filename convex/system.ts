import { query } from "./_generated/server";

/**
 * Lightweight health-check query used by `/api/health`'s `cv` probe.
 * Returns the current server time and a count of seeded backlog issues
 * so the caller can confirm both the deployment and the schema are alive.
 */
export const ping = query({
  args: {},
  handler: async (ctx) => {
    const backlogCount = (await ctx.db.query("backlogIssues").take(50)).length;
    return {
      ok: true,
      now: Date.now(),
      backlogCount,
    };
  },
});
