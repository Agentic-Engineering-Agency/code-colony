import { NextResponse } from "next/server";
import { demoData } from "@/domain/demoData";
import { runRepoScanRequest } from "@/server/repoRouteCore";
import { createKeyedTtlMemo } from "@/server/ttlMemo";
import { buildCacheControl } from "@/server/cacheControl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REPO_SCAN_TTL_MS = 3_000;

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
  return NextResponse.json(result.body, {
    status: result.status,
    headers: { "Cache-Control": buildCacheControl(Math.floor(REPO_SCAN_TTL_MS / 1000)) },
  });
}
