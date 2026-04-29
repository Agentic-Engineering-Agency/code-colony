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
 * Callers inject `fetchImpl` for tests; production calls fall through to the
 * global `fetch`.
 */

const ENCODER = new TextEncoder();

export const TIMESTAMP_HEADER = "x-sandbox-ts";
export const SIGNATURE_HEADER = "x-sandbox-sig";

export interface SandboxClientConfig {
  /** Base URL of the sandbox-runner Worker, no trailing slash. */
  baseUrl: string;
  /** Shared HMAC secret. Must match the runner's `SANDBOX_HMAC_KEY`. */
  hmacSecret: string;
  /** Optional `fetch` injection for tests. Defaults to global `fetch`. */
  fetchImpl?: typeof fetch;
  /** Optional `Date.now` injection for tests. */
  now?: () => number;
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

export class SandboxClient {
  private readonly fetchImpl: typeof fetch;
  private readonly now: () => number;

  constructor(private readonly config: SandboxClientConfig) {
    this.fetchImpl = config.fetchImpl ?? fetch;
    this.now = config.now ?? Date.now;
  }

  exec(req: ExecRequest): Promise<ExecResponse> {
    return this.signedPost<ExecResponse>("/exec", req);
  }

  gitClone(req: GitCloneRequest): Promise<GitCloneResponse> {
    return this.signedPost<GitCloneResponse>("/git-clone", req);
  }

  health(): Promise<{ ok: boolean }> {
    return this.fetchImpl(`${this.config.baseUrl}/health`)
      .then((r) => r.json() as Promise<{ ok: boolean }>);
  }

  private async signedPost<T>(path: string, body: unknown): Promise<T> {
    const ts = String(this.now());
    const payload = JSON.stringify(body);
    const sig = await signHmac(ts, payload, this.config.hmacSecret);
    const res = await this.fetchImpl(`${this.config.baseUrl}${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        [TIMESTAMP_HEADER]: ts,
        [SIGNATURE_HEADER]: sig,
      },
      body: payload,
    });
    if (!res.ok) {
      const detail = await safeRead(res);
      throw new Error(
        `sandbox ${path} failed with ${res.status}: ${detail}`,
      );
    }
    return (await res.json()) as T;
  }
}

async function safeRead(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "<no body>";
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
