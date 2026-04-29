import { Mastra } from "@mastra/core";
import { backlogTriageAgent } from "./agents/backlog-triage";

export const mastra = new Mastra({
  agents: { backlogTriage: backlogTriageAgent },
});

export { backlogTriageAgent };
export { freeLLMModelConfig, getFreeLLMConfig, type FreeLLMConfig } from "./llm";
