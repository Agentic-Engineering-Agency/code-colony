import type { AgentRun, ArtifactBundle, DemoData, Id, RuntimeAdapter, RuntimeEvent } from "./types";

export type RuntimeWorkerRequest = { jobId: Id; agentEmployeeId: Id; specId: Id };
export type RuntimeWorkerEvent = Omit<RuntimeEvent, "id" | "runId">;
export type RuntimeWorkerArtifact = Omit<ArtifactBundle, "id" | "runId">;
export type RuntimeWorkerResult = { adapter: RuntimeAdapter; status: AgentRun["status"]; events: RuntimeWorkerEvent[]; artifact: RuntimeWorkerArtifact | null };

export type RuntimeWorker = {
  readonly adapter: RuntimeAdapter;
  describe(): string;
  execute(request: RuntimeWorkerRequest): Promise<RuntimeWorkerResult>;
};

function projectEvent(event: RuntimeEvent): RuntimeWorkerEvent {
  return { type: event.type, role: event.role, content: event.content, timestamp: event.timestamp };
}

function projectArtifact(bundle: ArtifactBundle): RuntimeWorkerArtifact {
  return { title: bundle.title, changedFiles: bundle.changedFiles, diff: bundle.diff, testResult: bundle.testResult, reviewerVerdicts: bundle.reviewerVerdicts, status: bundle.status };
}
export const DEFAULT_RUNTIME_PREVIEW_REQUEST: RuntimeWorkerRequest = { jobId: "job-spec-preview", agentEmployeeId: "operator", specId: "spec-preview" };

export const SIMULATED_RUNTIME_DESCRIPTION = "Simulated Oh My Pi runtime worker that replays seeded events; never mutates a real repository.";

export function runSimulatedRuntimePreview(data: DemoData, request: RuntimeWorkerRequest): RuntimeWorkerResult {
  const run = data.runs.find((candidate) => candidate.jobId === request.jobId && candidate.agentEmployeeId === request.agentEmployeeId);
  if (!run) {
    return {
      adapter: "oh_my_pi",
      status: "queued",
      events: [{ type: "run.started", role: "system", content: `No seeded run for job ${request.jobId}; producing synthetic queued state.`, timestamp: "00:00" }],
      artifact: null,
    };
  }
  const events = data.events.filter((event) => event.runId === run.id).map(projectEvent);
  const seededArtifact = data.artifacts.find((bundle) => bundle.runId === run.id);
  return { adapter: "oh_my_pi", status: run.status, events, artifact: seededArtifact ? projectArtifact(seededArtifact) : null };
}

export function createSimulatedRuntimeWorker(data: DemoData): RuntimeWorker {
  return {
    adapter: "oh_my_pi",
    describe() {
      return SIMULATED_RUNTIME_DESCRIPTION;
    },
    async execute(request) {
      return runSimulatedRuntimePreview(data, request);
    },
  };
}

export function appendRuntimeWorkerResult(data: DemoData, runId: Id, result: RuntimeWorkerResult): DemoData {
  const newEvents: RuntimeEvent[] = result.events.map((event, index) => ({ id: `${runId}-event-${index}-${event.type}`, runId, ...event }));
  const updatedRuns = data.runs.map((run) => (run.id === runId ? { ...run, status: result.status } : run));
  const incomingArtifact = result.artifact;
  let updatedArtifacts = data.artifacts;
  if (incomingArtifact) {
    const existing = data.artifacts.find((bundle) => bundle.runId === runId);
    updatedArtifacts = existing
      ? data.artifacts.map((bundle) => (bundle.runId === runId ? { ...existing, ...incomingArtifact } : bundle))
      : [...data.artifacts, { id: `${runId}-artifact`, runId, ...incomingArtifact }];
  }
  return { ...data, runs: updatedRuns, events: [...data.events, ...newEvents], artifacts: updatedArtifacts };
}
