/**
 * TanStack Start server function for `/api/runtime/preview`.
 *
 * Reuses `runRuntimePreviewRequest` so the same simulated runtime fetcher
 * powers both stacks. No memoisation: preview requests are intentionally
 * `no-store` because they reflect freshly-simulated worker output.
 */
import { createServerFn } from "@tanstack/react-start";

import { demoData } from "../../src/domain/demoData";
import {
  runRuntimePreviewRequest,
  type RuntimeRouteResponse,
} from "../../src/server/runtimeRouteCore";

export type RuntimePreviewInput = {
  jobId?: string;
  agentEmployeeId?: string;
  specId?: string;
};

export async function runRuntimePreviewServerHandler(
  input: RuntimePreviewInput = {},
): Promise<RuntimeRouteResponse> {
  const params = new URLSearchParams();
  if (input.jobId) params.set("jobId", input.jobId);
  if (input.agentEmployeeId) params.set("agentEmployeeId", input.agentEmployeeId);
  if (input.specId) params.set("specId", input.specId);
  return runRuntimePreviewRequest({ searchParams: params, data: demoData });
}

export const runtimePreviewServerFn = createServerFn({ method: "GET" })
  .inputValidator(
    (input: RuntimePreviewInput | undefined): RuntimePreviewInput => input ?? {},
  )
  .handler(async ({ data }) => runRuntimePreviewServerHandler(data));
