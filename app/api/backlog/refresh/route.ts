import { NextResponse } from "next/server";
import { demoData } from "@/domain/demoData";
import { refreshBacklogFromImporters } from "@/domain/backlogRefresh";
import { createGithubIssuesFetcher } from "@/server/backlogFetchers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_REPO = "Agentic-Engineering-Agency/code-colony";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const repo = url.searchParams.get("repo") ?? DEFAULT_REPO;
  const result = await refreshBacklogFromImporters(demoData, {
    fetchGithubIssuesJson: createGithubIssuesFetcher(repo),
  });
  return NextResponse.json({
    repo,
    report: result.report,
    backlog: result.data.backlog,
  });
}
