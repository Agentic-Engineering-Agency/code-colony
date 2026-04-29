import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { demoData } from "@/domain/demoData";
import { buildVersionProbe, runHealthCheckRequest, type CommandRunner } from "@/server/healthRouteCore";
import { buildRuntimeHealthProbe } from "@/server/runtimeHealthProbe";
import { buildConvexHealthProbe } from "@/server/convexHealthProbe";
import { createTtlMemo } from "@/server/ttlMemo";
import { jsonRouteResponse } from "@/server/routeResponse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const execFileAsync = promisify(execFile);
const defaultRunner: CommandRunner = async (file, args) => {
  const result = await execFileAsync(file, [...args], { encoding: "utf8" });
  return { stdout: result.stdout };
};

const HEALTH_TTL_MS = 5_000;
const HEALTH_TTL_SECONDS = Math.floor(HEALTH_TTL_MS / 1000);

const healthMemo = createTtlMemo(
  () => runHealthCheckRequest({
    probeGh: buildVersionProbe("gh", ["--version"], defaultRunner),
    probeGit: buildVersionProbe("git", ["--version"], defaultRunner),
    probeRuntime: buildRuntimeHealthProbe({ data: demoData }),
    probeConvex: buildConvexHealthProbe({ convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL }),
  }),
  { ttlMs: HEALTH_TTL_MS },
);

export async function GET() {
  const result = await healthMemo.get();
  return jsonRouteResponse(result.body, { status: result.status, cacheSeconds: HEALTH_TTL_SECONDS });
}
