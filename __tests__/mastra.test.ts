import { describe, expect, it } from "vitest";
import { backlogTriageAgent, freeLLMModelConfig, getFreeLLMConfig, mastra } from "../mastra";

describe("Mastra wiring", () => {
  it("freeLLMModelConfig defaults point at localhost:3001/v1", () => {
    const config = getFreeLLMConfig();
    expect(config.url).toMatch(/^https?:\/\/(localhost|127\.0\.0\.1):3001\/v1$/);
    expect(config.providerId).toBe("freellm");
    expect(typeof config.modelId).toBe("string");
  });

  it("freeLLMModelConfig honors overrides and env-style fields", () => {
    const config = freeLLMModelConfig({ modelId: "openai/gpt-oss-120b:free", apiKey: "sk-test" });
    expect(config.modelId).toBe("openai/gpt-oss-120b:free");
    expect(config.apiKey).toBe("sk-test");
    expect(config.url).toMatch(/v1$/);
  });

  it("backlog triage agent is registered with Mastra", () => {
    expect(backlogTriageAgent.name).toBe("Backlog Triage");
    expect(mastra.getAgent("backlogTriage")).toBe(backlogTriageAgent);
  });

  it("backlog triage agent has an id and a model resolved", async () => {
    expect(backlogTriageAgent.id).toBe("backlog-triage");
    const llm = await backlogTriageAgent.getLLM();
    expect(llm).not.toBeNull();
  });

  // Live test: only runs when MASTRA_LIVE=1 is set so CI does not depend on
  // a reachable FreeLLMAPI process.
  it.runIf(process.env.MASTRA_LIVE === "1")(
    "backlog triage agent returns a JSON suggestion against the live endpoint",
    async () => {
      const result = await backlogTriageAgent.generate(
        "Issue: 'Persist memory ledger to Convex'\nSummary: Define a memory provider abstraction and back it with a Convex schema.",
      );
      const text = (result as { text?: string }).text ?? "";
      const parsed = JSON.parse(text);
      expect(parsed.suggestedRegionId).toBe("memory");
      expect(["curator", "operator", "architect"]).toContain(parsed.suggestedAgent);
    },
    60_000,
  );
});
