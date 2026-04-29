import type { BacklogIssue } from "../domain/types";

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
};

export async function runTriageRequest({ payload, runAgent }: TriageRouteOptions): Promise<TriageRouteResponse> {
  if (!payload || typeof payload !== "object") {
    return { status: 400, body: { error: "expected JSON body { issue: BacklogIssue }" } };
  }
  const { issue } = payload as { issue?: unknown };
  if (!isBacklogIssueLike(issue)) {
    return { status: 400, body: { error: "missing or malformed `issue` BacklogIssue" } };
  }

  let result: { text?: string };
  try {
    result = await runAgent(issue);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { status: 502, body: { error: `agent failed: ${message}` } };
  }

  const raw = (result.text ?? "").trim();
  const suggestion = parseTriageOutput(raw);
  if (!suggestion) {
    return { status: 502, body: { error: "agent returned non-conforming output", raw } };
  }
  return { status: 200, body: { issue, suggestion } };
}
