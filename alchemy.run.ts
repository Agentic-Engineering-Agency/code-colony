/**
 * Alchemy entrypoint for Code Colony infrastructure.
 *
 * Stages:
 *   prod                              — production environment
 *   preview-<pull-request-number>     — per-PR ephemeral preview
 *   dev                               — local dev (default)
 *
 * Usage (npm scripts wrap these):
 *   ALCHEMY_STAGE=prod         npm run iac:diff
 *   ALCHEMY_STAGE=prod         npm run iac:deploy
 *   ALCHEMY_STAGE=preview-42   npm run iac:deploy
 *   ALCHEMY_STAGE=preview-42   npm run iac:destroy
 *
 * State backend:
 *   - Local dev: `.alchemy/` JSON (gitignored).
 *   - CI / shared: Cloudflare KV via `ALCHEMY_STATE_STORE=cloudflare`.
 *     `ALCHEMY_PASSWORD` and `ALCHEMY_STATE_TOKEN` must be set.
 *
 * Auth:
 *   `CLOUDFLARE_API_TOKEN` (account: Agentic Engineering,
 *   id: 48f381bf59212dbd98d2b424ba4b9a04). The user's wrangler OAuth
 *   already covers the local dev path; CI uses a scoped service token.
 */
import alchemy from "alchemy";
import { CloudflareStateStore } from "alchemy/state";
import { landingStack } from "./alchemy/landing.ts";
import { sandboxStack } from "./alchemy/sandbox.ts";
import { appStack } from "./alchemy/app.ts";
import { dnsStack } from "./alchemy/dns.ts";
import { secretsStack } from "./alchemy/secrets.ts";

const stage = process.env.ALCHEMY_STAGE ?? "dev";

const app = await alchemy("code-colony", {
  stage,
  password: process.env.ALCHEMY_PASSWORD,
  stateStore:
    process.env.ALCHEMY_STATE_STORE === "cloudflare"
      ? (scope) => new CloudflareStateStore(scope)
      : undefined,
});

// Stacks intentionally compose top-down so the secrets stack runs first and
// later stacks can reference its outputs. `app` depends on the sandbox runner
// URL, and `dns` is the last to run because it binds every public hostname.
await secretsStack(app, { stage });
const landing = await landingStack(app, { stage });
const sandbox = await sandboxStack(app, { stage });
const appWorker = await appStack(app, { stage, sandbox });
await dnsStack(app, { stage, landing, app: appWorker, sandbox });

await app.finalize();
