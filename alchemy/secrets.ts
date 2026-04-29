/**
 * Secrets stack. Single source of truth for every Cloudflare-bound
 * environment variable. Values flow through `alchemy.secret(value)` so
 * Alchemy encrypts them with `ALCHEMY_PASSWORD` before persisting to
 * state — never plaintext on disk or in KV.
 *
 * Cloudflare-bound secrets only:
 *   SANDBOX_HMAC_KEY        sandbox-runner Worker (AGE-49)
 *   FREELLM_API_KEY         FreeLLMAPI bearer token, surfaced to the app
 *                           Worker via Mastra `mastra/llm.ts`
 *   FREELLM_URL             FreeLLMAPI base URL (https://llm.codecolony.dev/v1)
 *
 * Convex-bound secrets are intentionally NOT registered here. Per ADR
 * 0004 they are consumed by Convex Functions and must be set via
 * `npx convex env set` from the AGE-61 CD step:
 *
 *   BETTER_AUTH_SECRET, CONVEX_DEPLOY_KEY,
 *   R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT, R2_BUCKET, R2_TOKEN
 *
 * A dedicated `convexEnvStack` (AGE-57) shells out to `npx convex env set
 * --prod` for each of those.
 */
import alchemy from "alchemy";
import { Secret } from "alchemy/cloudflare";
import type Alchemy from "alchemy";

const REQUIRED_PROD_SECRETS = [
  "SANDBOX_HMAC_KEY",
  "FREELLM_API_KEY",
  "FREELLM_URL",
] as const;

export interface SecretsStackArgs {
  stage: string;
}

export async function secretsStack(
  _app: Awaited<ReturnType<typeof Alchemy>>,
  args: SecretsStackArgs,
) {
  // Non-prod stages do NOT register secrets. A developer running
  // `ALCHEMY_STAGE=preview-42` from a shell that previously sourced prod
  // credentials would otherwise leak them into preview state. Preview
  // Workers source their own dev secrets via `wrangler secret put` or
  // `.dev.vars`.
  if (args.stage !== "prod") return;

  const missing = REQUIRED_PROD_SECRETS.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(
      `secretsStack(prod): missing env vars: ${missing.join(", ")}`,
    );
  }

  for (const name of REQUIRED_PROD_SECRETS) {
    // alchemy.secret(value) wraps the value so it is encrypted in state
    // with ALCHEMY_PASSWORD. Plaintext never lands on disk or in KV.
    await Secret(`${args.stage}-${name}`, {
      name,
      value: alchemy.secret(process.env[name] ?? ""),
    });
  }
}
