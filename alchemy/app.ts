/**
 * TanStack Start app Worker stack. Provisions the root Code Colony app from
 * the same entrypoint and compatibility date declared in `wrangler.jsonc` so
 * local Wrangler deploys and Alchemy deploys cannot drift.
 *
 * Per-PR previews prefix the Worker name with the stage and bind dev-safe
 * service URLs. Production binds the public Convex deployment and OpenRouter
 * (https://openrouter.ai/api/v1) for LLM inference.
 */
import alchemy from "alchemy";
import { Assets, Worker } from "alchemy/cloudflare";
import type Alchemy from "alchemy";

export interface AppStackArgs {
  stage: string;
  sandbox: { hostname: string | undefined; workerName: string };
}

export interface AppStackOutput {
  hostname: string | undefined;
  workerName: string;
}

// Deploy-time entrypoint. The TanStack Start vite build emits the SSR Worker
// bundle here; alchemy uploads exactly this file. `wrangler.jsonc` deliberately
// keeps the virtual `@tanstack/react-start/server-entry` so `wrangler dev` /
// `npm run dev:tanstack` continue to work against the unbuilt source. See
// docs/specs/AGE-72-deploy-app-worker.md §S6 for why these two surfaces stay
// separate sources of truth.
const BUILT_WORKER_ENTRYPOINT = "dist/server/index.mjs";
// Companion client bundle from the same vite build. Uploaded as a Cloudflare
// Static Assets binding so requests for `/assets/*.{js,css}` hit the asset
// store before the Worker runs and the SSR HTML's hydration scripts resolve
// (AGE-74).
const BUILT_CLIENT_ASSETS_DIR = "./dist/client";
const WRANGLER_COMPATIBILITY_DATE = "2026-04-29";
const WRANGLER_COMPATIBILITY_FLAGS = ["nodejs_compat"];
const OPENROUTER_URL = "https://openrouter.ai/api/v1";
const OPENROUTER_MODEL_ID = "qwen/qwen3-coder:free";

export async function appStack(
  _app: Awaited<ReturnType<typeof Alchemy>>,
  args: AppStackArgs,
): Promise<AppStackOutput> {
  const isProd = args.stage === "prod";
  const namePrefix = isProd ? "" : `${args.stage}-`;
  const workerName = `${namePrefix}code-colony-app`;
  const sandboxRunnerUrl =
    args.sandbox.hostname ??
    workersDevUrl(args.sandbox.workerName);

  // `Assets()` is a plain factory in alchemy ≥0.69 (no Resource ID), so pass
  // the props object directly. The Worker name does not appear in the asset
  // record itself; preview vs prod isolation comes from the Worker's own
  // `name` and the per-stage Alchemy state store.
  const staticAssets = await Assets({
    path: BUILT_CLIENT_ASSETS_DIR,
  });

  const worker = await Worker(workerName, {
    name: workerName,
    entrypoint: BUILT_WORKER_ENTRYPOINT,
    compatibilityDate: WRANGLER_COMPATIBILITY_DATE,
    compatibilityFlags: WRANGLER_COMPATIBILITY_FLAGS,
    bindings: {
      ASSETS: staticAssets,
      CONVEX_URL: isProd
        ? "https://pastel-cricket-679.convex.cloud"
        : "https://deafening-puma-904.convex.cloud",
      OPENROUTER_URL,
      OPENROUTER_MODEL_ID,
      OPENROUTER_API_KEY: alchemy.secret(process.env.OPENROUTER_API_KEY),
      SANDBOX_RUNNER_URL: sandboxRunnerUrl,
      SANDBOX_HMAC_KEY: alchemy.secret(process.env.SANDBOX_HMAC_KEY),
    },
  });

  return { hostname: worker.url, workerName };
}

function workersDevUrl(workerName: string): string {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  if (!accountId) {
    throw new Error(
      "CLOUDFLARE_ACCOUNT_ID is required when Alchemy cannot read the sandbox Worker hostname",
    );
  }
  return `https://${workerName}.${accountId}.workers.dev`;
}
