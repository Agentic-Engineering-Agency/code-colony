import { describe, expect, it } from "vitest";
import { demoData } from "../src/domain/demoData";
import { refreshBacklogFromImporters } from "../src/domain/backlogRefresh";

describe("refreshBacklogFromImporters", () => {
  const githubJson = JSON.stringify([
    { number: 501, title: "GH ingest 1", body: null, labels: [{ name: "frontend" }] },
    { number: 502, title: "GH ingest 2", body: null, labels: [{ name: "runtime" }] },
  ]);
  const linearJson = JSON.stringify([
    { identifier: "AE-901", title: "Linear ingest 1", description: null, labels: [{ name: "memory" }] },
  ]);

  it("merges output from both fetchers and reports new counts", async () => {
    const result = await refreshBacklogFromImporters(demoData, {
      fetchGithubIssuesJson: async () => githubJson,
      fetchLinearIssuesJson: async () => linearJson,
    });

    expect(result.report.githubAdded).toBe(2);
    expect(result.report.linearAdded).toBe(1);
    expect(result.report.errors).toEqual([]);
    expect(result.data.backlog.length).toBe(demoData.backlog.length + 3);
    expect(demoData.backlog.length).toBe(3);
  });

  it("captures fetcher failures without aborting other importers", async () => {
    const result = await refreshBacklogFromImporters(demoData, {
      fetchGithubIssuesJson: async () => { throw new Error("rate limited"); },
      fetchLinearIssuesJson: async () => linearJson,
    });

    expect(result.report.githubAdded).toBe(0);
    expect(result.report.linearAdded).toBe(1);
    expect(result.report.errors).toEqual(["github: rate limited"]);
  });

  it("treats null fetcher output as no-op", async () => {
    const result = await refreshBacklogFromImporters(demoData, {
      fetchGithubIssuesJson: async () => null,
    });

    expect(result.data).toBe(demoData);
    expect(result.report.githubAdded).toBe(0);
    expect(result.report.linearAdded).toBe(0);
  });

  it("is idempotent across consecutive runs with the same input", async () => {
    const fetchers = { fetchGithubIssuesJson: async () => githubJson };
    const first = await refreshBacklogFromImporters(demoData, fetchers);
    const second = await refreshBacklogFromImporters(first.data, fetchers);

    expect(first.report.githubAdded).toBe(2);
    expect(second.report.githubAdded).toBe(0);
    expect(second.data).toBe(first.data);
  });
});
