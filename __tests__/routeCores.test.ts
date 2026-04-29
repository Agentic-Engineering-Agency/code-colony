import { describe, expect, it } from "vitest";
import { demoData } from "../src/domain/demoData";
import { runRuntimePreviewRequest } from "../src/server/runtimeRouteCore";
import { runRepoScanRequest } from "../src/server/repoRouteCore";

describe("runtime preview route core", () => {
  it("returns 200 with the simulated worker result for the seeded job", async () => {
    const response = await runRuntimePreviewRequest({ searchParams: new URLSearchParams(), data: demoData });

    expect(response.status).toBe(200);
    if (response.status !== 200) throw new Error("expected 200");
    expect(response.body.request.jobId).toBe("job-spec-preview");
    expect(response.body.result.status).toBe("review");
    expect(response.body.result.events.length).toBeGreaterThan(0);
  });

  it("respects query overrides for jobId / agentEmployeeId / specId and 404s on missing run", async () => {
    const response = await runRuntimePreviewRequest({
      searchParams: new URLSearchParams("jobId=job-x&agentEmployeeId=operator&specId=spec-x"),
      data: demoData,
      fetcher: async () => null,
    });

    expect(response.status).toBe(404);
    if (response.status !== 404) throw new Error("expected 404");
    expect(response.body.error).toBe("no preview available");
    expect(response.body.request).toEqual({ jobId: "job-x", agentEmployeeId: "operator", specId: "spec-x" });
  });

  it("uses the injected fetcher result when provided", async () => {
    const response = await runRuntimePreviewRequest({
      searchParams: new URLSearchParams(),
      data: demoData,
      fetcher: async () => ({ adapter: "oh_my_pi", status: "done", events: [{ type: "run.completed", role: "system", content: "ok", timestamp: "01:00" }], artifact: null }),
    });

    expect(response.status).toBe(200);
    if (response.status !== 200) throw new Error("expected 200");
    expect(response.body.result.status).toBe("done");
    expect(response.body.result.events[0].content).toBe("ok");
  });
});

describe("repo scan route core", () => {
  it("returns 502 when the git fetcher cannot produce a listing", async () => {
    const response = await runRepoScanRequest({ searchParams: new URLSearchParams("cwd=/tmp/missing"), data: demoData, fetcher: async () => null });

    expect(response.status).toBe(502);
    if (response.status !== 502) throw new Error("expected 502");
    expect(response.body.error).toBe("git ls-files unavailable");
    expect(response.body.cwd).toBe("/tmp/missing");
  });

  it("returns a live_scan with the supplied generatedAt and the listed paths", async () => {
    const response = await runRepoScanRequest({
      searchParams: new URLSearchParams(),
      data: demoData,
      now: () => "2026-04-29T15:00:00.000Z",
      fetcher: async () => ["app/page.tsx", "src/domain/types.ts"],
    });

    expect(response.status).toBe(200);
    if (response.status !== 200) throw new Error("expected 200");
    expect(response.body.cwd).toBeNull();
    expect(response.body.scan.source).toBe("live_scan");
    expect(response.body.scan.generatedAt).toBe("2026-04-29T15:00:00.000Z");
    expect(response.body.scan.totalFiles).toBe(2);
  });
});
