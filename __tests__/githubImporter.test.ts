import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { demoData } from "../src/domain/demoData";
import { mergeGithubBacklog, parseGithubIssuesJson, suggestRegionFromLabels } from "../src/domain/githubImporter";

describe("GitHub backlog importer", () => {
  const sample = JSON.stringify([
    { number: 42, title: "Render world map districts in PixiJS", body: "Replace the React/CSS map with PixiJS while preserving district colors.", labels: [{ name: "frontend" }, { name: "performance" }] },
    { number: 17, title: "Wire real Oh My Pi worker", body: "Implement OhMyPiWorker against RuntimeWorker.", labels: [{ name: "runtime" }] },
    { number: 9, title: "No labels issue", body: null, labels: [] },
    { number: "bad", title: "Invalid number", body: "skip" },
  ]);

  it("parses gh issue list JSON into BacklogIssue records", () => {
    const issues = parseGithubIssuesJson(sample);

    expect(issues.map((issue) => issue.externalRef)).toEqual(["#42", "#17", "#9"]);
    expect(issues[0].suggestedRegionId).toBe("frontend");
    expect(issues[1].suggestedRegionId).toBe("runtime");
    expect(issues[2].suggestedRegionId).toBe("hq");
    expect(issues[2].summary).toBe(issues[2].title);
    expect(issues.every((issue) => issue.status === "new" && issue.source === "github")).toBe(true);
  });

  it("returns an empty array on empty or malformed input", () => {
    expect(parseGithubIssuesJson("")).toEqual([]);
    expect(parseGithubIssuesJson("not json")).toEqual([]);
    expect(parseGithubIssuesJson("{}")).toEqual([]);
  });

  it("merges parsed issues into the backlog without duplicating known external refs", () => {
    const issues = parseGithubIssuesJson(sample);
    const first = mergeGithubBacklog(demoData, issues);

    expect(first.backlog.length).toBe(demoData.backlog.length + issues.length);
    expect(mergeGithubBacklog(first, issues)).toBe(first);
  });

  it("classifies labels into regions deterministically", () => {
    expect(suggestRegionFromLabels(["UI"])).toBe("frontend");
    expect(suggestRegionFromLabels(["infra", "deploy"])).toBe("runtime");
    expect(suggestRegionFromLabels(["MCP server"])).toBe("market");
    expect(suggestRegionFromLabels([])).toBe("hq");
  });

  it("imports the live GitHub issue list when gh is authenticated", () => {
    const repoRoot = resolve(__dirname, "..");
    if (!existsSync(resolve(repoRoot, ".git"))) return;
    let stdout: string;
    try {
      stdout = execFileSync("gh", ["issue", "list", "--repo", "Agentic-Engineering-Agency/code-colony", "--state", "open", "--json", "number,title,body,labels", "--limit", "100"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    } catch {
      return;
    }
    const issues = parseGithubIssuesJson(stdout);
    expect(Array.isArray(issues)).toBe(true);
    issues.forEach((issue) => {
      expect(issue.source).toBe("github");
      expect(issue.externalRef.startsWith("#")).toBe(true);
    });
  });
});
