/**
 * Secrets stack. Single source of truth for every Worker / Convex
 * environment variable. Values are read from the local environment so the
 * deploy pipeline can pass them via GitHub Actions `secrets:` without
 * Alchemy ever seeing them as plaintext in state.
 *
 * Required for prod:
 *   SANDBOX_HMAC_KEY        sandbox-runner ↔ Mastra HMAC
 *   FREELLM_API_KEY         FreeLLMAPI bearer token (rotated frequently)
 *   FREELLM_URL             https://llm.codecolony.dev/v1
 *   BETTER_AUTH_SECRET      32+ random bytes for Convex Better Auth
 *   CONVEX_DEPLOY_KEY       deploy key minted by `npx convex deploy --until-success`
 *   R2_ACCESS_KEY_ID        Cloudflare R2 admin key for @convex-dev/r2
 *   R2_SECRET_ACCESS_KEY    paired secret
 *   R2_ENDPOINT             https://<account>.r2.cloudflarestorage.com
 *   R2_BUCKET               code-colony-prod
 *   R2_TOKEN                R2 read/write API token
 */
import { Secret } from "alchemy/cloudflare";
import type Alchemy from "alchemy";

const REQUIRED_PROD_SECRETS = [
  "SANDBOX_HMAC_KEY",
  "FREELLM_API_KEY",
  "FREELLM_URL",
  "BETTER_AUTH_SECRET",
  "CONVEX_DEPLOY_KEY",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_ENDPOINT",
  "R2_BUCKET",
  "R2_TOKEN",
] as const;

export interface SecretsStackArgs {
  stage: string;
}

export async function secretsStack(
  _app: Awaited<ReturnType<typeof Alchemy>>,
  args: SecretsStackArgs,
) {
  // For prod, fail fast when a required secret is missing rather than
  // letting downstream stacks start with a half-populated environment.
  if (args.stage === "prod") {
    const missing = REQUIRED_PROD_SECRETS.filter((k) => !process.env[k]);
    if (missing.length > 0) {
      throw new Error(
        `secretsStack(prod): missing env vars: ${missing.join(", ")}`,
      );
    }
  }

  for (const name of REQUIRED_PROD_SECRETS) {
    const value = process.env[name];
    if (!value) continue;
    await Secret(`${args.stage}-${name}`, { name, value });
  }
}
