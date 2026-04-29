import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { NextResponse } from "next/server";
import { buildVersionProbe, runHealthCheckRequest, type CommandRunner } from "@/server/healthRouteCore";

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
  });
  return NextResponse.json(result.body, { status: result.status });
}
