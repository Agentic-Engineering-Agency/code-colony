import { describe, expect, it } from "vitest";
import { demoData } from "../src/domain/demoData";
import { DEFAULT_RUNTIME_PREVIEW_REQUEST, appendRuntimeWorkerResult, createSimulatedRuntimeWorker, runSimulatedRuntimePreview } from "../src/domain/runtime";

describe("Simulated runtime worker", () => {
  it("replays seeded events for a known job", async () => {
    const worker = createSimulatedRuntimeWorker(demoData);
    expect(worker.adapter).toBe("oh_my_pi");

    const result = await worker.execute({ jobId: "job-spec-preview", agentEmployeeId: "operator", specId: "spec-preview" });

    expect(result.status).toBe("review");
    expect(result.events.map((event) => event.type)).toEqual(["run.started", "run.message", "run.tool_call", "run.artifact_created"]);
    expect(result.artifact?.title).toBe("Spec-to-Diff Preview Bundle");
  });

  it("returns a synthetic queued result when no run exists for the job", async () => {
    const worker = createSimulatedRuntimeWorker(demoData);
    const result = await worker.execute({ jobId: "job-unknown", agentEmployeeId: "operator", specId: "spec-preview" });

    expect(result.status).toBe("queued");
    expect(result.events).toHaveLength(1);
    expect(result.artifact).toBeNull();
  });

  it("appends worker output immutably onto demo data", async () => {
    const worker = createSimulatedRuntimeWorker(demoData);
    const result = await worker.execute({ jobId: "job-spec-preview", agentEmployeeId: "operator", specId: "spec-preview" });
    const before = demoData.events.length;

    const next = appendRuntimeWorkerResult(demoData, "run-preview", result);

    expect(next).not.toBe(demoData);
    expect(demoData.events).toHaveLength(before);
    expect(next.events.length).toBe(before + result.events.length);
    expect(next.runs.find((run) => run.id === "run-preview")?.status).toBe("review");
    expect(next.events.at(-1)?.runId).toBe("run-preview");
  });

  it("runSimulatedRuntimePreview returns the same shape the UI consumes for the default request", () => {
    const preview = runSimulatedRuntimePreview(demoData, DEFAULT_RUNTIME_PREVIEW_REQUEST);

    expect(preview.adapter).toBe("oh_my_pi");
    expect(preview.status).toBe("review");
    expect(preview.events.length).toBeGreaterThan(0);
    expect(preview.events.every((event) => typeof event.timestamp === "string")).toBe(true);
    expect(preview.artifact?.diff).toContain("+ export type RuntimeEvent");
  });

  it("re-running the worker after append still yields a coherent preview", async () => {
    const worker = createSimulatedRuntimeWorker(demoData);
    const first = await worker.execute(DEFAULT_RUNTIME_PREVIEW_REQUEST);
    const afterFirst = appendRuntimeWorkerResult(demoData, "run-preview", first);
    const secondWorker = createSimulatedRuntimeWorker(afterFirst);
    const second = await secondWorker.execute(DEFAULT_RUNTIME_PREVIEW_REQUEST);
    const afterSecond = appendRuntimeWorkerResult(afterFirst, "run-preview", second);

    expect(afterSecond.events.length).toBe(demoData.events.length + first.events.length + second.events.length);
    expect(afterSecond.events.filter((event) => event.runId === "run-preview").length).toBeGreaterThan(demoData.events.length);
    expect(runSimulatedRuntimePreview(afterSecond, DEFAULT_RUNTIME_PREVIEW_REQUEST).artifact?.title).toBe("Spec-to-Diff Preview Bundle");
  });
});
