import { Debouncer } from "@ikhrustalev/convex-debouncer";
import { components } from "./_generated/api";

/**
 * Server-side debouncing for expensive operations (LLM calls, metrics
 * recomputation, etc.). Sliding mode resets the timer on each call.
 *
 * TODO(AGE-63): tune delay and mode per callsite.
 */
export const debouncer = new Debouncer(components.debouncer, {
  delay: 5000,
  mode: "sliding",
});
