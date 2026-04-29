import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type CommandRunner = (file: string, args: readonly string[]) => Promise<{ stdout: string }>;

const defaultRunner: CommandRunner = async (file, args) => execFileAsync(file, [...args]);

export function createGithubIssuesFetcher(repo: string, run: CommandRunner = defaultRunner): () => Promise<string | null> {
  return async () => {
    try {
      const { stdout } = await run("gh", ["issue", "list", "--repo", repo, "--state", "open", "--json", "number,title,body,labels", "--limit", "100"]);
      return stdout;
    } catch {
      return null;
    }
  };
}

export function createLinearIssuesFetcher(run: CommandRunner = defaultRunner, args: readonly string[] = ["mcp", "linear/list_issues", "--json"]): () => Promise<string | null> {
  return async () => {
    try {
      const { stdout } = await run(args[0], args.slice(1));
      return stdout;
    } catch {
      return null;
    }
  };
}
