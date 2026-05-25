import { describe, expect, it, vi } from "vitest";
import type { BacklogIssue } from "../src/domain/types";
import { runTriageWorkflowContract } from "../src/server/convexTriageWorkflowContract";

const issue: BacklogIssue = {
  id: "backlog-1",
  source: "github",
  externalRef: "#1",
  title: "Wire triage",
  summary: "Route the issue through the agent workflow.",
  suggestedRegionId: "runtime",
  status: "new",
};

describe("Convex triage workflow contract", () => {
  it("runs query, agent action, and persist mutation in order with mocks", async () => {
    const calls: string[] = [];
    const suggestion = {
      suggestedRegionId: "runtime",
      suggestedAgent: "operator",
      risk: "medium" as const,
      rationale: "Touches workflow execution.",
    };
    const result = await runTriageWorkflowContract("backlog-1", {
      getIssue: vi.fn(async () => {
        calls.push("query:getIssue");
        return issue;
      }),
      runAgent: vi.fn(async () => {
        calls.push("action:runAgent");
        return suggestion;
      }),
      persistSuggestion: vi.fn(async () => {
        calls.push("mutation:persistSuggestion");
      }),
    });

    expect(result).toEqual({ ok: true, suggestion });
    expect(calls).toEqual(["query:getIssue", "action:runAgent", "mutation:persistSuggestion"]);
  });

  it("does not call agent or persist when the issue is absent", async () => {
    const runAgent = vi.fn();
    const persistSuggestion = vi.fn();
    await expect(
      runTriageWorkflowContract("missing", {
        getIssue: async () => null,
        runAgent,
        persistSuggestion,
      }),
    ).resolves.toEqual({ ok: false, suggestion: "issue not found" });

    expect(runAgent).not.toHaveBeenCalled();
    expect(persistSuggestion).not.toHaveBeenCalled();
  });
});
