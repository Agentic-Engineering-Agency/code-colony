import type { HealthProbe } from "./healthRouteCore";

/**
 * Probe that pings the Convex deployment via its public HTTP query API and
 * reports availability. The probe runs the `system:ping` query which returns
 * `{ ok, now, backlogCount }` so a successful probe also tells us the schema
 * is loaded and the backlogIssues table is reachable.
 */
export type ConvexHealthProbeOptions = {
  convexUrl: string | undefined;
  /** Override fetch for tests. */
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
};

export function buildConvexHealthProbe({
  convexUrl,
  fetchImpl = fetch,
  timeoutMs = 2_500,
}: ConvexHealthProbeOptions): HealthProbe {
  return async () => {
    if (!convexUrl) {
      return { available: false, detail: "NEXT_PUBLIC_CONVEX_URL not set" };
    }
    const endpoint = `${convexUrl.replace(/\/$/, "")}/api/query`;
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "system:ping", args: {}, format: "json" }),
        signal: controller.signal,
      });
      if (!response.ok) {
        return { available: false, detail: `convex ${response.status}` };
      }
      const payload = (await response.json()) as { status?: string; value?: { ok: boolean; backlogCount: number } };
      if (payload.status !== "success" || !payload.value?.ok) {
        return { available: false, detail: `convex returned ${payload.status ?? "unexpected"}` };
      }
      return { available: true, detail: `convex \u00b7 ${payload.value.backlogCount} backlog rows` };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { available: false, detail: message };
    } finally {
      clearTimeout(timeoutHandle);
    }
  };
}
