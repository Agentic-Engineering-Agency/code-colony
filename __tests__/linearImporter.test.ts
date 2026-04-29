import { describe, expect, it } from "vitest";
import { demoData } from "../src/domain/demoData";
import { mergeLinearBacklog, parseLinearIssuesJson } from "../src/domain/linearImporter";

describe("Linear backlog importer", () => {
  const arraySample = JSON.stringify([
    { identifier: "AE-301", title: "Render world map districts in PixiJS", description: "Replace CSS region nodes with a PixiJS scene.", labels: [{ name: "frontend" }] },
    { identifier: "AE-205", title: "Persist memory ledger to Convex", description: null, labels: [{ name: "memory" }] },
    { identifier: "AE-9", title: "QA pass on operation board", description: "Add coverage for ingest flow.", labels: [{ name: "qa" }, { name: "ci" }] },
    { identifier: 42, title: "Bad identifier", description: "skip" },
  ]);

  const wrappedSample = JSON.stringify({ issues: [
    { identifier: "AE-7", title: "Wire Oh My Pi worker", labels: [{ name: "runtime" }] },
  ] });

  it("parses Linear array output into BacklogIssue records", () => {
    const issues = parseLinearIssuesJson(arraySample);

    expect(issues.map((issue) => issue.externalRef)).toEqual(["AE-301", "AE-205", "AE-9"]);
    expect(issues[0].suggestedRegionId).toBe("frontend");
    expect(issues[1].suggestedRegionId).toBe("memory");
    expect(issues[1].summary).toBe("Persist memory ledger to Convex");
    expect(issues[2].suggestedRegionId).toBe("testing");
    expect(issues.every((issue) => issue.source === "linear" && issue.status === "new")).toBe(true);
  });

  it("accepts Linear MCP-style { issues: [...] } envelope", () => {
    const issues = parseLinearIssuesJson(wrappedSample);

    expect(issues).toHaveLength(1);
    expect(issues[0].externalRef).toBe("AE-7");
    expect(issues[0].suggestedRegionId).toBe("runtime");
  });

  it("returns an empty array on empty or malformed input", () => {
    expect(parseLinearIssuesJson("")).toEqual([]);
    expect(parseLinearIssuesJson("not json")).toEqual([]);
    expect(parseLinearIssuesJson("[null, 7, \"x\"]")).toEqual([]);
  });

  it("merges parsed issues into the backlog without duplicating known external refs", () => {
    const issues = parseLinearIssuesJson(arraySample);
    const first = mergeLinearBacklog(demoData, issues);

    expect(first.backlog.length).toBe(demoData.backlog.length + issues.length);
    expect(mergeLinearBacklog(first, issues)).toBe(first);
  });
});
