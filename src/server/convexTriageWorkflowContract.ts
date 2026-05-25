import type { BacklogIssue } from "../domain/types";
import type { TriageSuggestion } from "./triageRouteCore";

export type TriageWorkflowDeps = {
  getIssue(seedId: string): Promise<BacklogIssue | null>;
  runAgent(issue: BacklogIssue): Promise<TriageSuggestion>;
  persistSuggestion(seedId: string, suggestion: TriageSuggestion): Promise<void>;
};

export type TriageWorkflowContractResult =
  | { ok: true; suggestion: TriageSuggestion }
  | { ok: false; suggestion: "issue not found" };

export async function runTriageWorkflowContract(
  issueSeedId: string,
  deps: TriageWorkflowDeps,
): Promise<TriageWorkflowContractResult> {
  const issue = await deps.getIssue(issueSeedId);
  if (!issue) {
    return { ok: false, suggestion: "issue not found" };
  }

  const suggestion = await deps.runAgent(issue);
  await deps.persistSuggestion(issue.id, suggestion);
  return { ok: true, suggestion };
}
