import { ShardedCounter } from "@convex-dev/sharded-counter";
import { components } from "./_generated/api";

/**
 * Per-region sandbox-spawn counter, sharded so high concurrency does not
 * trigger OCC retries. Region seedIds (e.g. "hq", "frontend-region") are
 * the key.
 *
 * Read with `regionCommandCounter.count(ctx, regionId)`,
 * write with `regionCommandCounter.inc(ctx, regionId)`.
 */
export const regionCommandCounter = new ShardedCounter<string>(
  components.shardedCounter,
  { defaultShards: 16 },
);
