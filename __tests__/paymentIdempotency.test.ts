import { describe, expect, it, vi } from "vitest";
import { buildPaymentIdempotencyKey, processPaymentEventOnce } from "../src/server/paymentIdempotency";

describe("payment idempotency", () => {
  it("builds stable Dodo event keys", () => {
    expect(
      buildPaymentIdempotencyKey({
        provider: "dodo",
        eventType: "checkout.completed",
        eventId: "evt_123",
      }),
    ).toBe("dodo:checkout.completed:evt_123");
  });

  it("processes a payment event once and audits sanitized lifecycle metadata", async () => {
    const seen = new Set<string>();
    const processed: string[] = [];
    const capture = vi.fn(async () => ({ ok: true }));
    const event = {
      provider: "dodo" as const,
      eventType: "checkout.completed",
      eventId: "evt_123",
      customerId: "cus_1",
      checkoutId: "chk_1",
      amountUsd: 29,
    };

    const first = await processPaymentEventOnce({
      event,
      hasProcessed: (key) => seen.has(key),
      markProcessed: (key) => {
        seen.add(key);
      },
      onProcess: (input) => {
        processed.push(input.eventId);
      },
      telemetry: { capture },
    });
    const second = await processPaymentEventOnce({
      event,
      hasProcessed: (key) => seen.has(key),
      markProcessed: (key) => {
        seen.add(key);
      },
      onProcess: (input) => {
        processed.push(input.eventId);
      },
      telemetry: { capture },
    });

    expect(first.status).toBe("processed");
    expect(second.status).toBe("duplicate");
    expect(processed).toEqual(["evt_123"]);
    expect(capture).toHaveBeenLastCalledWith({
      event: "payment_lifecycle_event",
      properties: {
        provider: "dodo",
        event_type: "checkout.completed",
        idempotency_key: "dodo:checkout.completed:evt_123",
        duplicate: true,
      },
    });
  });
});
