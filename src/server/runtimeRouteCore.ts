import type { DemoData } from "../domain/types";
import { DEFAULT_RUNTIME_PREVIEW_REQUEST, type RuntimeWorkerRequest, type RuntimeWorkerResult } from "../domain/runtime";
import { createSimulatedRuntimePreviewFetcher, type RuntimePreviewFetcher } from "./runtimeFetchers";

export type RuntimeRouteSuccessBody = { request: RuntimeWorkerRequest; result: RuntimeWorkerResult };
export type RuntimeRouteErrorBody = { error: string; request: RuntimeWorkerRequest };
export type RuntimeRouteResponse =
  | { status: 200; body: RuntimeRouteSuccessBody }
  | { status: 404; body: RuntimeRouteErrorBody };

export type RuntimeRouteOptions = {
  searchParams: URLSearchParams;
  data: DemoData;
  fetcher?: RuntimePreviewFetcher;
};

export async function runRuntimePreviewRequest({ searchParams, data, fetcher }: RuntimeRouteOptions): Promise<RuntimeRouteResponse> {
  const request: RuntimeWorkerRequest = {
    jobId: searchParams.get("jobId") ?? DEFAULT_RUNTIME_PREVIEW_REQUEST.jobId,
    agentEmployeeId: searchParams.get("agentEmployeeId") ?? DEFAULT_RUNTIME_PREVIEW_REQUEST.agentEmployeeId,
    specId: searchParams.get("specId") ?? DEFAULT_RUNTIME_PREVIEW_REQUEST.specId,
  };
  const resolvedFetcher = fetcher ?? createSimulatedRuntimePreviewFetcher(data);
  const result = await resolvedFetcher(request);
  if (!result) {
    return { status: 404, body: { error: "no preview available", request } };
  }
  return { status: 200, body: { request, result } };
}
