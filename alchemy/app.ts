/**
 * TanStack Start app Worker stack. Provisions the root Code Colony app from
 * the same entrypoint and compatibility date declared in `wrangler.jsonc` so
 * local Wrangler deploys and Alchemy deploys cannot drift.
 *
 * Per-PR previews prefix the Worker name with the stage and bind dev-safe
 * service URLs. Production binds the public Convex deployment and the AGE-56
 * FreeLLMAPI tunnel hostname.
 */
import alchemy from "alchemy";
import { Worker } from "alchemy/cloudflare";
import type Alchemy from "alchemy";

export interface AppStackArgs {
  stage: string;
  sandbox: { hostname: string | undefined; workerName: string };
}

export interface AppStackOutput {
  hostname: string | undefined;
  workerName: string;
}

const WRANGLER_ENTRYPOINT = "@tanstack/react-start/server-entry";
const WRANGLER_COMPATIBILITY_DATE = "2026-04-29";
const CLOUDFLARE_ACCOUNT_ID = "48f381bf59212dbd98d2b424ba4b9a04";

export async function appStack(
  _app: Awaited<ReturnType<typeof Alchemy>>,
  args: AppStackArgs,
): Promise<AppStackOutput> {
  const isProd = args.stage === "prod";
  const namePrefix = isProd ? "" : `${args.stage}-`;
  const workerName = `${namePrefix}code-colony-app`;
  const sandboxRunnerUrl =
    args.sandbox.hostname ??
    `https://${args.sandbox.workerName}.${CLOUDFLARE_ACCOUNT_ID}.workers.dev`;

  const worker = await Worker(workerName, {
    name: workerName,
    entrypoint: WRANGLER_ENTRYPOINT,
    compatibilityDate: WRANGLER_COMPATIBILITY_DATE,
    bindings: {
      CONVEX_URL: isProd
        ? "https://pastel-cricket-679.convex.cloud"
        : "https://deafening-puma-904.convex.cloud",
      FREELLM_URL: isProd
        ? "https://llm.codecolony.agenticengineering.lat/v1"
        : "http://127.0.0.1:3001/v1",
      FREELLM_MODEL_ID: "qwen/qwen3-coder:free",
      FREELLM_API_KEY: alchemy.secret(process.env.FREELLM_API_KEY),
      SANDBOX_RUNNER_URL: sandboxRunnerUrl,
      SANDBOX_HMAC_KEY: alchemy.secret(process.env.SANDBOX_HMAC_KEY),
    },
  });

  return { hostname: worker.url, workerName };
}
