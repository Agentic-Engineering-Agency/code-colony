import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { verifyWebhookSignature, verifyWebhookSignatureWithAudit } from "../src/server/webhookSecurity";

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

describe("webhook signature validation", () => {
  it("accepts raw hex and sha256-prefixed signatures", () => {
    const payload = JSON.stringify({ event: "payment.succeeded" });
    const signature = sign(payload, "secret");

    expect(verifyWebhookSignature({ payload, signature, secret: "secret" })).toMatchObject({ ok: true });
    expect(verifyWebhookSignature({ payload, signature: `sha256=${signature}`, secret: "secret" })).toMatchObject({ ok: true });
  });

  it("rejects missing, malformed, and mismatched signatures", () => {
    const payload = "{}";
    expect(verifyWebhookSignature({ payload, signature: null, secret: "secret" })).toEqual({ ok: false, reason: "missing_signature" });
    expect(verifyWebhookSignature({ payload, signature: "bad", secret: "secret" })).toEqual({ ok: false, reason: "malformed_signature" });
    expect(verifyWebhookSignature({ payload, signature: sign(payload, "other"), secret: "secret" })).toEqual({ ok: false, reason: "signature_mismatch" });
  });

  it("audits failed webhook verification without storing the raw payload", async () => {
    const capture = vi.fn(async () => ({ ok: true }));
    const result = await verifyWebhookSignatureWithAudit(
      { provider: "dodo", payload: "{\"private\":\"payload\"}", signature: "bad", secret: "secret", deliveryId: "evt_1" },
      { capture },
    );

    expect(result).toEqual({ ok: false, reason: "malformed_signature" });
    expect(capture).toHaveBeenCalledWith({
      event: "webhook_failure",
      properties: {
        provider: "dodo",
        delivery_id: "evt_1",
        failure_reason: "malformed_signature",
      },
    });
  });
});
