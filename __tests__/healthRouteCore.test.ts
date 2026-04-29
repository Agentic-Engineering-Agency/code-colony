import { describe, expect, it } from "vitest";
import { buildVersionProbe, runHealthCheckRequest } from "../src/server/healthRouteCore";

describe("health route core", () => {
  it("reports ok when all probes succeed", async () => {
    const response = await runHealthCheckRequest({
      now: () => "2026-04-29T18:00:00.000Z",
      probeGh: async () => ({ available: true, detail: "gh 2.50.0" }),
      probeGit: async () => ({ available: true, detail: "git 2.45.1" }),
      probeRuntime: async () => ({ available: true, detail: "simulated worker" }),
      probeConvex: async () => ({ available: true, detail: "convex \u00b7 3 backlog rows" }),
    });

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.generatedAt).toBe("2026-04-29T18:00:00.000Z");
    expect(response.body.probes.gh.detail).toBe("gh 2.50.0");
  });

  it("reports not-ok when any probe is unavailable", async () => {
    const response = await runHealthCheckRequest({
      probeGh: async () => ({ available: false, detail: "command not found: gh" }),
      probeGit: async () => ({ available: true }),
      probeRuntime: async () => ({ available: true }),
      probeConvex: async () => ({ available: true }),
    });

    expect(response.body.ok).toBe(false);
    expect(response.body.probes.gh.available).toBe(false);
    expect(response.body.probes.gh.detail).toBe("command not found: gh");
  });

  it("falls back to defaults when probes are omitted: gh git convex unavailable, runtime simulated", async () => {
    const response = await runHealthCheckRequest();

    expect(response.body.probes.gh.available).toBe(false);
    expect(response.body.probes.git.available).toBe(false);
    expect(response.body.probes.runtime.available).toBe(true);
    expect(response.body.probes.convex.available).toBe(false);
    expect(response.body.ok).toBe(false);
  });

  it("buildVersionProbe captures the first line of stdout when the runner succeeds", async () => {
    const probe = buildVersionProbe("gh", ["--version"], async () => ({ stdout: "gh version 2.50.0 (2026-01-01)\nhttps://example\n" }));
    expect(await probe()).toEqual({ available: true, detail: "gh version 2.50.0 (2026-01-01)" });
  });

  it("buildVersionProbe surfaces error message when the runner throws", async () => {
    const probe = buildVersionProbe("gh", ["--version"], async () => { throw new Error("missing binary"); });
    expect(await probe()).toEqual({ available: false, detail: "missing binary" });
  });
});
