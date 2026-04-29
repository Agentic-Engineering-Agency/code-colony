import { describe, expect, it } from "vitest";
import { demoData } from "../src/domain/demoData";
import { DEFAULT_RUNTIME_PREVIEW_REQUEST } from "../src/domain/runtime";
import { createSimulatedRuntimePreviewFetcher, createSubprocessRuntimePreviewFetcher } from "../src/server/runtimeFetchers";

describe("server runtime fetchers", () => {
  it("simulated fetcher returns the same result as runSimulatedRuntimePreview", async () => {
    const fetcher = createSimulatedRuntimePreviewFetcher(demoData);
    const result = await fetcher(DEFAULT_RUNTIME_PREVIEW_REQUEST);

    expect(result?.adapter).toBe("oh_my_pi");
    expect(result?.status).toBe("review");
    expect(result?.events.length).toBeGreaterThan(0);
    expect(result?.artifact?.title).toBe("Spec-to-Diff Preview Bundle");
  });

  it("subprocess fetcher passes worker request as positional args and parses stdout", async () => {
    const calls: { file: string; args: readonly string[] }[] = [];
    const stdout = JSON.stringify({ adapter: "oh_my_pi", status: "review", events: [{ type: "run.started", role: "system", content: "ok", timestamp: "00:00" }], artifact: null });
    const fetcher = createSubprocessRuntimePreviewFetcher("oh-my-pi", ["worker"], async (file, args) => {
      calls.push({ file, args });
      return { stdout };
    });

    const result = await fetcher({ jobId: "job-x", agentEmployeeId: "operator", specId: "spec-x" });

    expect(calls).toHaveLength(1);
    expect(calls[0].file).toBe("oh-my-pi");
    expect(calls[0].args).toEqual(["worker", "job-x", "operator", "spec-x"]);
    expect(result?.events).toHaveLength(1);
    expect(result?.events[0].content).toBe("ok");
  });

  it("subprocess fetcher returns null on runner failure or invalid JSON", async () => {
    const failing = createSubprocessRuntimePreviewFetcher("oh-my-pi", [], async () => { throw new Error("missing binary"); });
    expect(await failing(DEFAULT_RUNTIME_PREVIEW_REQUEST)).toBeNull();

    const malformed = createSubprocessRuntimePreviewFetcher("oh-my-pi", [], async () => ({ stdout: "not json" }));
    expect(await malformed(DEFAULT_RUNTIME_PREVIEW_REQUEST)).toBeNull();

    const wrongShape = createSubprocessRuntimePreviewFetcher("oh-my-pi", [], async () => ({ stdout: JSON.stringify({ adapter: "oh_my_pi", status: "queued" }) }));
    expect(await wrongShape(DEFAULT_RUNTIME_PREVIEW_REQUEST)).toBeNull();
  });
});
