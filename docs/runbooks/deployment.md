# Staging and Production Deploy Runbook

## Boundaries

Deploys are not autonomous. Run these commands only when the current task
explicitly asks for staging, preview, or production deployment.

CI (`.github/workflows/ci.yml`) is limited to install, lint, typecheck, tests,
build, TanStack build, Convex gated checks, Worker dry-runs, and offline IaC
validation. Live deployment belongs to `cd-preview.yml`, `cd-preview-cleanup.yml`,
`cd-prod.yml`, or an explicit human-approved local command.

## Preview

```bash
npm run tanstack:build
ALCHEMY_STAGE=preview-123 npm run iac:diff
ALCHEMY_STAGE=preview-123 npm run iac:deploy
```

Use a PR-number stage. Destroy after validation:

```bash
ALCHEMY_STAGE=preview-123 npm run iac:destroy
```

## Production

Production deploy prerequisites:

- CI is green on the commit being deployed.
- `CLOUDFLARE_API_TOKEN`, `ALCHEMY_PASSWORD`, `ALCHEMY_STATE_TOKEN`,
  `CONVEX_DEPLOY_KEY`, `OPENROUTER_API_KEY`, and `SANDBOX_HMAC_KEY` are present
  in GitHub Actions secrets.
- Dodo and Resend dashboards are in the intended test/live modes.
- PostHog project key/host are configured and redaction rules are understood.

Production deploy path:

```bash
npm run tanstack:build
ALCHEMY_STAGE=prod ALCHEMY_STATE_STORE=cloudflare npm run iac:diff
ALCHEMY_STAGE=prod ALCHEMY_STATE_STORE=cloudflare npm run iac:deploy
```

Convex production deploys should use the existing Convex deploy workflow or:

```bash
npx convex deploy
```

Run that only when the task explicitly authorizes production Convex changes.

## Rollback

Use `docs/runbooks/rollback.md`. Remember that Wrangler rollback changes the
runtime version but not Alchemy desired state; fix source or Alchemy may
re-promote the broken version on the next deploy.

## Related runbooks

- Local dev: `docs/runbooks/local-dev.md`
- CI: `docs/runbooks/ci.md`
- Secrets: `docs/runbooks/secrets.md`
- Rollback: `docs/runbooks/rollback.md`
