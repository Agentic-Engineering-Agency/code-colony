import { describe, expect, it } from "vitest";
import { isBacklogIssueLike, parseTriageOutput, runTriageRequest } from "../src/server/triageRouteCore";

const sampleIssue = {
  id: "backlog-test-1",
  source: "manual" as const,
  externalRef: "TEST-1",
  title: "Persist memory ledger to Convex",
  summary: "Define a memory provider abstraction and back it with a Convex schema.",
  suggestedRegionId: "memory",
  status: "new" as const,
};

const goodSuggestion = {
  suggestedRegionId: "memory",
  suggestedAgent: "curator",
  risk: "medium",
  rationale: "Memory ledger work routes to the curator in the memory district.",
};

describe("triage route core", () => {
  it("parseTriageOutput accepts strict JSON", () => {
    const parsed = parseTriageOutput(JSON.stringify(goodSuggestion));
    expect(parsed).toEqual(goodSuggestion);
  });

  it("parseTriageOutput strips ```json fences", () => {
    const fenced = "```json\n" + JSON.stringify(goodSuggestion) + "\n```";
    expect(parseTriageOutput(fenced)).toEqual(goodSuggestion);
  });

  it("parseTriageOutput rejects unknown regions / agents / risks", () => {
    expect(parseTriageOutput(JSON.stringify({ ...goodSuggestion, suggestedRegionId: "atlantis" }))).toBeNull();
    expect(parseTriageOutput(JSON.stringify({ ...goodSuggestion, suggestedAgent: "ghost" }))).toBeNull();
    expect(parseTriageOutput(JSON.stringify({ ...goodSuggestion, risk: "extreme" }))).toBeNull();
  });

  it("parseTriageOutput rejects malformed JSON", () => {
    expect(parseTriageOutput("not json")).toBeNull();
    expect(parseTriageOutput("{}")).toBeNull();
  });

  it("isBacklogIssueLike validates required fields", () => {
    expect(isBacklogIssueLike(sampleIssue)).toBe(true);
    expect(isBacklogIssueLike({ ...sampleIssue, id: 42 })).toBe(false);
    expect(isBacklogIssueLike(null)).toBe(false);
  });

  it("returns 400 on missing or malformed payload", async () => {
    const result1 = await runTriageRequest({ payload: null, runAgent: async () => ({ text: "" }) });
    expect(result1.status).toBe(400);

    const result2 = await runTriageRequest({ payload: { issue: { id: "x" } }, runAgent: async () => ({ text: "" }) });
    expect(result2.status).toBe(400);
  });

  it("returns 200 with the parsed suggestion when the agent emits valid JSON", async () => {
    const result = await runTriageRequest({
      payload: { issue: sampleIssue },
      runAgent: async () => ({ text: JSON.stringify(goodSuggestion) }),
    });
    expect(result.status).toBe(200);
    if (result.status !== 200) throw new Error("expected 200");
    expect(result.body.suggestion.suggestedRegionId).toBe("memory");
    expect(result.body.issue.id).toBe(sampleIssue.id);
  });

  it("returns 502 when the agent throws", async () => {
    const result = await runTriageRequest({
      payload: { issue: sampleIssue },
      runAgent: async () => { throw new Error("free LLM offline"); },
    });
    expect(result.status).toBe(502);
    if (result.status !== 502) throw new Error("expected 502");
    expect(result.body.error).toContain("free LLM offline");
  });

  it("returns 502 when the agent emits non-conforming output", async () => {
    const result = await runTriageRequest({
      payload: { issue: sampleIssue },
      runAgent: async () => ({ text: "I am not JSON, sorry." }),
    });
    expect(result.status).toBe(502);
    if (result.status !== 502) throw new Error("expected 502");
    expect(result.body.error).toBe("agent returned non-conforming output");
    expect(result.body.raw).toBe("I am not JSON, sorry.");
  });
});
