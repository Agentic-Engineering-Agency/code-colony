# Workflow and Workpool Debugging Runbook

Code Colony has two orchestration layers:

- Convex durable workflows in `convex/triage.ts`, backed by
  `@convex-dev/workflow`.
- Sandbox/agent execution through Mastra and `apps/sandbox-runner/`, with
  workpool-style telemetry emitted as `workpool_event`.

## Local checks

```bash
npm test -- --run __tests__/convexWorkflowContracts.test.ts
npm test -- --run __tests__/aiAgentContracts.test.ts
npm --prefix apps/sandbox-runner test
```

When a Convex dev deployment is available:

```bash
npx convex dev --once --typecheck disable
npm run convex:typecheck
npx convex run seed:seedFromDemoData
```

## Common symptoms

| Symptom | Check |
| --- | --- |
| Triage workflow returns `issue not found` | Confirm `convex/seed.ts` ran and the backlog issue seed id exists. |
| Agent route returns non-conforming output | Check `mastra/agents/backlog-triage.ts` instructions and `src/server/triageRouteCore.ts` parser. |
| Sandbox tool unavailable | Confirm `SANDBOX_RUNNER_URL` and `SANDBOX_HMAC_KEY` are set; development mode intentionally skips the tool when missing. |
| HMAC failures | Compare signing algorithm in `mastra/sandboxClient.ts` and `apps/sandbox-runner/src/auth.ts`; rotate `SANDBOX_HMAC_KEY` on both sides together. |
| Workpool events missing in PostHog | Confirm `POSTHOG_API_KEY`/`POSTHOG_HOST` and `POSTHOG_DISABLED` are set correctly. |

## Safe retry process

1. Reproduce with local mocks first.
2. Run root tests and sandbox tests.
3. Run Convex dev sync only when a dev deployment is available.
4. Keep retries idempotent; do not duplicate payment, email, or webhook side effects.
5. Record failures as PostHog metadata only, not raw payloads.

## Related runbooks

- Local dev: `docs/runbooks/local-dev.md`
- PostHog: `docs/runbooks/posthog.md`
- Rollback: `docs/runbooks/rollback.md`
