import { Agent } from "@mastra/core/agent";
import { freeLLMModelConfig } from "../llm";
import { buildRunCommandTool, runCommandTool } from "../tools/runCommand";
import { SandboxClient } from "../sandboxClient";

/**
 * Backlog Triage agent: ingests a `BacklogIssue` (Linear / GitHub / manual)
 * and returns a structured suggestion the user can review before turning the
 * issue into a Code Colony job.
 *
 * The agent is configured against the local FreeLLMAPI OpenAI-compatible
 * endpoint by default; override via env vars (`FREELLM_URL`, `FREELLM_MODEL_ID`,
 * `FREELLM_API_KEY`) or by editing the call site.
 *
 * Tools:
 *   - `runCommand` — AGE-55 sandbox-runner facade. Wired only when both
 *     `SANDBOX_RUNNER_URL` and `SANDBOX_HMAC_KEY` are set, so dev/test
 *     environments without a sandbox stay agent-functional.
 */
function tools(): Record<string, ReturnType<typeof runCommandTool>> {
  if (process.env.SANDBOX_RUNNER_URL && process.env.SANDBOX_HMAC_KEY) {
    return { runCommand: runCommandTool() };
  }
  return {};
}

export const backlogTriageAgent = new Agent({
  id: "backlog-triage",
  name: "Backlog Triage",
  instructions: [
    "You triage incoming backlog issues for Code Colony, a multiplayer AI",
    "company simulation. Each input issue belongs to one of these districts:",
    "hq, frontend, runtime, memory, testing, market.",
    "",
    "When a `runCommand` tool is available, you may call it to inspect the",
    "repo before answering: `git status`, `git diff --stat`, `ls`, `cat`,",
    "`grep`, `npm ls`, etc. Mutating commands are rejected.",
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
  tools: tools(),
});

/** Re-export for callers that want to build their own agent with a fake sandbox. */
export { buildRunCommandTool, SandboxClient };
