import { NextResponse } from "next/server";
import { demoData } from "@/domain/demoData";
import { runRuntimePreviewRequest } from "@/server/runtimeRouteCore";
import { buildCacheControl } from "@/server/cacheControl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const result = await runRuntimePreviewRequest({ searchParams: url.searchParams, data: demoData });
  return NextResponse.json(result.body, {
    status: result.status,
    headers: { "Cache-Control": buildCacheControl(-1) },
  });
}
