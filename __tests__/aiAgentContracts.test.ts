import { describe, expect, it, vi } from "vitest";
import { runTriageRequest } from "../src/server/triageRouteCore";

describe("AI agent/tool contract telemetry", () => {
  it("emits lifecycle and AI observation events without sending full prompts", async () => {
    const capture = vi.fn(async () => ({ ok: true }));
    const result = await runTriageRequest({
      payload: {
        issue: {
          id: "backlog-1",
          source: "github",
          externalRef: "#1",
          title: "Add observability",
          summary: "Track useful lifecycle events.",
          suggestedRegionId: "runtime",
          status: "new",
        },
      },
      runAgent: async () => ({
        text: JSON.stringify({
          suggestedRegionId: "runtime",
          suggestedAgent: "operator",
          risk: "medium",
          rationale: "Runtime path.",
        }),
      }),
      telemetry: { capture },
    });

    expect(result.status).toBe(200);
    expect(capture).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "agent_lifecycle_event",
        properties: expect.not.objectContaining({ prompt: expect.anything() }),
      }),
    );
    expect(capture).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "ai_observation",
        properties: expect.objectContaining({
          agent_id: "backlog-triage",
          status: "completed",
          suggested_agent: "operator",
        }),
      }),
    );
  });
});
