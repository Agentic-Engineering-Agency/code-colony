import { NextResponse } from "next/server";
import { demoData } from "@/domain/demoData";
import { refreshBacklogFromImporters } from "@/domain/backlogRefresh";
import { BACKLOG_REFRESH_SOURCES, buildBacklogFetchers, isBacklogRefreshSource } from "@/server/backlogSources";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_REPO = "Agentic-Engineering-Agency/code-colony";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const repo = url.searchParams.get("repo") ?? DEFAULT_REPO;
  const sourceParam = url.searchParams.get("source") ?? "all";
  if (!isBacklogRefreshSource(sourceParam)) {
    return NextResponse.json({ error: `unsupported source: ${sourceParam}`, allowed: BACKLOG_REFRESH_SOURCES }, { status: 400 });
  }
  const fetchers = buildBacklogFetchers(sourceParam, repo);
  const result = await refreshBacklogFromImporters(demoData, fetchers);
  return NextResponse.json({
    repo,
    source: sourceParam,
    report: result.report,
    backlog: result.data.backlog,
  });
}
