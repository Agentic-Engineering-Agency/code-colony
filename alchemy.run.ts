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
import { landingStack } from "./alchemy/landing.js";
import { sandboxStack } from "./alchemy/sandbox.js";
import { dnsStack } from "./alchemy/dns.js";
import { secretsStack } from "./alchemy/secrets.js";

const stage = process.env.ALCHEMY_STAGE ?? "dev";

const app = await alchemy("code-colony", {
  stage,
  password: process.env.ALCHEMY_PASSWORD,
});

// Stacks intentionally compose top-down so the secrets stack runs first and
// later stacks can reference its outputs. `dns` is the last to run because it
// depends on the public hostnames every other stack registers.
await secretsStack(app, { stage });
const landing = await landingStack(app, { stage });
const sandbox = await sandboxStack(app, { stage });
await dnsStack(app, { stage, landing, sandbox });

await app.finalize();
