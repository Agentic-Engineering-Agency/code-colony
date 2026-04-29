import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { NextResponse } from "next/server";
import { demoData } from "@/domain/demoData";
import { buildVersionProbe, runHealthCheckRequest, type CommandRunner } from "@/server/healthRouteCore";
import { buildRuntimeHealthProbe } from "@/server/runtimeHealthProbe";
import { createTtlMemo } from "@/server/ttlMemo";
import { buildCacheControl } from "@/server/cacheControl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const execFileAsync = promisify(execFile);
const defaultRunner: CommandRunner = async (file, args) => {
  const result = await execFileAsync(file, [...args], { encoding: "utf8" });
  return { stdout: result.stdout };
};

const HEALTH_TTL_MS = 5_000;

const healthMemo = createTtlMemo(
  () => runHealthCheckRequest({
    probeGh: buildVersionProbe("gh", ["--version"], defaultRunner),
    probeGit: buildVersionProbe("git", ["--version"], defaultRunner),
    probeRuntime: buildRuntimeHealthProbe({ data: demoData }),
  }),
  { ttlMs: HEALTH_TTL_MS },
);

export async function GET() {
  const result = await healthMemo.get();
  return NextResponse.json(result.body, {
    status: result.status,
    headers: { "Cache-Control": buildCacheControl(Math.floor(HEALTH_TTL_MS / 1000)) },
  });
}
