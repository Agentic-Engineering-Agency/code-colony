import type { DemoData } from "../domain/types";
import { DEFAULT_RUNTIME_PREVIEW_REQUEST, type RuntimeWorkerRequest, type RuntimeWorkerResult } from "../domain/runtime";
import { postHog, type PostHogClient } from "../observability/posthog";
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
  telemetry?: PostHogClient;
};

export async function runRuntimePreviewRequest({ searchParams, data, fetcher, telemetry = postHog }: RuntimeRouteOptions): Promise<RuntimeRouteResponse> {
  const request: RuntimeWorkerRequest = {
    jobId: searchParams.get("jobId") ?? DEFAULT_RUNTIME_PREVIEW_REQUEST.jobId,
    agentEmployeeId: searchParams.get("agentEmployeeId") ?? DEFAULT_RUNTIME_PREVIEW_REQUEST.agentEmployeeId,
    specId: searchParams.get("specId") ?? DEFAULT_RUNTIME_PREVIEW_REQUEST.specId,
  };
  const resolvedFetcher = fetcher ?? createSimulatedRuntimePreviewFetcher(data);
  const result = await resolvedFetcher(request);
  if (!result) {
    await telemetry.capture({
      event: "workflow_event",
      properties: {
        workflow_name: "runtime_preview",
        workflow_status: "missing_result",
        job_id: request.jobId,
        agent_employee_id: request.agentEmployeeId,
        spec_id: request.specId,
      },
    });
    return { status: 404, body: { error: "no preview available", request } };
  }
  await telemetry.capture({
    event: "workflow_event",
    properties: {
      workflow_name: "runtime_preview",
      workflow_status: result.status,
      job_id: request.jobId,
      agent_employee_id: request.agentEmployeeId,
      spec_id: request.specId,
      runtime_adapter: result.adapter,
      artifact_created: Boolean(result.artifact),
      event_count: result.events.length,
    },
  });
  return { status: 200, body: { request, result } };
}
