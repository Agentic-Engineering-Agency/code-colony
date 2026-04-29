import { NextResponse } from "next/server";
import { demoData } from "@/domain/demoData";
import { DEFAULT_RUNTIME_PREVIEW_REQUEST, type RuntimeWorkerRequest } from "@/domain/runtime";
import { createSimulatedRuntimePreviewFetcher } from "@/server/runtimeFetchers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const workerRequest: RuntimeWorkerRequest = {
    jobId: url.searchParams.get("jobId") ?? DEFAULT_RUNTIME_PREVIEW_REQUEST.jobId,
    agentEmployeeId: url.searchParams.get("agentEmployeeId") ?? DEFAULT_RUNTIME_PREVIEW_REQUEST.agentEmployeeId,
    specId: url.searchParams.get("specId") ?? DEFAULT_RUNTIME_PREVIEW_REQUEST.specId,
  };
  const fetcher = createSimulatedRuntimePreviewFetcher(demoData);
  const result = await fetcher(workerRequest);
  if (!result) {
    return NextResponse.json({ error: "no preview available", request: workerRequest }, { status: 404 });
  }
  return NextResponse.json({ request: workerRequest, result });
}
