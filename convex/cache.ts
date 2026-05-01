import { ActionCache } from "@convex-dev/action-cache";
import { components, internal } from "./_generated/api";

/**
 * Persistent TTL cache for the triage agent action. Cache keys are the
 * action's args (issue id + title + summary fingerprint), so identical
 * issues skip the model round-trip for 24h.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const triageCache: any = new ActionCache(components.actionCache, {
  action: internal.triage.runTriageAgentInternal,
  name: "triageAgent.v1",
  ttl: 1000 * 60 * 60 * 24,
});
