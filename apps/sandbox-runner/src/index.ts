/**
 * Code Colony sandbox-runner Worker.
 *
 * Exposes a tiny HMAC-authenticated JSON RPC surface in front of
 * `@cloudflare/sandbox`, which provides the actual container-backed shell.
 *
 *   GET  /health     — liveness probe (no auth)
 *   POST /exec       — `{ command, sandboxId? }` → ExecResponse
 *   POST /git-clone  — `{ repoUrl, branch?, targetDir?, depth?, sandboxId? }`
 *
 * Streaming, port forwarding, and file I/O are deliberately out of scope for
 * this scaffold (CC-SBX-03 follow-up).
 */

import { getSandbox, type Sandbox as SandboxClass } from "@cloudflare/sandbox";

import { verifyHmac } from "./auth";
import type {
  ErrorResponseBody,
  ExecResponse,
  GitCloneRequest,
  GitCloneResponse,
} from "./types";

export { Sandbox } from "@cloudflare/sandbox";

export interface Env {
  Sandbox: DurableObjectNamespace<SandboxClass>;
  SANDBOX_HMAC_KEY: string;
}

const DEFAULT_SANDBOX_ID = "agent-shell";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const route = `${request.method} ${url.pathname}`;

    if (route === "GET /health") {
      return json({ ok: true, service: "code-colony-sandbox-runner" });
    }

    if (route !== "POST /exec" && route !== "POST /git-clone") {
      return errJson("not found", 404);
    }

    if (!env.SANDBOX_HMAC_KEY) {
      return errJson("server misconfigured: SANDBOX_HMAC_KEY missing", 500);
    }

    const auth = await verifyHmac(request, env.SANDBOX_HMAC_KEY);
    if (!auth.ok) return errJson(auth.error, auth.status);

    let payload: Record<string, unknown>;
    try {
      payload = parseJsonObject(auth.body);
    } catch (e) {
      return errJson((e as Error).message, 400);
    }

    if (route === "POST /exec") {
      return handleExec(env, payload);
    }
    return handleGitClone(env, payload);
  },
};

async function handleExec(
  env: Env,
  payload: Record<string, unknown>,
): Promise<Response> {
  const command = payload["command"];
  if (typeof command !== "string" || command.length === 0) {
    return errJson("command required", 400);
  }
  const sandboxId = optionalString(payload["sandboxId"]) ?? DEFAULT_SANDBOX_ID;

  const sandbox = getSandbox(env.Sandbox, sandboxId);
  try {
    const result = await sandbox.exec(command);
    const body: ExecResponse = {
      ok: result.success,
      exitCode: result.exitCode,
      stdout: result.stdout,
      stderr: result.stderr,
      durationMs: result.duration,
      command: result.command,
      sandboxId,
    };
    return json(body);
  } catch (e) {
    return errJson(toErrorMessage(e, "exec failed"), 500);
  }
}

async function handleGitClone(
  env: Env,
  payload: Record<string, unknown>,
): Promise<Response> {
  const repoUrl = payload["repoUrl"];
  if (typeof repoUrl !== "string" || repoUrl.length === 0) {
    return errJson("repoUrl required", 400);
  }
  const req: GitCloneRequest = {
    repoUrl,
    branch: optionalString(payload["branch"]),
    targetDir: optionalString(payload["targetDir"]),
    depth: optionalNumber(payload["depth"]),
    sandboxId: optionalString(payload["sandboxId"]),
  };
  const sandboxId = req.sandboxId ?? DEFAULT_SANDBOX_ID;

  const sandbox = getSandbox(env.Sandbox, sandboxId);
  try {
    const result = await sandbox.gitCheckout(req.repoUrl, {
      branch: req.branch,
      targetDir: req.targetDir,
      depth: req.depth,
    });
    const body: GitCloneResponse = {
      ok: result.success,
      repoUrl: redactCredentials(result.repoUrl),
      branch: result.branch,
      targetDir: result.targetDir,
      exitCode: result.exitCode,
      sandboxId,
    };
    return json(body);
  } catch (e) {
    return errJson(toErrorMessage(e, "git-clone failed"), 500);
  }
}

function parseJsonObject(text: string): Record<string, unknown> {
  if (text.length === 0) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("invalid json");
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("expected json object");
  }
  return parsed as Record<string, unknown>;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function optionalNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}
function redactCredentials(url: string): string {
  try {
    const u = new URL(url);
    if (u.password || u.username) {
      u.password = "";
      u.username = "";
      return u.toString();
    }
  } catch {
    // Not a valid URL — return unchanged.
  }
  return url;
}

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function errJson(error: string, status: number): Response {
  const body: ErrorResponseBody = { error };
  return json(body, status);
}
