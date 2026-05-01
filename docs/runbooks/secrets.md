# Deployment Secrets Runbook

Code Colony deploys use GitHub Actions repository secrets. Access is limited to repository admins and the Agentic Engineering infrastructure maintainers who can rotate the underlying provider credentials.

| Secret | Where to generate | Required scope | Rotation cadence | Access |
| --- | --- | --- | --- | --- |
| `CLOUDFLARE_API_TOKEN` | Cloudflare dashboard → My Profile → API Tokens, or an account-owned service token. | Account `48f381bf59212dbd98d2b424ba4b9a04`; Workers Scripts write, Workers Routes write, Pages write, Containers write, Secrets Store write, Zone read/write for `codecolony.online`, KV/state access used by Alchemy. | 90 days, and immediately after maintainer offboarding. | Agentic Engineering Cloudflare account admins and GitHub repository admins. |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard account overview. Current value: `48f381bf59212dbd98d2b424ba4b9a04`. | Identifier only; no secret provider scope. | Only when moving accounts. | GitHub repository admins; value may also appear in workflow env. |
| `ALCHEMY_PASSWORD` | Generate with a password manager or `openssl rand -base64 48`; store only in GitHub secrets and the shared admin vault. | Encrypts Alchemy state secrets before they are stored. | 180 days, coordinated with Alchemy state migration because changing it can make existing encrypted state unreadable. | Infrastructure maintainers only. |
| `ALCHEMY_STATE_TOKEN` | Cloudflare API token dedicated to Alchemy state storage. | Minimum Cloudflare KV/state permissions required by `ALCHEMY_STATE_STORE=cloudflare` for the Code Colony account. | 90 days, and immediately after maintainer offboarding. | Infrastructure maintainers and GitHub repository admins. |
| `CONVEX_DEPLOY_KEY` | Convex dashboard → project settings → deploy keys for the production project. | Deploy permission for the Code Colony Convex project. | 90 days, and immediately after maintainer offboarding. | Convex project admins and GitHub repository admins. |
| `FREELLM_API_KEY` | FreeLLMAPI provider dashboard or the AGE-56 tunnel owner vault entry. | Bearer token for the FreeLLMAPI-compatible endpoint used by Mastra. | 30–60 days, or immediately on provider-side key exposure. | LLM service owners and GitHub repository admins. |
| `SANDBOX_HMAC_KEY` | Generate with a password manager or `openssl rand -base64 32`. | Shared HMAC key between the app Worker and sandbox-runner Worker. | 90 days; rotate app and sandbox deploys together. | Infrastructure maintainers and GitHub repository admins. |

## Rotation notes

1. Add the new provider credential in GitHub Actions secrets before revoking the old value.
2. Run the preview workflow on a test PR to verify the new credential shape.
3. For production, merge only after preview succeeds; the prod workflow picks up the new secret on the next `main` push.
4. Revoke the old provider credential after the replacement workflow succeeds.
5. For `SANDBOX_HMAC_KEY`, rotate both the app Worker and sandbox-runner Worker in the same deployment so requests are signed and verified with the same key.
