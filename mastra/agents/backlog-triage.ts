import { Agent } from "@mastra/core/agent";
import { openRouterModelConfig } from "../llm";
import { buildRunCommandTool, runCommandTool } from "../tools/runCommand";
import { SandboxClient } from "../sandboxClient";

/**
 * Backlog Triage agent: ingests a `BacklogIssue` (Linear / GitHub / manual)
 * and returns a structured suggestion the user can review before turning the
 * issue into a Code Colony job.
 *
 * Tools:
 *   - `runCommand` — AGE-55 sandbox-runner facade. Required in production
 *     (`NODE_ENV === "production"` throws on missing env so a misconfigured
 *     deploy is loud, not a degraded agent). In dev/test the tool is
 *     skipped with an explicit warning so the agent stays usable without
 *     a sandbox.
 */
function tools(): Record<string, ReturnType<typeof runCommandTool>> {
  const hasEnv =
    Boolean(process.env.SANDBOX_RUNNER_URL) &&
    Boolean(process.env.SANDBOX_HMAC_KEY);
  if (hasEnv) {
    return { runCommand: runCommandTool() };
  }
  if (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PHASE !== "phase-production-build"
  ) {
    throw new Error(
      "backlogTriageAgent: SANDBOX_RUNNER_URL and SANDBOX_HMAC_KEY must be set in production",
    );
  }
  console.warn(
    "[backlogTriageAgent] runCommand tool disabled: SANDBOX_RUNNER_URL or SANDBOX_HMAC_KEY unset (NODE_ENV != production)",
  );
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
    "`grep`, `npm ls`. Mutating commands and shell metacharacters",
    "(`;`, `&`, `|`, redirection, command substitution) are rejected.",
    "",
    "Given a single issue, return a strict JSON object with these fields:",
    '{ "suggestedRegionId": "hq" | "frontend" | "runtime" | "memory" | "testing" | "market",',
    '  "suggestedAgent": "architect" | "frontend" | "operator" | "curator" | "qa" | "sentinel",',
    '  "risk": "low" | "medium" | "high",',
    '  "rationale": string }',
    "",
    "Be concise. Do not invent fields. Do not wrap output in code fences.",
  ].join("\n"),
  model: openRouterModelConfig(),
  tools: tools(),
});

/** Re-export for callers that want to build their own agent with a fake sandbox. */
export { buildRunCommandTool, SandboxClient };
