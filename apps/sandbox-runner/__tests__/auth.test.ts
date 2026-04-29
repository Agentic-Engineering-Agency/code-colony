import { describe, expect, it } from "vitest";

import {
  DEFAULT_SKEW_MS,
  signHmac,
  verifyHmac,
} from "../src/auth";

const SECRET = "test-secret-key";
const NOW = 1_734_000_000_000;

function authHeaders(timestamp: string, signature: string): Record<string, string> {
  return {
    "x-sandbox-ts": timestamp,
    "x-sandbox-sig": signature,
    "content-type": "application/json",
  };
}

async function signedRequest(
  body: string,
  override: { timestamp?: string; signature?: string; secret?: string } = {},
): Promise<Request> {
  const ts = override.timestamp ?? String(NOW);
  const secret = override.secret ?? SECRET;
  const sig = override.signature ?? (await signHmac(ts, body, secret));
  return new Request("https://example.com/exec", {
    method: "POST",
    headers: authHeaders(ts, sig),
    body,
  });
}

describe("signHmac", () => {
  it("produces deterministic 32-byte hex digests", async () => {
    const a = await signHmac(String(NOW), '{"command":"ls"}', SECRET);
    const b = await signHmac(String(NOW), '{"command":"ls"}', SECRET);
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it("changes when the body changes", async () => {
    const a = await signHmac(String(NOW), "a", SECRET);
    const b = await signHmac(String(NOW), "b", SECRET);
    expect(a).not.toBe(b);
  });

  it("changes when the timestamp changes", async () => {
    const a = await signHmac(String(NOW), "x", SECRET);
    const b = await signHmac(String(NOW + 1), "x", SECRET);
    expect(a).not.toBe(b);
  });
});

describe("verifyHmac", () => {
  it("accepts a request signed with the right secret and timestamp", async () => {
    const body = JSON.stringify({ command: "echo hi" });
    const req = await signedRequest(body);
    const result = await verifyHmac(req, SECRET, { now: () => NOW });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.body).toBe(body);
  });

  it("rejects when the body is tampered after signing", async () => {
    const original = JSON.stringify({ command: "ls" });
    const tampered = JSON.stringify({ command: "rm -rf /" });
    const ts = String(NOW);
    const sig = await signHmac(ts, original, SECRET);
    const req = new Request("https://example.com/exec", {
      method: "POST",
      headers: authHeaders(ts, sig),
      body: tampered,
    });

    const result = await verifyHmac(req, SECRET, { now: () => NOW });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("invalid signature");
      expect(result.status).toBe(401);
    }
  });

  it("rejects when the secret is wrong", async () => {
    const req = await signedRequest("{}", { secret: "other-secret" });
    const result = await verifyHmac(req, SECRET, { now: () => NOW });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("invalid signature");
  });

  it("rejects timestamps older than the skew window", async () => {
    const stale = String(NOW - DEFAULT_SKEW_MS - 1);
    const req = await signedRequest("{}", { timestamp: stale });
    const result = await verifyHmac(req, SECRET, { now: () => NOW });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("timestamp expired");
      expect(result.status).toBe(401);
    }
  });

  it("rejects timestamps from the future beyond the skew window", async () => {
    const future = String(NOW + DEFAULT_SKEW_MS + 1);
    const req = await signedRequest("{}", { timestamp: future });
    const result = await verifyHmac(req, SECRET, { now: () => NOW });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("timestamp expired");
  });

  it("accepts timestamps right at the edge of the skew window", async () => {
    const edge = String(NOW - DEFAULT_SKEW_MS);
    const req = await signedRequest("{}", { timestamp: edge });
    const result = await verifyHmac(req, SECRET, { now: () => NOW });
    expect(result.ok).toBe(true);
  });

  it("rejects when auth headers are missing", async () => {
    const req = new Request("https://example.com/exec", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    });
    const result = await verifyHmac(req, SECRET, { now: () => NOW });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("missing auth headers");
      expect(result.status).toBe(401);
    }
  });

  it("rejects malformed timestamps", async () => {
    const ts = "not-a-number";
    const sig = await signHmac(ts, "{}", SECRET);
    const req = new Request("https://example.com/exec", {
      method: "POST",
      headers: authHeaders(ts, sig),
      body: "{}",
    });
    const result = await verifyHmac(req, SECRET, { now: () => NOW });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("invalid timestamp");
  });
});
