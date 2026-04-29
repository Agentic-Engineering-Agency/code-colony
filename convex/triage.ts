/* eslint-disable @typescript-eslint/no-explicit-any */
import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { workflow } from "./workflow";
import { triageCache } from "./cache";
import { retrier } from "./retrier";
import { rateLimiter } from "./rateLimiter";
import { regionCommandCounter } from "./counter";

/**
 * AGE-62 demo: the triage pipeline now runs as a durable workflow.
 *
 *   step 1: read the backlog issue (query)
 *   step 2: invoke the Mastra triage agent (action, retried + cached)
 *   step 3: write the resulting suggestion back (mutation)
 *
 * Each step is checkpointed by `@convex-dev/workflow`, so a crash mid-flow
 * resumes from the last completed step instead of re-running the whole
 * pipeline. The Mastra call also passes through `@convex-dev/action-cache`,
 * so identical issues do not re-hit FreeLLMAPI within the cache TTL.
 */
export const triageWorkflow = workflow.define({
  args: { issueSeedId: v.string() },
  handler: async (step, args): Promise<{ ok: boolean; suggestion: string }> => {
    const issue = await step.runQuery(internal.triage.getIssue, {
      seedId: args.issueSeedId,
    });
    if (!issue) {
      return { ok: false, suggestion: "issue not found" };
    }

    const cached = (await step.runAction(internal.triage.runTriageCached, {
      issueSeedId: issue.seedId,
      title: issue.title,
      summary: issue.summary,
    })) as { suggestion: string };

    await step.runMutation(internal.triage.persistSuggestion, {
      seedId: issue.seedId,
      suggestion: cached.suggestion,
    });

    return { ok: true, suggestion: cached.suggestion };
  },
});

/** External entrypoint: rate-limited mutation that kicks off the workflow. */
export const startTriage = mutation({
  args: { issueSeedId: v.string() },
  returns: v.string(),
  handler: async (ctx, args): Promise<string> => {
    const { ok, retryAfter } = await rateLimiter.limit(ctx, "freellmCall", {
      key: "global",
    });
    if (!ok) {
      throw new Error(`Triage rate-limited; retry in ${retryAfter}ms`);
    }
    const handle: string = await workflow.start(
      ctx,
      internal.triage.triageWorkflow,
      { issueSeedId: args.issueSeedId },
    );
    return handle;
  },
});

export const getIssue = internalQuery({
  args: { seedId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("backlogIssues")
      .withIndex("by_seed_id", (q) => q.eq("seedId", args.seedId))
      .first();
  },
});

export const persistSuggestion = internalMutation({
  args: { seedId: v.string(), suggestion: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("backlogIssues")
      .withIndex("by_seed_id", (q) => q.eq("seedId", args.seedId))
      .first();
    if (!existing) return;
    await ctx.db.patch(existing._id, { triageSuggestion: args.suggestion });
  },
});

/** Cache wrapper invoked by the workflow. Hits FreeLLMAPI through the retrier. */
export const runTriageCached = internalAction({
  args: {
    issueSeedId: v.string(),
    title: v.string(),
    summary: v.string(),
  },
  returns: v.object({ suggestion: v.string() }),
  handler: async (ctx, args) => {
    return (await triageCache.fetch(ctx, args)) as { suggestion: string };
  },
});

/**
 * Underlying agent call. Wrapped by `triageCache` (cache key = its args).
 * Sandbox + Mastra integration lands in AGE-55; for now we synthesise a
 * deterministic suggestion so the pipeline runs end-to-end without the
 * external LLM dependency.
 */
export const runTriageAgentInternal = internalAction({
  args: {
    issueSeedId: v.string(),
    title: v.string(),
    summary: v.string(),
  },
  returns: v.object({ suggestion: v.string() }),
  handler: async (ctx, args) => {
    // Retry the simulated external call for AGE-62 demo; replace with a
    // Mastra agent invocation in AGE-55.
    await retrier.run(
      ctx,
      internal.triage.simulateExternalLatency,
      { jitter: 50 },
    );
    return {
      suggestion: `Route "${args.title}" to the planning room with risk:medium`,
    };
  },
});

/** Stand-in for the eventual Mastra agent call. */
export const simulateExternalLatency = internalAction({
  args: { jitter: v.number() },
  returns: v.null(),
  handler: async (_ctx, args) => {
    await new Promise((r) => setTimeout(r, args.jitter));
    return null;
  },
});

/**
 * Sandbox-spawn hook (called by the sandbox-runner Worker via Convex action
 * once AGE-55 lands). Increments the per-region command counter so the world
 * map can render heat without scanning every event row.
 */
export const recordSandboxSpawn = mutation({
  args: { regionSeedId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await regionCommandCounter.inc(ctx, args.regionSeedId);
    return null;
  },
});

export const sandboxSpawnsForRegion = query({
  args: { regionSeedId: v.string() },
  returns: v.number(),
  handler: async (ctx, args) => {
    return await regionCommandCounter.count(ctx, args.regionSeedId);
  },
});
