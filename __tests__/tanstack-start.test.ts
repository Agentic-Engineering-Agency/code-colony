import { describe, expect, it } from "vitest";

import { runHealthCheckRequest } from "../src/server/healthRouteCore";
import {
  healthServerFn,
  runHealthServerHandler,
} from "../app/server/health";
import {
  mastraTriageServerFn,
  runMastraTriageServerHandler,
} from "../app/server/mastraTriage";
import {
  repoScanServerFn,
  runRepoScanServerHandler,
} from "../app/server/repoScan";
import {
  backlogRefreshServerFn,
} from "../app/server/backlogRefresh";
import {
  runtimePreviewServerFn,
} from "../app/server/runtimePreview";

/**
 * Smoke tests for the TanStack Start server-function migration (AGE-44).
 *
 * The TanStack server fns are thin wrappers over pure handlers exported from
 * the same module. Tests exercise the pure handlers (which return real values)
 * and assert that:
 *  1. Each `*ServerFn` is a fully-constructed TanStack Start server function
 *     (carries the `method` we declared).
 *  2. The health handler returns the same body shape as the existing
 *     `runHealthCheckRequest` core, so the parallel coexistence cannot drift.
 *  3. The mastra-triage stub keeps signalling that AGE-47 has not landed.
 */

describe("tanstack-start server functions", () => {
  it("each *ServerFn is registered with the correct HTTP method", () => {
    expect(healthServerFn.method).toBe("GET");
    expect(repoScanServerFn.method).toBe("GET");
    expect(runtimePreviewServerFn.method).toBe("GET");
    expect(backlogRefreshServerFn.method).toBe("GET");
    expect(mastraTriageServerFn.method).toBe("POST");
  });

  it("health handler returns the same body shape as runHealthCheckRequest", async () => {
    const expected = await runHealthCheckRequest({
      now: () => "2026-04-29T18:00:00.000Z",
      probeGh: async () => ({ available: true, detail: "gh 2.50.0" }),
      probeGit: async () => ({ available: true, detail: "git 2.45.1" }),
      probeRuntime: async () => ({ available: true, detail: "simulated worker" }),
      probeConvex: async () => ({ available: true, detail: "convex" }),
    });

    const actual = await runHealthServerHandler();
    expect(Object.keys(actual).sort()).toEqual(Object.keys(expected.body).sort());
    expect(Object.keys(actual.probes).sort()).toEqual(
      Object.keys(expected.body.probes).sort(),
    );
    expect(typeof actual.ok).toBe("boolean");
    expect(typeof actual.generatedAt).toBe("string");
  });

  it("repo scan handler returns the runRepoScanRequest discriminated shape", async () => {
    const result = await runRepoScanServerHandler({ cwd: "__no_such_path__" });
    expect(result.status === 200 || result.status === 502).toBe(true);
    if (result.status === 502) {
      expect(result.body.error).toBe("git ls-files unavailable");
    } else {
      expect(result.body.scan).toBeTruthy();
    }
  });

  it("mastra triage handler is still stubbed pending AGE-47", async () => {
    const result = await runMastraTriageServerHandler({ issueId: "AGE-1" });
    expect(result.status).toBe(503);
    expect(result.body.error).toBe("mastra-triage-stub");
    expect(result.body.pendingPullRequest).toBe(62);
    expect(result.body.expectedModulePath).toContain("mastraTriageRouteCore");
  });
});
