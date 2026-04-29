/**
 * Model configuration for the FreeLLMAPI OpenAI-compatible endpoint.
 *
 * The endpoint is expected to be running locally (e.g. `npx tsx server.ts` from
 * https://github.com/tashfeenahmed/freellmapi) and to honor the `/v1/chat/completions`
 * path that the OpenAI Chat Completions API exposes.
 *
 * The user's reported address `http://0.0.0.0:3001` is a bind-all address which
 * is not routable as a destination; from this host it's reachable as
 * `http://localhost:3001` or `http://127.0.0.1:3001`.
 */

const DEFAULT_FREELLM_URL = "http://localhost:3001/v1";
const DEFAULT_FREELLM_MODEL_ID = "qwen/qwen3-coder:free";

export type FreeLLMConfig = {
  url: string;
  modelId: string;
  apiKey: string;
  providerId: string;
};

export function getFreeLLMConfig(overrides: Partial<FreeLLMConfig> = {}): FreeLLMConfig {
  return {
    url: overrides.url ?? process.env.FREELLM_URL ?? DEFAULT_FREELLM_URL,
    modelId: overrides.modelId ?? process.env.FREELLM_MODEL_ID ?? DEFAULT_FREELLM_MODEL_ID,
    apiKey: overrides.apiKey ?? process.env.FREELLM_API_KEY ?? "",
    providerId: overrides.providerId ?? "freellm",
  };
}

/**
 * Returns a `MastraModelConfig` shape compatible with `@mastra/core`'s
 * `Agent` constructor.
 */
export function freeLLMModelConfig(overrides: Partial<FreeLLMConfig> = {}) {
  const config = getFreeLLMConfig(overrides);
  return {
    providerId: config.providerId,
    modelId: config.modelId,
    url: config.url,
    apiKey: config.apiKey,
  } as const;
}
