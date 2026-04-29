import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { SandboxClient } from "../sandboxClient";

/**
 * AGE-55: `runCommand` Mastra tool. Forwards a single shell command to the
 * AGE-49 sandbox-runner Worker via HMAC-signed HTTP and returns the stdout /
 * stderr / exit code.
 *
 * The tool is gated by an explicit allow-list. `command` is matched verbatim
 * against the prefix of a known-good command string — agents can pass tail
 * arguments (`git diff`, `git diff --stat`) but never substitute the leading
 * verb. Anything outside the allow-list is rejected with
 * `{ allowed: false, command, reason: "not in allow-list" }` so the agent
 * sees the failure and can adjust without ever reaching the network.
 *
 * Configure with environment variables (read at module load):
 *   SANDBOX_RUNNER_URL    e.g. https://sandbox.codecolony.dev
 *   SANDBOX_HMAC_KEY      shared secret for HMAC-SHA256 signing
 */

export const DEFAULT_ALLOWED_COMMANDS = [
  "ls",
  "cat",
  "head",
  "tail",
  "grep",
  "git status",
  "git diff",
  "git log",
  "git ls-files",
  "npm ls",
  "node --version",
  "rg",
] as const;

export type AllowedCommand = (typeof DEFAULT_ALLOWED_COMMANDS)[number];

export interface RunCommandToolDeps {
  /** Sandbox client used to talk to the runner. Injectable for tests. */
  sandbox: SandboxClient;
  /** Allow-list prefixes; defaults to `DEFAULT_ALLOWED_COMMANDS`. */
  allowList?: ReadonlyArray<string>;
}

const inputSchema = z.object({
  command: z
    .string()
    .min(1)
    .describe(
      "Shell command to run inside the sandbox. Must start with one of the allow-listed verbs.",
    ),
  sandboxId: z
    .string()
    .min(1)
    .optional()
    .describe(
      "Optional sandbox instance id when the agent wants an isolated working tree.",
    ),
});

const outputSchema = z.object({
  allowed: z.boolean(),
  command: z.string(),
  exitCode: z.number().optional(),
  stdout: z.string().optional(),
  stderr: z.string().optional(),
  durationMs: z.number().optional(),
  reason: z.string().optional(),
});

export type RunCommandResult = z.infer<typeof outputSchema>;

export function isAllowed(
  command: string,
  allowList: ReadonlyArray<string>,
): boolean {
  return allowList.some(
    (prefix) => command === prefix || command.startsWith(`${prefix} `),
  );
}

/**
 * Build a Mastra tool bound to a specific `SandboxClient` + allow-list.
 * Tests construct one with a fake client; production callers use
 * `runCommandTool()` (no args) which reads env vars.
 */
export function buildRunCommandTool(deps: RunCommandToolDeps) {
  const allowList = deps.allowList ?? DEFAULT_ALLOWED_COMMANDS;
  return createTool({
    id: "runCommand",
    description:
      "Run a single shell command inside the Code Colony sandbox runner. Use for read-only repo inspection (ls, cat, git diff, npm ls). Mutating commands are rejected.",
    inputSchema,
    outputSchema,
    execute: async (inputData): Promise<RunCommandResult> => {
      const { command, sandboxId } = inputData as z.infer<typeof inputSchema>;
      if (!isAllowed(command, allowList)) {
        return {
          allowed: false,
          command,
          reason: `not in allow-list: ${allowList.join(", ")}`,
        };
      }
      const res = await deps.sandbox.exec({ command, sandboxId });
      return {
        allowed: true,
        command,
        exitCode: res.exitCode,
        stdout: res.stdout,
        stderr: res.stderr,
        durationMs: res.durationMs,
      };
    },
  });
}

/**
 * Production accessor: reads `SANDBOX_RUNNER_URL` and `SANDBOX_HMAC_KEY` from
 * the environment. Throws at first call when either is missing — explicit
 * failure beats a half-configured tool that pretends to work.
 */
export function runCommandTool() {
  const baseUrl = process.env.SANDBOX_RUNNER_URL;
  const hmacSecret = process.env.SANDBOX_HMAC_KEY;
  if (!baseUrl || !hmacSecret) {
    throw new Error(
      "runCommandTool: SANDBOX_RUNNER_URL and SANDBOX_HMAC_KEY must be set",
    );
  }
  return buildRunCommandTool({
    sandbox: new SandboxClient({ baseUrl, hmacSecret }),
  });
}
