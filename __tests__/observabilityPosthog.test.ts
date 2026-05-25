import { describe, expect, it, vi } from "vitest";
import { createPostHogClient, sanitizeProperties } from "../src/observability/posthog";

describe("PostHog observability", () => {
  it("no-ops when no key is configured", async () => {
    const fetchImpl = vi.fn() as unknown as typeof fetch;
    const client = createPostHogClient({ apiKey: "", fetchImpl });

    await expect(client.capture({ event: "automation_audit_event" })).resolves.toMatchObject({
      ok: true,
      skipped: true,
      reason: "missing_api_key",
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("redacts secrets, raw prompts, private content, and payment payload-like fields", () => {
    expect(
      sanitizeProperties({
        repo: "Agentic-Engineering-Agency/code-colony",
        apiKey: "provider-key-like-value",
        fullPrompt: "clone this private repo and summarize it",
        rawPaymentPayload: { card: "4242 4242 4242 4242" },
        latencyMs: 42,
      }),
    ).toEqual({
      repo: "Agentic-Engineering-Agency/code-colony",
      apiKey: "[redacted]",
      fullPrompt: "[redacted]",
      rawPaymentPayload: "[redacted]",
      latencyMs: 42,
    });
  });

  it("captures sanitized events to the configured PostHog host", async () => {
    const calls: Array<{ url: string; body: unknown }> = [];
    const fetchImpl: typeof fetch = vi.fn(async (input, init) => {
      calls.push({ url: String(input), body: JSON.parse(String(init?.body)) });
      return new Response("{}", { status: 200 });
    }) as unknown as typeof fetch;
    const client = createPostHogClient({
      apiKey: "phc_test",
      host: "https://posthog.example/",
      fetchImpl,
      now: () => "2026-05-25T12:00:00.000Z",
    });

    await expect(
      client.capture({
        event: "ai_observation",
        distinctId: "agent-1",
        properties: { prompt: "do not store this", tokens: 123 },
      }),
    ).resolves.toEqual({ ok: true });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe("https://posthog.example/capture/");
    expect(calls[0]?.body).toMatchObject({
      api_key: "phc_test",
      event: "ai_observation",
      distinct_id: "agent-1",
      properties: {
        prompt: "[redacted]",
        tokens: 123,
        observed_at: "2026-05-25T12:00:00.000Z",
        telemetry_source: "code-colony",
      },
    });
  });

  it("does not throw when PostHog transport fails", async () => {
    const fetchImpl: typeof fetch = vi.fn(async () => {
      throw new Error("network unavailable");
    }) as unknown as typeof fetch;
    const client = createPostHogClient({
      apiKey: "phc_test",
      fetchImpl,
    });

    await expect(
      client.capture({
        event: "workflow_event",
        properties: { workflow_name: "runtime_preview" },
      }),
    ).resolves.toEqual({
      ok: false,
      reason: "posthog_capture_error:network unavailable",
    });
  });
});
