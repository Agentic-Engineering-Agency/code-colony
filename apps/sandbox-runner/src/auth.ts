/**
 * HMAC-SHA256 request authentication for the sandbox runner.
 *
 * Callers attach two headers:
 *   - `x-sandbox-ts`  — Unix epoch milliseconds when the request was signed.
 *   - `x-sandbox-sig` — `hex(hmac-sha256(timestamp || body, secret))`.
 *
 * The shared secret lives in `env.SANDBOX_HMAC_KEY` on the Worker side. The
 * timestamp is included in the MAC and validated against a five-minute skew
 * window so a captured request cannot be replayed indefinitely.
 *
 * `verifyHmac` reads the request body once and returns it to the caller —
 * Workers `Request.body` is a one-shot stream, and re-reading it after auth
 * would fail.
 */

const ENCODER = new TextEncoder();

export const TIMESTAMP_HEADER = "x-sandbox-ts";
export const SIGNATURE_HEADER = "x-sandbox-sig";
export const DEFAULT_SKEW_MS = 5 * 60 * 1000;

export interface VerifyHmacOptions {
  /** Time source, defaults to `Date.now`. Injected for testing. */
  now?: () => number;
  /** Allowed clock skew in milliseconds. Defaults to 5 minutes. */
  skewMs?: number;
}

export type VerifyHmacResult =
  | { ok: true; body: string }
  | { ok: false; error: string; status: number };

/**
 * Compute `hex(hmac-sha256(timestamp || body, secret))`. Exposed so callers
 * (and tests) can produce signatures with the same algorithm the verifier
 * expects.
 */
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

/**
 * Validate the auth headers on a Worker request. Returns the consumed body on
 * success so the handler can `JSON.parse` it directly.
 */
export async function verifyHmac(
  request: Request,
  secret: string,
  options: VerifyHmacOptions = {},
): Promise<VerifyHmacResult> {
  const timestamp = request.headers.get(TIMESTAMP_HEADER);
  const signature = request.headers.get(SIGNATURE_HEADER);
  if (!timestamp || !signature) {
    return { ok: false, error: "missing auth headers", status: 401 };
  }

  const ts = Number.parseInt(timestamp, 10);
  if (!Number.isFinite(ts) || String(ts) !== timestamp) {
    return { ok: false, error: "invalid timestamp", status: 401 };
  }

  const now = (options.now ?? Date.now)();
  const skew = options.skewMs ?? DEFAULT_SKEW_MS;
  if (Math.abs(now - ts) > skew) {
    return { ok: false, error: "timestamp expired", status: 401 };
  }

  const body = await request.text();
  const expected = await signHmac(timestamp, body, secret);
  if (!constantTimeEqualHex(expected, signature)) {
    return { ok: false, error: "invalid signature", status: 401 };
  }

  return { ok: true, body };
}

function bytesToHex(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 1) {
    const byte = bytes[i] ?? 0;
    out += byte.toString(16).padStart(2, "0");
  }
  return out;
}

function constantTimeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
