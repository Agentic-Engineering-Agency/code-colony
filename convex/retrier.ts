import { ActionRetrier } from "@convex-dev/action-retrier";
import { components } from "./_generated/api";

/**
 * Auto-retrying executor for flaky external calls — sandbox-runner exec,
 * FreeLLMAPI completions, and other network-bound actions.
 */
export const retrier = new ActionRetrier(components.actionRetrier, {
  initialBackoffMs: 500,
  base: 2,
  maxFailures: 4,
});
