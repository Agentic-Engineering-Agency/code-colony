import { createHmac, timingSafeEqual } from "node:crypto";
import { captureWebhookFailure, type PostHogClient } from "../observability/posthog";

export type WebhookSignatureResult =
  | { ok: true; digest: string }
  | { ok: false; reason: "missing_secret" | "missing_signature" | "malformed_signature" | "signature_mismatch" };

function toHex(signature: string): string | null {
  const trimmed = signature.trim();
  if (/^[0-9a-f]{64}$/i.test(trimmed)) return trimmed.toLowerCase();
  const prefixed = trimmed.match(/^sha256=([0-9a-f]{64})$/i);
  return prefixed?.[1]?.toLowerCase() ?? null;
}

export function verifyWebhookSignature(params: {
  payload: string;
  signature?: string | null;
  secret?: string | null;
}): WebhookSignatureResult {
  const secret = params.secret?.trim();
  if (!secret) return { ok: false, reason: "missing_secret" };
  if (!params.signature) return { ok: false, reason: "missing_signature" };

  const observedHex = toHex(params.signature);
  if (!observedHex) return { ok: false, reason: "malformed_signature" };

  const expectedHex = createHmac("sha256", secret).update(params.payload).digest("hex");
  const observed = Buffer.from(observedHex, "hex");
  const expected = Buffer.from(expectedHex, "hex");

  if (observed.length !== expected.length || !timingSafeEqual(observed, expected)) {
    return { ok: false, reason: "signature_mismatch" };
  }

  return { ok: true, digest: expectedHex };
}

export async function verifyWebhookSignatureWithAudit(
  params: {
    provider: "dodo" | "resend" | "external";
    payload: string;
    signature?: string | null;
    secret?: string | null;
    deliveryId?: string;
  },
  client?: PostHogClient,
): Promise<WebhookSignatureResult> {
  const result = verifyWebhookSignature(params);
  if (!result.ok) {
    await captureWebhookFailure(
      {
        provider: params.provider,
        delivery_id: params.deliveryId,
        failure_reason: result.reason,
      },
      client,
    );
  }
  return result;
}
