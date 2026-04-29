import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { resolve } from "node:path";
import { parseGitListingOutput } from "../domain/demoData";

const execFileAsync = promisify(execFile);

export type CommandRunner = (file: string, args: readonly string[], options?: { cwd?: string }) => Promise<{ stdout: string }>;

const defaultRunner: CommandRunner = async (file, args, options) => {
  const result = await execFileAsync(file, [...args], { encoding: "utf8", cwd: options?.cwd });
  return { stdout: result.stdout };
};

export type RepoScanFetcherOptions = {
  cwd?: string;
  run?: CommandRunner;
};

export function createGitListingFetcher(options: RepoScanFetcherOptions = {}): () => Promise<string[] | null> {
  const cwd = options.cwd ? resolve(options.cwd) : process.cwd();
  const run = options.run ?? defaultRunner;
  return async () => {
    try {
      const { stdout } = await run("git", ["-C", cwd, "ls-files", "-z"], { cwd });
      return parseGitListingOutput(stdout);
    } catch {
      return null;
    }
  };
}
