# Deployment Rollback Runbook

Use rollback when a production deploy regresses the app, landing page, sandbox runner, or Convex backend. Prefer reverting the offending Git commit and redeploying when the failure is understood; use provider rollback for immediate restoration.

## Workers rollback

Workers covered by AGE-46/AGE-49:

- `code-colony-app`
- `code-colony-sandbox-runner`

List versions and deployments:

```bash
npx wrangler deployments list --name code-colony-app
npx wrangler deployments list --name code-colony-sandbox-runner
```

Rollback a Worker to the previous healthy version:

```bash
npx wrangler rollback --name code-colony-app
npx wrangler rollback --name code-colony-sandbox-runner
```

If Wrangler prompts for a specific version, select the last known healthy deployment from the list. After rollback, verify the custom domains:

- `https://app.codecolony.agenticengineering.lat`
- `https://sandbox.codecolony.agenticengineering.lat`

## Landing Pages rollback

Cloudflare Pages project: `code-colony-landing`.

Dashboard path:

1. Cloudflare dashboard → Workers & Pages → `code-colony-landing`.
2. Open Deployments.
3. Select the last known healthy deployment.
4. Promote it to production.

CLI-assisted lookup:

```bash
npx wrangler pages deployment list --project-name code-colony-landing
```

If the dashboard promotion is unavailable, check out the known-good commit and redeploy the Pages project from `apps/landing` with the existing production settings.

## Convex rollback

Convex deploys are versioned by deployment. Identify the previous healthy version in the Convex dashboard or release notes, then run the targeted version command from the repo root:

```bash
npx convex run --version <prev>
```

If schema changes are involved, confirm the previous functions are compatible with current data before rollback. For destructive schema mistakes, stop traffic at the Worker layer first, snapshot/export affected data where possible, then restore the last known compatible Convex version.

## After rollback

1. Open or update the incident issue with the rolled-back deployment identifiers.
2. Re-run `npm run lint`, `npm run typecheck`, and `npm test` on the revert/fix branch.
3. Open a forward-fix PR and let CI pass before re-enabling the production deploy path.
