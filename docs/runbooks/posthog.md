# PostHog Setup Runbook

PostHog is canonical for Code Colony product analytics, web analytics, AI
observability, payment/webhook lifecycle events, automation audit trails, and
error capture unless a separate active error tool is explicitly documented.
Do not add separate legacy AI-observability or error-reporting tools by default.

## Project setup

1. Create or select a PostHog project for Code Colony.
2. Set server env:

```bash
POSTHOG_API_KEY=phc_...
POSTHOG_HOST=https://us.i.posthog.com
```

3. Set browser env for Next/TanStack and landing:

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
VITE_PUBLIC_POSTHOG_KEY=phc_...
VITE_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

4. Keep `POSTHOG_DISABLED=1` for test fixtures or sensitive local debugging
   sessions where no event should leave the machine.

## Event conventions

| Event | Purpose |
| --- | --- |
| `repo_onboarding_started` / `repo_onboarding_completed` | Repository scan/import lifecycle |
| `agent_lifecycle_event` | Agent start/fail/finish lifecycle |
| `workflow_event` | Runtime workflow state and result metadata |
| `workpool_event` | Queue/workpool import and execution metadata |
| `ai_observation` | Model/provider/latency/token/cost metadata |
| `payment_lifecycle_event` | Dodo checkout/subscription/invoice lifecycle |
| `webhook_failure` | Failed inbound/outbound webhook verification or delivery |
| `automation_audit_event` | Automation decisions, dry-runs, and approvals |

## Redaction policy

Never send provider keys, auth/session tokens, webhook secrets, raw payment
payloads, private repo content, uploaded documents, full prompts, source code
diffs, or private legal/financial facts to PostHog. Use ids, statuses, counts,
latency, token counts, model names, provider names, and estimated cost instead.

The server helper at `src/observability/posthog.ts` redacts suspicious property
names by default, but callers still own event design.

## Dashboard checklist

- Activation funnel: repo scan → backlog import → runtime preview → artifact review.
- Agent health: lifecycle failures by agent and region.
- Workflow/workpool health: queue status, failure counts, latency.
- AI cost/latency: provider, model, token counts, estimated cost.
- Payments: checkout started/completed/failed, duplicate webhook rate.
- Automation audit: dry-run vs approved execution counts.

## Related runbooks

- Local dev: `docs/runbooks/local-dev.md`
- Secrets: `docs/runbooks/secrets.md`
- Workflows/workpools: `docs/runbooks/workflows-workpools.md`
