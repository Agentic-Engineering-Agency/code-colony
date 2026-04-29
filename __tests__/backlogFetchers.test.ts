import { describe, expect, it } from "vitest";
import { createGithubIssuesFetcher, createLinearIssuesFetcher } from "../src/server/backlogFetchers";

describe("server backlog fetchers", () => {
  it("createGithubIssuesFetcher passes the right repo args and returns stdout", async () => {
    const calls: { file: string; args: readonly string[] }[] = [];
    const fetcher = createGithubIssuesFetcher("owner/example", async (file, args) => {
      calls.push({ file, args });
      return { stdout: "[]" };
    });
    const result = await fetcher();

    expect(result).toBe("[]");
    expect(calls).toHaveLength(1);
    expect(calls[0].file).toBe("gh");
    expect(calls[0].args).toEqual(["issue", "list", "--repo", "owner/example", "--state", "open", "--json", "number,title,body,labels", "--limit", "100"]);
  });

  it("createGithubIssuesFetcher returns null when the runner throws", async () => {
    const fetcher = createGithubIssuesFetcher("owner/example", async () => { throw new Error("not authed"); });
    expect(await fetcher()).toBeNull();
  });

  it("createLinearIssuesFetcher honors a custom command vector and returns stdout", async () => {
    const calls: { file: string; args: readonly string[] }[] = [];
    const fetcher = createLinearIssuesFetcher(async (file, args) => {
      calls.push({ file, args });
      return { stdout: "{\"issues\":[]}" };
    }, ["custom-cli", "linear", "--json"]);

    const result = await fetcher();
    expect(result).toBe("{\"issues\":[]}");
    expect(calls[0]).toEqual({ file: "custom-cli", args: ["linear", "--json"] });
  });
});
