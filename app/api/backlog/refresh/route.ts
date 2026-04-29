import { NextResponse } from "next/server";
import { demoData } from "@/domain/demoData";
import { runBacklogRefreshRequest } from "@/server/backlogRouteCore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_REPO = "Agentic-Engineering-Agency/code-colony";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const result = await runBacklogRefreshRequest({ searchParams: url.searchParams, data: demoData, defaultRepo: DEFAULT_REPO });
  return NextResponse.json(result.body, { status: result.status });
}
