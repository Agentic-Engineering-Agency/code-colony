import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { SandboxClient } from "../sandboxClient";

/**
 * AGE-55: `runCommand` Mastra tool. Forwards a single shell command to the
 * AGE-49 sandbox-runner Worker via HMAC-signed HTTP and returns the stdout /
 * stderr / exit code.
 *
 * The tool gates input through three layers, in order:
 *
 *   1. Forbidden-character check. Any shell metacharacter that could turn
 *      a single allow-listed verb into a multi-command shell expression
 *      (`;`, `&`, `|`, backtick, `$(`, `>`, `<`, newline, carriage return,
 *      tab) is rejected before allow-list matching even runs. This blocks
 *      `git status ; rm -rf /`, `git status && curl evil`,
 *      `grep x . | cat /etc/shadow`, and similar bypasses where the
 *      runner's shell would otherwise execute the second command.
 *
 *   2. `node --version` and any other entry whose `--eval` / `-e` flag
 *      can hijack semantics is intentionally NOT in the default allow
 *      list. Use a different verb if you need one.
 *
 *   3. Allow-list prefix match. A command must equal an entry exactly or
 *      start with `<entry> ` (entry plus a single space). Tail arguments
 *      are accepted but only after layers (1) and (2) have passed.
 *
 * Anything that fails any layer returns
 *   { allowed: false, command, reason }
 * without ever touching the network. The tool also `console.warn`s every
 * denial so jailbreak attempts produce an audit trail.
 *
 * Configure the production accessor `runCommandTool()` with environment
 * variables (read at first call):
 *   SANDBOX_RUNNER_URL    e.g. https://sandbox.codecolony.dev
 *   SANDBOX_HMAC_KEY      shared secret for HMAC-SHA256 signing
 *
 * In production (NODE_ENV === "production") missing env throws; in dev
 * it logs a warning and returns a noop tool builder so the agent can
 * still run without a sandbox.
 */

/**
 * Characters whose presence in a command tail can fork shell semantics.
 * Listed verbatim so the regex below stays auditable.
 */
const FORBIDDEN_SHELL_CHARS: ReadonlyArray<string> = [
  ";",
  "&",
  "|",
  "`",
  "$",
  ">",
  "<",
  "\n",
  "\r",
  "\t",
  "\\",
  "(",
  ")",
] as const;

const FORBIDDEN_SHELL_REGEX = /[;&|`$><\n\r\t\\()]/;

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
  "rg",
] as const;

export type AllowedCommand = (typeof DEFAULT_ALLOWED_COMMANDS)[number];

export interface RunCommandToolDeps {
  /** Sandbox client used to talk to the runner. Injectable for tests. */
  sandbox: SandboxClient;
  /** Allow-list prefixes; defaults to `DEFAULT_ALLOWED_COMMANDS`. */
  allowList?: ReadonlyArray<string>;
  /** Logger sink for denied commands; defaults to `console.warn`. */
  onDeny?: (event: { command: string; reason: string }) => void;
}

const inputSchema = z.object({
  command: z
    .string()
    .min(1)
    .describe(
      "Shell command to run inside the sandbox. Must start with one of the allow-listed verbs and must not contain shell metacharacters.",
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

/**
 * Returns `null` if the command passes all gates, else a human-readable
 * rejection reason. Exported for direct unit testing of the gating logic.
 */
export function rejectionReason(
  command: string,
  allowList: ReadonlyArray<string>,
): string | null {
  if (FORBIDDEN_SHELL_REGEX.test(command)) {
    return `command contains forbidden shell character; reject before sandbox: ${FORBIDDEN_SHELL_CHARS.join(" ")}`;
  }
  const matches = allowList.some(
    (prefix) => command === prefix || command.startsWith(`${prefix} `),
  );
  if (!matches) {
    return `not in allow-list: ${allowList.join(", ")}`;
  }
  // Reject git commands that write to disk via --output= (policy bypass).
  if (command.startsWith("git ") && command.includes("--output=")) {
    return "git --output= is not allowed (write-capable flag)";
  }
  // Reject ripgrep commands that execute arbitrary preprocessors.
  if (command.startsWith("rg ") && command.includes("--pre=")) {
    return "rg --pre= is not allowed (arbitrary subprocess execution)";
  }
  return null;
}

/**
 * Back-compat alias kept for the existing test suite. Returns true iff
 * `rejectionReason` would return null.
 */
export function isAllowed(
  command: string,
  allowList: ReadonlyArray<string>,
): boolean {
  return rejectionReason(command, allowList) === null;
}

/**
 * Build a Mastra tool bound to a specific `SandboxClient` + allow-list.
 * Tests construct one with a fake client; production callers use
 * `runCommandTool()` (no args) which reads env vars.
 */
export function buildRunCommandTool(deps: RunCommandToolDeps) {
  const allowList = deps.allowList ?? DEFAULT_ALLOWED_COMMANDS;
  const onDeny =
    deps.onDeny ??
    ((event: { command: string; reason: string }) => {
      console.warn(
        `[runCommand] denied: ${JSON.stringify({
          command: event.command,
          reason: event.reason,
        })}`,
      );
    });
  return createTool({
    id: "runCommand",
    description:
      "Run a single shell command inside the Code Colony sandbox runner. Use for read-only repo inspection (ls, cat, git status / diff / log / ls-files, npm ls, grep, rg). Mutating commands and shell metacharacters are rejected before the sandbox is contacted.",
    inputSchema,
    outputSchema,
    execute: async (inputData): Promise<RunCommandResult> => {
      const { command, sandboxId } = inputData as z.infer<typeof inputSchema>;
      const reason = rejectionReason(command, allowList);
      if (reason !== null) {
        onDeny({ command, reason });
        return { allowed: false, command, reason };
      }
      try {
        const res = await deps.sandbox.exec({ command, sandboxId });
        return {
          allowed: true,
          command,
          exitCode: res.exitCode,
          stdout: res.stdout,
          stderr: res.stderr,
          durationMs: res.durationMs,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(
          `[runCommand] sandbox exec failed: ${JSON.stringify({
            command,
            sandboxId,
            error: message,
          })}`,
        );
        return {
          allowed: true,
          command,
          stderr: message,
          reason: `sandbox exec failed: ${message}`,
        };
      }
    },
  });
}

/**
 * Production accessor: reads `SANDBOX_RUNNER_URL` and `SANDBOX_HMAC_KEY`
 * from the environment.
 *
 *   - In production (NODE_ENV === "production") missing env throws — a
 *     prod misconfiguration must be loud, not a degraded agent.
 *   - In dev/test missing env logs a warning and throws so the caller
 *     can decide to skip tool registration.
 *
 * `mastra/agents/backlog-triage.ts` uses a non-throwing wrapper that
 * inspects the env once at module init.
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
