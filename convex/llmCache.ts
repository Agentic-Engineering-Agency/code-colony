import { LLMCache } from "@mzedstudio/llm-cache";
import { components } from "./_generated/api";

/**
 * LLM request/response caching with tiered TTL and time-travel debugging.
 * Reduces redundant OpenRouter calls and provides observability into
 * model output drift over time.
 */
export const llmCache = new LLMCache(components.llmCache);
