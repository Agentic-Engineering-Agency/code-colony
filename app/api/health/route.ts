import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { NextResponse } from "next/server";
import { demoData } from "@/domain/demoData";
import { buildVersionProbe, runHealthCheckRequest, type CommandRunner } from "@/server/healthRouteCore";
import { buildRuntimeHealthProbe } from "@/server/runtimeHealthProbe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const execFileAsync = promisify(execFile);
const defaultRunner: CommandRunner = async (file, args) => {
  const result = await execFileAsync(file, [...args], { encoding: "utf8" });
  return { stdout: result.stdout };
};

export async function GET() {
  const result = await runHealthCheckRequest({
    probeGh: buildVersionProbe("gh", ["--version"], defaultRunner),
    probeGit: buildVersionProbe("git", ["--version"], defaultRunner),
    probeRuntime: buildRuntimeHealthProbe({ data: demoData }),
  });
  return NextResponse.json(result.body, { status: result.status });
}
