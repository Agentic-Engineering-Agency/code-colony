import { describe, expect, it } from "vitest";
import { BACKLOG_REFRESH_SOURCES, buildBacklogFetchers, isBacklogRefreshSource } from "../src/server/backlogSources";

describe("backlog source filter", () => {
  it("recognises only the documented sources", () => {
    expect(BACKLOG_REFRESH_SOURCES).toEqual(["github", "linear", "all"]);
    expect(isBacklogRefreshSource("github")).toBe(true);
    expect(isBacklogRefreshSource("linear")).toBe(true);
    expect(isBacklogRefreshSource("all")).toBe(true);
    expect(isBacklogRefreshSource("notion")).toBe(false);
    expect(isBacklogRefreshSource("")).toBe(false);
  });

  it("only attaches the github fetcher for source=github", () => {
    const fetchers = buildBacklogFetchers("github", "owner/repo");
    expect(typeof fetchers.fetchGithubIssuesJson).toBe("function");
    expect(fetchers.fetchLinearIssuesJson).toBeUndefined();
  });

  it("only attaches the linear fetcher for source=linear", () => {
    const fetchers = buildBacklogFetchers("linear", "owner/repo");
    expect(fetchers.fetchGithubIssuesJson).toBeUndefined();
    expect(typeof fetchers.fetchLinearIssuesJson).toBe("function");
  });

  it("attaches both fetchers for source=all", () => {
    const fetchers = buildBacklogFetchers("all", "owner/repo");
    expect(typeof fetchers.fetchGithubIssuesJson).toBe("function");
    expect(typeof fetchers.fetchLinearIssuesJson).toBe("function");
  });

  it("uses injected factories when provided", () => {
    const calls: string[] = [];
    const fetchers = buildBacklogFetchers("all", "owner/repo", {
      github: () => { calls.push("github"); return async () => "[]"; },
      linear: () => { calls.push("linear"); return async () => "[]"; },
    });
    expect(calls).toEqual(["github", "linear"]);
    expect(fetchers.fetchGithubIssuesJson).toBeDefined();
    expect(fetchers.fetchLinearIssuesJson).toBeDefined();
  });
});
