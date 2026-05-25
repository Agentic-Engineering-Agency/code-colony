import type { BacklogIssue } from "../domain/types";
import { postHog, type PostHogClient } from "../observability/posthog";

export type TriageSuggestion = {
  suggestedRegionId: string;
  suggestedAgent: string;
  risk: "low" | "medium" | "high";
  rationale: string;
};

export type TriageRouteSuccessBody = { issue: BacklogIssue; suggestion: TriageSuggestion };
export type TriageRouteErrorBody = { error: string; raw?: string };
export type TriageRouteResponse =
  | { status: 200; body: TriageRouteSuccessBody }
  | { status: 400; body: TriageRouteErrorBody }
  | { status: 502; body: TriageRouteErrorBody };

const ALLOWED_REGIONS = new Set(["hq", "frontend", "runtime", "memory", "testing", "market"]);
const ALLOWED_AGENTS = new Set(["architect", "frontend", "operator", "curator", "qa", "sentinel"]);
const ALLOWED_RISK = new Set(["low", "medium", "high"]);

export type RunAgent = (issue: BacklogIssue) => Promise<{ text?: string }>;

export function isBacklogIssueLike(value: unknown): value is BacklogIssue {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<BacklogIssue>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.source === "string" &&
    typeof candidate.externalRef === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.summary === "string" &&
    typeof candidate.suggestedRegionId === "string"
  );
}

export function parseTriageOutput(raw: string): TriageSuggestion | null {
  const trimmed = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const candidate = parsed as Partial<TriageSuggestion>;
  if (
    typeof candidate.suggestedRegionId !== "string" ||
    typeof candidate.suggestedAgent !== "string" ||
    typeof candidate.risk !== "string" ||
    typeof candidate.rationale !== "string"
  ) {
    return null;
  }
  if (!ALLOWED_REGIONS.has(candidate.suggestedRegionId)) return null;
  if (!ALLOWED_AGENTS.has(candidate.suggestedAgent)) return null;
  if (!ALLOWED_RISK.has(candidate.risk)) return null;
  return {
    suggestedRegionId: candidate.suggestedRegionId,
    suggestedAgent: candidate.suggestedAgent,
    risk: candidate.risk as TriageSuggestion["risk"],
    rationale: candidate.rationale,
  };
}

export type TriageRouteOptions = {
  payload: unknown;
  runAgent: RunAgent;
  telemetry?: PostHogClient;
};

export async function runTriageRequest({ payload, runAgent, telemetry = postHog }: TriageRouteOptions): Promise<TriageRouteResponse> {
  if (!payload || typeof payload !== "object") {
    return { status: 400, body: { error: "expected JSON body { issue: BacklogIssue }" } };
  }
  const { issue } = payload as { issue?: unknown };
  if (!isBacklogIssueLike(issue)) {
    return { status: 400, body: { error: "missing or malformed `issue` BacklogIssue" } };
  }

  let result: { text?: string };
  const startedAt = Date.now();
  await telemetry.capture({
    event: "agent_lifecycle_event",
    properties: {
      agent_id: "backlog-triage",
      lifecycle_status: "started",
      issue_id: issue.id,
      issue_source: issue.source,
      suggested_region_id: issue.suggestedRegionId,
    },
  });
  try {
    result = await runAgent(issue);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await telemetry.capture({
      event: "agent_lifecycle_event",
      properties: {
        agent_id: "backlog-triage",
        lifecycle_status: "failed",
        issue_id: issue.id,
        latency_ms: Date.now() - startedAt,
        error_message: message,
      },
    });
    return { status: 502, body: { error: `agent failed: ${message}` } };
  }

  const raw = (result.text ?? "").trim();
  const suggestion = parseTriageOutput(raw);
  if (!suggestion) {
    await telemetry.capture({
      event: "ai_observation",
      properties: {
        agent_id: "backlog-triage",
        issue_id: issue.id,
        status: "non_conforming_output",
        model_provider: "openrouter",
        model_id: process.env.OPENROUTER_MODEL_ID ?? "qwen/qwen3-coder:free",
        latency_ms: Date.now() - startedAt,
        input_tokens: null,
        output_tokens: null,
        estimated_cost_usd: null,
        output_length: raw.length,
      },
    });
    return { status: 502, body: { error: "agent returned non-conforming output", raw } };
  }
  await telemetry.capture({
    event: "ai_observation",
    properties: {
      agent_id: "backlog-triage",
      issue_id: issue.id,
      status: "completed",
      model_provider: "openrouter",
      model_id: process.env.OPENROUTER_MODEL_ID ?? "qwen/qwen3-coder:free",
      latency_ms: Date.now() - startedAt,
      input_tokens: null,
      output_tokens: null,
      estimated_cost_usd: null,
      output_length: raw.length,
      suggested_region_id: suggestion.suggestedRegionId,
      suggested_agent: suggestion.suggestedAgent,
      risk: suggestion.risk,
    },
  });
  return { status: 200, body: { issue, suggestion } };
}
