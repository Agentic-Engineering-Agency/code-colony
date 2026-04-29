/**
 * Wire types for the sandbox-runner Worker.
 *
 * The runner is a thin HMAC-authenticated facade over `@cloudflare/sandbox`.
 * Callers send JSON requests and receive normalized JSON responses; we do not
 * leak SDK types directly so the surface stays stable while the SDK evolves.
 */

export interface ExecRequest {
  /**
   * Shell command to execute inside the sandbox. The runner does not split or
   * sanitize the command — callers are expected to pass a single string they
   * are willing to run as-is, e.g. `bash -lc 'cd repo && npm ci && npm test'`.
   */
  command: string;

  /**
   * Optional Sandbox Durable Object instance id. Defaults to `"agent-shell"`.
   * Use distinct ids when you need parallel, isolated working directories.
   */
  sandboxId?: string;
}

export interface ExecResponse {
  ok: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
  command: string;
  sandboxId: string;
}

export interface GitCloneRequest {
  /** Full https URL of the repository to clone. Include the auth token if needed. */
  repoUrl: string;
  /** Branch to checkout. Defaults to the repository default branch. */
  branch?: string;
  /** Target directory inside the sandbox workspace. */
  targetDir?: string;
  /** Shallow clone depth, e.g. 1 for the latest commit only. */
  depth?: number;
  /** Optional Sandbox Durable Object instance id. Defaults to `"agent-shell"`. */
  sandboxId?: string;
}

export interface GitCloneResponse {
  ok: boolean;
  repoUrl: string;
  branch: string;
  targetDir: string;
  exitCode: number | undefined;
  sandboxId: string;
}

export interface ErrorResponseBody {
  error: string;
}
