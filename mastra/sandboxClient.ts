/**
 * Typed client for the AGE-49 sandbox-runner Worker.
 *
 * Encapsulates the HMAC signing protocol so callers (Mastra tools, route
 * handlers, manual test harnesses) never have to think about timestamps or
 * headers. The signing algorithm matches `apps/sandbox-runner/src/auth.ts`
 * verbatim:
 *
 *   sig = hex(hmac-sha256(timestamp || body, secret))
 *
 * Each request carries an `AbortSignal.timeout(timeoutMs)` so a hung
 * runner cannot stall the agent loop. Failures throw a `SandboxError`
 * carrying status code, response body excerpt, and the underlying cause —
 * call sites can branch on `err.status` to distinguish auth failures
 * (401), rate-limit (429), and 5xx without reparsing the message.
 *
 * Callers inject `fetchImpl` for tests; production calls fall through to
 * the global `fetch`.
 */

const ENCODER = new TextEncoder();

export const TIMESTAMP_HEADER = "x-sandbox-ts";
export const SIGNATURE_HEADER = "x-sandbox-sig";
export const DEFAULT_TIMEOUT_MS = 60_000;

export interface SandboxClientConfig {
  /** Base URL of the sandbox-runner Worker, no trailing slash. */
  baseUrl: string;
  /** Shared HMAC secret. Must match the runner's `SANDBOX_HMAC_KEY`. */
  hmacSecret: string;
  /** Optional `fetch` injection for tests. Defaults to global `fetch`. */
  fetchImpl?: typeof fetch;
  /** Optional `Date.now` injection for tests. */
  now?: () => number;
  /** Per-request timeout in ms. Defaults to 60 seconds. */
  timeoutMs?: number;
}

export interface ExecRequest {
  command: string;
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
  repoUrl: string;
  branch?: string;
  targetDir?: string;
  depth?: number;
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

export class SandboxError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly path: string,
    public readonly bodyExcerpt: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "SandboxError";
  }
}

export class SandboxClient {
  private readonly fetchImpl: typeof fetch;
  private readonly now: () => number;
  private readonly timeoutMs: number;

  constructor(private readonly config: SandboxClientConfig) {
    const url = config.baseUrl.replace(/\/$/, "");
    this.config = { ...config, baseUrl: url };
    this.fetchImpl = config.fetchImpl ?? fetch;
    this.now = config.now ?? Date.now;
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  exec(req: ExecRequest): Promise<ExecResponse> {
    return this.signedPost<ExecResponse>("/exec", req);
  }

  gitClone(req: GitCloneRequest): Promise<GitCloneResponse> {
    return this.signedPost<GitCloneResponse>("/git-clone", req);
  }

  async health(): Promise<{ ok: boolean }> {
    try {
      const res = await this.fetchImpl(`${this.config.baseUrl}/health`, {
        signal: AbortSignal.timeout(this.timeoutMs),
      });
      if (!res.ok) {
        const body = await safeRead(res);
        return { ok: false, ...{ status: res.status, body } } as {
          ok: boolean;
        };
      }
      return (await res.json()) as { ok: boolean };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[sandbox] health check failed: ${message}`);
      return { ok: false };
    }
  }

  private async signedPost<T>(path: string, body: unknown): Promise<T> {
    const ts = String(this.now());
    const payload = JSON.stringify(body);
    const sig = await signHmac(ts, payload, this.config.hmacSecret);
    let res: Response;
    try {
      res = await this.fetchImpl(`${this.config.baseUrl}${path}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          [TIMESTAMP_HEADER]: ts,
          [SIGNATURE_HEADER]: sig,
        },
        body: payload,
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new SandboxError(
        `sandbox ${path} request failed before response: ${message}`,
        0,
        path,
        "",
        { cause: err },
      );
    }
    if (!res.ok) {
      const detail = await safeRead(res);
      throw new SandboxError(
        `sandbox ${path} failed with ${res.status}: ${detail}`,
        res.status,
        path,
        detail,
      );
    }
    return (await res.json()) as T;
  }
}

async function safeRead(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return `<body read failed: ${message}>`;
  }
}

export async function signHmac(
  timestamp: string,
  body: string,
  secret: string,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    ENCODER.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    ENCODER.encode(`${timestamp}${body}`),
  );
  return bytesToHex(new Uint8Array(sig));
}

function bytesToHex(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 1) {
    const byte = bytes[i] ?? 0;
    out += byte.toString(16).padStart(2, "0");
  }
  return out;
}
