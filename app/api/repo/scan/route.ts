import { demoData } from "@/domain/demoData";
import { runRepoScanRequest } from "@/server/repoRouteCore";
import { createKeyedTtlMemo } from "@/server/ttlMemo";
import { jsonRouteResponse } from "@/server/routeResponse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REPO_SCAN_TTL_MS = 3_000;
const REPO_SCAN_TTL_SECONDS = Math.floor(REPO_SCAN_TTL_MS / 1000);

const repoScanMemo = createKeyedTtlMemo<string, Awaited<ReturnType<typeof runRepoScanRequest>>>(
  (key) => runRepoScanRequest({
    searchParams: new URLSearchParams(key === "__default__" ? "" : `cwd=${key}`),
    data: demoData,
  }),
  { ttlMs: REPO_SCAN_TTL_MS },
);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const cwd = url.searchParams.get("cwd");
  const key = cwd ?? "__default__";
  const result = await repoScanMemo.get(key);
  return jsonRouteResponse(result.body, { status: result.status, cacheSeconds: REPO_SCAN_TTL_SECONDS });
}
