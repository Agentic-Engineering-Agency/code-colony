/**
 * TanStack Start server function for `/api/health`.
 *
 * Reuses the same pure core (`runHealthCheckRequest`) as the Next.js route
 * handler in `app/api/health/route.ts`. The TTL memoisation is deliberately
 * NOT shared between the two stacks: per-stack memos avoid leaking state
 * across the parallel-coexistence boundary.
 *
 * The handler body is also exported as `runHealthServerHandler` so tests can
 * exercise it directly without spinning up the TanStack RPC plumbing.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { createServerFn } from "@tanstack/react-start";

import { demoData } from "../../src/domain/demoData";
import {
  buildVersionProbe,
  runHealthCheckRequest,
  type CommandRunner,
  type HealthSummary,
} from "../../src/server/healthRouteCore";
import { buildRuntimeHealthProbe } from "../../src/server/runtimeHealthProbe";
import { buildConvexHealthProbe } from "../../src/server/convexHealthProbe";
import { createTtlMemo } from "../../src/server/ttlMemo";

const execFileAsync = promisify(execFile);
const defaultRunner: CommandRunner = async (file, args) => {
  const result = await execFileAsync(file, [...args], { encoding: "utf8" });
  return { stdout: result.stdout };
};

const HEALTH_TTL_MS = 5_000;

const healthMemo = createTtlMemo(
  () =>
    runHealthCheckRequest({
      probeGh: buildVersionProbe("gh", ["--version"], defaultRunner),
      probeGit: buildVersionProbe("git", ["--version"], defaultRunner),
      probeRuntime: buildRuntimeHealthProbe({ data: demoData }),
      probeConvex: buildConvexHealthProbe({ convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL }),
    }),
  { ttlMs: HEALTH_TTL_MS },
);

export async function runHealthServerHandler(): Promise<HealthSummary> {
  const result = await healthMemo.get();
  return result.body;
}

export const healthServerFn = createServerFn({ method: "GET" }).handler(
  runHealthServerHandler,
);
