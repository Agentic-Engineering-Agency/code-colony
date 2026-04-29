import { describe, expect, it } from "vitest";
import { demoData } from "../src/domain/demoData";
import { runBacklogRefreshRequest } from "../src/server/backlogRouteCore";
import type { BacklogRefreshSource } from "../src/server/backlogSources";

const githubJson = JSON.stringify([
  { number: 701, title: "Live GH issue", body: null, labels: [{ name: "frontend" }] },
]);
const linearJson = JSON.stringify([
  { identifier: "AE-701", title: "Live Linear issue", description: null, labels: [{ name: "memory" }] },
]);

const stubFetchersFactory = (mode: "ok" | "github-fails" | "linear-fails") => (source: BacklogRefreshSource) => ({
  fetchGithubIssuesJson: source === "github" || source === "all"
    ? async () => { if (mode === "github-fails") throw new Error("gh missing"); return githubJson; }
    : undefined,
  fetchLinearIssuesJson: source === "linear" || source === "all"
    ? async () => { if (mode === "linear-fails") throw new Error("linear unauthorized"); return linearJson; }
    : undefined,
});

describe("backlog refresh route core", () => {
  it("rejects unknown source values with 400 and allowed list", async () => {
    const response = await runBacklogRefreshRequest({ searchParams: new URLSearchParams("source=notion"), data: demoData, defaultRepo: "owner/repo" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "unsupported source: notion", allowed: ["github", "linear", "all"] });
  });

  it("returns merged backlog when both fetchers succeed", async () => {
    const response = await runBacklogRefreshRequest({ searchParams: new URLSearchParams("source=all"), data: demoData, defaultRepo: "owner/repo", fetchersFor: stubFetchersFactory("ok") });

    expect(response.status).toBe(200);
    if (response.status !== 200) throw new Error("expected 200");
    expect(response.body.report.githubAdded).toBe(1);
    expect(response.body.report.linearAdded).toBe(1);
    expect(response.body.report.errors).toEqual([]);
    expect(response.body.backlog.length).toBe(demoData.backlog.length + 2);
  });

  it("surfaces partial failure errors per-source without dropping the other importer", async () => {
    const response = await runBacklogRefreshRequest({ searchParams: new URLSearchParams("source=all"), data: demoData, defaultRepo: "owner/repo", fetchersFor: stubFetchersFactory("github-fails") });

    expect(response.status).toBe(200);
    if (response.status !== 200) throw new Error("expected 200");
    expect(response.body.report.githubAdded).toBe(0);
    expect(response.body.report.linearAdded).toBe(1);
    expect(response.body.report.errors).toEqual(["github: gh missing"]);
  });

  it("only invokes the requested source fetcher", async () => {
    const response = await runBacklogRefreshRequest({ searchParams: new URLSearchParams("source=linear"), data: demoData, defaultRepo: "owner/repo", fetchersFor: stubFetchersFactory("ok") });

    expect(response.status).toBe(200);
    if (response.status !== 200) throw new Error("expected 200");
    expect(response.body.source).toBe("linear");
    expect(response.body.report.githubAdded).toBe(0);
    expect(response.body.report.linearAdded).toBe(1);
  });
});
