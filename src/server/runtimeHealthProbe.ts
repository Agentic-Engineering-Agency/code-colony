import type { DemoData } from "../domain/types";
import { DEFAULT_RUNTIME_PREVIEW_REQUEST } from "../domain/runtime";
import { runRuntimePreviewRequest, type RuntimeRouteOptions } from "./runtimeRouteCore";
import type { HealthProbe } from "./healthRouteCore";

export type RuntimeHealthProbeOptions = {
  data: DemoData;
  fetcher?: RuntimeRouteOptions["fetcher"];
};

export function buildRuntimeHealthProbe({ data, fetcher }: RuntimeHealthProbeOptions): HealthProbe {
  return async () => {
    const params = new URLSearchParams({
      jobId: DEFAULT_RUNTIME_PREVIEW_REQUEST.jobId,
      agentEmployeeId: DEFAULT_RUNTIME_PREVIEW_REQUEST.agentEmployeeId,
      specId: DEFAULT_RUNTIME_PREVIEW_REQUEST.specId,
    });
    try {
      const response = await runRuntimePreviewRequest({ searchParams: params, data, fetcher });
      if (response.status === 200) {
        const eventCount = response.body.result.events.length;
        return { available: true, detail: `simulated worker · ${eventCount} event${eventCount === 1 ? "" : "s"}` };
      }
      return { available: false, detail: response.body.error };
    } catch (error) {
      return { available: false, detail: error instanceof Error ? error.message : String(error) };
    }
  };
}
