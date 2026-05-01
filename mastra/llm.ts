/**
 * Model configuration for OpenRouter (https://openrouter.ai), an
 * OpenAI-compatible aggregator. Mastra's openai-compatible provider talks
 * to `${OPENROUTER_URL}/chat/completions` with a bearer token, so the
 * wiring is identical to a plain OpenAI deployment — only the base URL,
 * the API key, and the model id change.
 *
 * The base URL is fixed and public; we expose it as an env override for
 * tests and dev only. In production, the app Worker reads
 * `OPENROUTER_API_KEY` from a secret binding and the URL/model id from
 * plain bindings.
 */

const DEFAULT_OPENROUTER_URL = "https://openrouter.ai/api/v1";
const DEFAULT_OPENROUTER_MODEL_ID = "qwen/qwen3-coder:free";

export type OpenRouterConfig = {
  url: string;
  modelId: string;
  apiKey: string;
  providerId: string;
};

export function getOpenRouterConfig(
  overrides: Partial<OpenRouterConfig> = {},
): OpenRouterConfig {
  return {
    url: overrides.url ?? process.env.OPENROUTER_URL ?? DEFAULT_OPENROUTER_URL,
    modelId:
      overrides.modelId ??
      process.env.OPENROUTER_MODEL_ID ??
      DEFAULT_OPENROUTER_MODEL_ID,
    apiKey: overrides.apiKey ?? process.env.OPENROUTER_API_KEY ?? "",
    providerId: overrides.providerId ?? "openrouter",
  };
}

/**
 * Returns a `MastraModelConfig` shape compatible with `@mastra/core`'s
 * `Agent` constructor.
 */
export function openRouterModelConfig(
  overrides: Partial<OpenRouterConfig> = {},
) {
  const config = getOpenRouterConfig(overrides);
  return {
    providerId: config.providerId,
    modelId: config.modelId,
    url: config.url,
    apiKey: config.apiKey,
  } as const;
}
