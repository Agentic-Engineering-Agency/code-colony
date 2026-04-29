import { demoData } from "@/domain/demoData";
import { runRuntimePreviewRequest } from "@/server/runtimeRouteCore";
import { jsonRouteResponse } from "@/server/routeResponse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const result = await runRuntimePreviewRequest({ searchParams: url.searchParams, data: demoData });
  return jsonRouteResponse(result.body, { status: result.status, cacheSeconds: -1 });
}
