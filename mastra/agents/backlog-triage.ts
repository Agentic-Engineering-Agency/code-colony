import { Agent } from "@mastra/core/agent";
import { freeLLMModelConfig } from "../llm";

/**
 * Backlog Triage agent: ingests a `BacklogIssue` (Linear / GitHub / manual)
 * and returns a structured suggestion the user can review before turning the
 * issue into a Code Colony job.
 *
 * The agent is configured against the local FreeLLMAPI OpenAI-compatible
 * endpoint by default; override via env vars (`FREELLM_URL`, `FREELLM_MODEL_ID`,
 * `FREELLM_API_KEY`) or by editing the call site.
 */
export const backlogTriageAgent = new Agent({
  id: "backlog-triage",
  name: "Backlog Triage",
  instructions: [
    "You triage incoming backlog issues for Code Colony, a multiplayer AI",
    "company simulation. Each input issue belongs to one of these districts:",
    "hq, frontend, runtime, memory, testing, market.",
    "",
    "Given a single issue, return a strict JSON object with these fields:",
    '{ "suggestedRegionId": "hq" | "frontend" | "runtime" | "memory" | "testing" | "market",',
    '  "suggestedAgent": "architect" | "frontend" | "operator" | "curator" | "qa" | "sentinel",',
    '  "risk": "low" | "medium" | "high",',
    '  "rationale": string }',
    "",
    "Be concise. Do not invent fields. Do not wrap output in code fences.",
  ].join("\n"),
  model: freeLLMModelConfig(),
});
