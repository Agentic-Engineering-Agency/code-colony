import { NextResponse } from "next/server";
import { demoData } from "@/domain/demoData";
import { runBacklogRefreshRequest } from "@/server/backlogRouteCore";
import { createKeyedTtlMemo } from "@/server/ttlMemo";
import { buildCacheControl } from "@/server/cacheControl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_REPO = "Agentic-Engineering-Agency/code-colony";
const BACKLOG_TTL_MS = 3_000;

const backlogRefreshMemo = createKeyedTtlMemo<string, Awaited<ReturnType<typeof runBacklogRefreshRequest>>>(
  (key) => runBacklogRefreshRequest({ searchParams: new URLSearchParams(key), data: demoData, defaultRepo: DEFAULT_REPO }),
  { ttlMs: BACKLOG_TTL_MS },
);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const key = new URLSearchParams({
    repo: url.searchParams.get("repo") ?? DEFAULT_REPO,
    source: url.searchParams.get("source") ?? "all",
  }).toString();
  const result = await backlogRefreshMemo.get(key);
  return NextResponse.json(result.body, {
    status: result.status,
    headers: { "Cache-Control": buildCacheControl(Math.floor(BACKLOG_TTL_MS / 1000)) },
  });
}
