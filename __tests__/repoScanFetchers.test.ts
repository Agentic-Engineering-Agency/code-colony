import { describe, expect, it } from "vitest";
import { createGitListingFetcher } from "../src/server/repoScanFetchers";

describe("server repo scan fetchers", () => {
  it("createGitListingFetcher passes -C cwd args and parses output", async () => {
    const calls: { file: string; args: readonly string[] }[] = [];
    const fetcher = createGitListingFetcher({
      cwd: "/tmp/example",
      run: async (file, args) => {
        calls.push({ file, args });
        return { stdout: "src/foo.ts\0src/bar.ts\0" };
      },
    });
    const result = await fetcher();

    expect(calls).toHaveLength(1);
    expect(calls[0].file).toBe("git");
    expect(calls[0].args).toEqual(["-C", "/tmp/example", "ls-files", "-z"]);
    expect(result).toEqual(["src/foo.ts", "src/bar.ts"]);
  });

  it("returns null when the runner throws", async () => {
    const fetcher = createGitListingFetcher({ cwd: "/tmp/example", run: async () => { throw new Error("not a repo"); } });
    expect(await fetcher()).toBeNull();
  });

  it("falls back to process.cwd() when no cwd is supplied", async () => {
    const calls: { args: readonly string[] }[] = [];
    const fetcher = createGitListingFetcher({
      run: async (_file, args) => {
        calls.push({ args });
        return { stdout: "" };
      },
    });
    await fetcher();
    expect(calls[0].args[1]).toBe(process.cwd());
  });
});
