import { RateLimiter, MINUTE, HOUR, DAY } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

/**
 * Centralised rate limit definitions. Keys are referenced by name from
 * `rateLimiter.limit(ctx, "<name>", { key })` in callsites.
 *
 * - `waitlistJoin`: one signup per email per 24h (`AGE-54`).
 * - `openrouterCall`: 60 calls per minute across all OpenRouter usage.
 * - `sandboxSpawn`: 30 sandbox spawns per minute per agent.
 */
export const rateLimiter = new RateLimiter(components.rateLimiter, {
  waitlistJoin: { kind: "fixed window", rate: 1, period: DAY },
  openrouterCall: { kind: "token bucket", rate: 60, period: MINUTE, capacity: 60 },
  sandboxSpawn: { kind: "token bucket", rate: 30, period: MINUTE, capacity: 30 },
  apiPerHour: { kind: "fixed window", rate: 1000, period: HOUR },
});
