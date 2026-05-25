# Deployment Secrets Runbook

Code Colony deploys use GitHub Actions repository secrets. Access is limited to repository admins and the Agentic Engineering infrastructure maintainers who can rotate the underlying provider credentials.

| Secret | Where to generate | Required scope | Rotation cadence | Access |
| --- | --- | --- | --- | --- |
| `CLOUDFLARE_API_TOKEN` | Cloudflare dashboard → My Profile → API Tokens, or an account-owned service token. | Workers Scripts write, Workers Routes write, Pages write, Containers write, Secrets Store write, Zone read/write for `codecolony.online`, KV/state access used by Alchemy. | 90 days, and immediately after maintainer offboarding. | Agentic Engineering Cloudflare account admins and GitHub repository admins. |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard account overview. Store the real value only in local env or GitHub Actions secrets/variables. | Identifier only; no secret provider scope. | Only when moving accounts. | GitHub repository admins; value may also appear in workflow env. |
| `ALCHEMY_PASSWORD` | Generate with a password manager or `openssl rand -base64 48`; store only in GitHub secrets and the shared admin vault. | Encrypts Alchemy state secrets before they are stored. | 180 days, coordinated with Alchemy state migration because changing it can make existing encrypted state unreadable. | Infrastructure maintainers only. |
| `ALCHEMY_STATE_TOKEN` | Cloudflare API token dedicated to Alchemy state storage. | Minimum Cloudflare KV/state permissions required by `ALCHEMY_STATE_STORE=cloudflare` for the Code Colony account. | 90 days, and immediately after maintainer offboarding. | Infrastructure maintainers and GitHub repository admins. |
| `CONVEX_DEPLOY_KEY` | Convex dashboard → project settings → deploy keys for the production project. | Deploy permission for the Code Colony Convex project. | 90 days, and immediately after maintainer offboarding. | Convex project admins and GitHub repository admins. |
| `OPENROUTER_API_KEY` | https://openrouter.ai/keys | Bearer token for OpenRouter's OpenAI-compatible API used by Mastra (`mastra/llm.ts`). | 30 to 60 days, or immediately on provider-side key exposure. | LLM service owners and GitHub repository admins. |
| `SANDBOX_HMAC_KEY` | Generate with a password manager or `openssl rand -base64 32`. | Shared HMAC key between the app Worker and sandbox-runner Worker. | 90 days; rotate app and sandbox deploys together. | Infrastructure maintainers and GitHub repository admins. |
| `DODO_PAYMENTS_API_KEY` | Dodo Payments dashboard → API Keys. | Billing/checkout integration via `@dodopayments/convex`. | On exposure or rotation policy from Dodo. | Billing admins and GitHub repository admins. |
| `DODO_PAYMENTS_WEBHOOK_SECRET` | Dodo Payments dashboard → Webhooks. | Verify incoming Dodo webhook signatures. | On exposure. | Billing admins and GitHub repository admins. |
| `STEEL_API_KEY` | Steel dashboard → API Keys (https://steel.dev). | Cloud browser sessions via `@steel-dev/convex`. | On exposure. | Infrastructure maintainers and GitHub repository admins. |
| `RESEND_API_KEY` | Resend dashboard → API Keys. | Email delivery via `@convex-dev/resend`. | On exposure. | Infrastructure maintainers and GitHub repository admins. |
| `RESEND_WEBHOOK_SECRET` | Resend dashboard → Webhooks. | Verify incoming Resend webhook signatures. | On exposure. | Infrastructure maintainers and GitHub repository admins. |
| `POSTHOG_API_KEY` | PostHog project settings → Project API key. | Server-side product, AI, payment, webhook, and automation telemetry. | On exposure or project migration. | Product/analytics owners and GitHub repository admins. |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project settings → Project API key. | Browser analytics for Next/TanStack surfaces. Public by design but still configured through env. | On project migration. | Product/analytics owners. |
| `VITE_PUBLIC_POSTHOG_KEY` | PostHog project settings → Project API key. | Browser analytics for the Vite landing app. Public by design but still configured through env. | On project migration. | Product/analytics owners. |

## Rotation notes

1. Add the new provider credential in GitHub Actions secrets before revoking the old value.
2. Run the preview workflow on a test PR to verify the new credential shape.
3. For production, merge only after preview succeeds; the prod workflow picks up the new secret on the next `main` push.
4. Revoke the old provider credential after the replacement workflow succeeds.
5. For `SANDBOX_HMAC_KEY`, rotate both the app Worker and sandbox-runner Worker in the same deployment so requests are signed and verified with the same key.

## Local development secrets

| File | Surface | Required variables |
| --- | --- | --- |
| `.env.local` (repo root) | Next.js + Convex dev | `CONVEX_DEPLOYMENT` (deployment slug, e.g. `code-colony-prod`) |
| `.env.local` (repo root) | Next.js + TanStack + local route cores | see `.env.example` for Convex, Better Auth, AI, Dodo, Resend, R2, Alchemy, PostHog, app URLs, and webhook placeholders |
| `.env.local` (`apps/landing/`) | Vite landing dev | see `apps/landing/.env.example` |
| `.dev.vars` (`apps/sandbox-runner/`) | sandbox-runner local dev | `SANDBOX_HMAC_KEY` |

Both files are gitignored. `SANDBOX_HMAC_KEY` can also be set via `wrangler secret put SANDBOX_HMAC_KEY` for remote deploys; `.dev.vars` is the local-only shortcut.

## Related runbooks

- CI: `docs/runbooks/ci.md`
- Local dev: `docs/runbooks/local-dev.md`
- Deploys: `docs/runbooks/deployment.md`
- PostHog: `docs/runbooks/posthog.md`
- Rollback: `docs/runbooks/rollback.md`
- IaC architecture: `docs/adr/0002-iac-alchemy.md`
