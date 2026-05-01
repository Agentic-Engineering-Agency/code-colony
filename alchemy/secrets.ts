/**
 * Secrets stack. Fail-fast validation that the env vars consumed by every
 * other stack are present in prod. The actual secret delivery to Workers
 * happens via `alchemy.secret(process.env.<NAME>)` inline in the Worker
 * bindings (alchemy/app.ts, alchemy/sandbox.ts) — that path encrypts the
 * value with `ALCHEMY_PASSWORD` in alchemy state, then decrypts it at
 * deploy time and binds it as a Worker secret.
 *
 * We intentionally do NOT use Cloudflare's account-level Secrets Store
 * (`alchemy/cloudflare`'s `Secret` resource): it requires the deploy
 * token to have `Secrets Store: Edit`, which we deliberately omit from
 * the deploy token's scope to keep blast radius minimal.
 *
 * Convex-bound secrets (BETTER_AUTH_SECRET, CONVEX_DEPLOY_KEY, R2_*)
 * are pushed via `npx convex env set` from the CD workflow, not here.
 */
import type Alchemy from "alchemy";

const REQUIRED_PROD_ENV_VARS = [
  "SANDBOX_HMAC_KEY",
  "OPENROUTER_API_KEY",
] as const;

export interface SecretsStackArgs {
  stage: string;
}

export async function secretsStack(
  _app: Awaited<ReturnType<typeof Alchemy>>,
  args: SecretsStackArgs,
) {
  if (args.stage !== "prod") return;

  const missing = REQUIRED_PROD_ENV_VARS.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(
      `secretsStack(prod): missing env vars: ${missing.join(", ")}`,
    );
  }
}
