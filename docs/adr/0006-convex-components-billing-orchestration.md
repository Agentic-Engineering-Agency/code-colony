# ADR 0006 — Convex Components expansion (billing, agents, orchestration, email, webhooks)

- **Status**: Accepted, 2026-05-01
- **Owners**: Lalo / Code Colony platform
- **Linear**: AGE-63
- **Supersedes**: ADR 0004 rejection of `@akshatgiri/convex-orchestrator` (revisited)
- **Companion to**: ADR 0004 (core components), ADR 0001 (sandbox primitive)

## Context

ADR 0004 mounted eleven first-party components covering workflows, rate limits,
caches, auth, and storage. Since then, three new product surfaces have matured:

1. **Billing & payments** — Code Colony needs to charge for agent runs,
   sandbox minutes, and premium features. Building a payments stack from scratch
   (invoices, checkout, webhooks, customer portals) is a full-time team's work.
2. **Agent runtime & observability** — The Mastra-backed triage agent needs
   persistent message threads, LLM response caching, and debounced recomputation
   rather than ad-hoc `setTimeout` logic.
3. **Outbound notifications & browser automation** — Waitlist confirmations,
   webhook delivery to customer systems, and cloud browser sessions for scraping
   / testing repos all need durable, retry-safe infrastructure.

Rather than building one-off helpers for each concern, we adopt ten additional
Convex Components — a mix of first-party and community packages — that solve each
problem with typed, versioned APIs.

## Decision

Mount ten new components in `convex/convex.config.ts`. Every component ships a
thin wrapper in `convex/<name>.ts` (or registers HTTP routes in `convex/http.ts`)
so the rest of the codebase never imports `components.*` directly.

| Package | Why we use it | Wrapper / callsite |
| --- | --- | --- |
| `@dodopayments/convex` | Checkout sessions, customer portal, and webhook handling for Dodo Payments billing | `convex/dodoPayments.ts` |
| `@convex-dev/agent` | Persistent AI agent threads, messages, and streaming with built-in RAG and usage tracking | Inline in agent action files |
| `@steel-dev/convex` | Cloud browser sessions (scraping, screenshots, captcha solving) scoped per tenant | `convex/steel.ts` |
| `@convex-dev/resend` | Queued, batched email delivery with Resend — transactional and bulk | `convex/resendEmails.ts` |
| `@akshatgiri/convex-orchestrator` | Durable workflow orchestration with step execution, leasing, and signals | `exposeApi()` in orchestrator wrapper (future) |
| `convex-webhook-sender` | Managed outbound webhook delivery with HMAC signing, retries, and delivery tracking | `convex/webhookSender.ts` |
| `convex-timeline` | Undo/redo state management with named checkpoints for agent drafts / sandbox snapshots | `convex/timeline.ts` |
| `@ikhrustalev/convex-debouncer` | Server-side debouncing for LLM calls and expensive recomputation | `convex/debouncer.ts` |
| `@waynesutton/agent-ready` | Auto-generates `llms.txt`, `agents.md`, and `llms-full.txt` for AI agent discoverability | `convex/http.ts` `registerRoutes` |
| `@mzedstudio/llm-cache` | LLM request/response caching with tiered TTL, time travel, and request normalization | `convex/llmCache.ts` |

### Mount

All components are added to `convex/convex.config.ts` alongside the existing
 eleven from ADR 0004. `@mzedstudio/llm-cache` requires an explicit `name` option
 (`{ name: "llmCache" }`) to match its documented usage; all others mount with
 a plain `app.use(...)` call.

### Configuration

New environment variables (set via `npx convex env set`):

| Variable | Component(s) | Notes |
| --- | --- | --- |
| `DODO_PAYMENTS_API_KEY` | `dodopayments` | Required for checkout and customer portal |
| `DODO_PAYMENTS_ENVIRONMENT` | `dodopayments` | `test_mode` or `live_mode` |
| `DODO_PAYMENTS_WEBHOOK_SECRET` | `dodopayments` | Verify inbound Dodo webhooks |
| `STEEL_API_KEY` | `steel` | Cloud browser sessions from steel.dev |
| `RESEND_API_KEY` | `resend` | Email delivery via Resend |
| `RESEND_WEBHOOK_SECRET` | `resend` | Verify inbound Resend webhook events |

All wrappers guard against missing secrets by falling back to `null` or safe
defaults (e.g. `testMode: true` for Resend) so `npx convex deploy` never fails
at module load time.

### Revisiting ADR 0004 rejections

- **`@akshatgiri/convex-orchestrator`** — ADR 0004 rejected this because it
  assumed laptop-resident workers. In AGE-63 we mount it experimentally; the
  `exposeApi()` pattern can be wrapped inside a Convex action so worker polling
  is optional. If the local-worker model remains a hard requirement we will
  unmount it in a future ADR.

### Operational notes

- `--legacy-peer-deps` is still required because `@waynesutton/agent-ready`
  peers on `react@^18 || ^19` and `convex-helpers`, which may pull conflicting
  type packages. The flag is already documented in ADR 0004.
- `@convex-dev/agent` peers on `@convex-dev/rate-limiter` (already mounted)
  and `@convex-dev/workpool` (already an indirect dep via `workflow`). No
  duplicate mount is needed.
- `@waynesutton/agent-ready` peers on `@convex-dev/crons` and
  `@convex-dev/workpool`, both already present.

## Consequences

- **Pro**: Billing, agent memory, email, webhooks, browser automation, and
  orchestration are all first-class typed APIs rather than hand-rolled tables.
- **Pro**: Community components (`convex-timeline`, `convex-webhook-sender`,
  `@ikhrustalev/convex-debouncer`, `@mzedstudio/llm-cache`) are small,
  focused, and replaceable if upstream maintenance lapses.
- **Con**: The dependency graph grows by ~10 more packages. CI cache absorbs
  the impact but cold installs continue to slow down.
- **Con**: Third-party components may lag behind Convex core releases. We pin
  to `^` ranges and monitor changelogs during routine dependency updates.

## Verification

- `npm install --legacy-peer-deps` succeeds for all ten new packages.
- `npm run lint`, `npm run typecheck`, and `npm test` pass (root tsconfig
  excludes `convex/` so missing `_generated` symbols are non-blocking).
- `npx convex dev --once` mounts all 21 components cleanly once env vars are
  set (or stubs fall back safely when unset).

## Open follow-ups

- AGE-63+: create `convex/customers.ts` schema and wire `dodo.identify()` to
  map Better Auth users to Dodo Payments customers.
- AGE-63+: disable Resend `testMode` and set up the Resend webhook endpoint
  in the Resend dashboard.
- AGE-63+: run `npx agent-ready setup` to scaffold `agent-ready.config.json`
  and enable public serving of `llms.txt` / `agents.md`.
- AGE-63+: provision `STEEL_API_KEY` and build the first browser-automation
  action (repo preview screenshots).
- AGE-63+: evaluate `@akshatgiri/convex-orchestrator` worker model; either
  wrap `exposeApi()` in a Convex action or unmount if local workers are
  unavoidable.
- AGE-63+: wire `llmCache` into the Mastra LLM calls in `mastra/llm.ts` to
  reduce redundant OpenRouter requests.
- AGE-63+: add `debouncer.schedule()` to the triage pipeline for debounced
  re-evaluation when issue metadata changes rapidly.
- AGE-63+: wire `webhookSender` to notify external systems when agent runs
  complete or billing events occur.
- AGE-63+: add `timeline.push()` / `timeline.undo()` to agent draft revisions
  so users can roll back generated code.
- AGE-63+: update `convex/rateLimiter.ts` with new rate-limit names suggested
  by `@convex-dev/agent` (agent interactions) and `convex-webhook-sender`
  (webhook delivery) if needed.

## Status update (2026-05-04)

All AGE-63+ follow-ups remain Open. The ten new components are mounted and `npx convex dev --once` succeeds, but no wrapper file has been wired to product behavior yet:

- `dodopayments` — schema not created; no customer → payment mapping.
- `resend` — still in `testMode`; webhook endpoint not configured.
- `agent-ready` — config not scaffolded; `llms.txt` not served.
- `steel` — no API key provisioned; no browser-automation action.
- `orchestrator` — mounted experimentally; `exposeApi()` not evaluated.
- `webhookSender` — not wired to any event source.
- `timeline` — not integrated into agent draft flow.
- `debouncer` — not added to triage pipeline.
- `llmCache` — not wired into Mastra LLM calls.

See `docs/adr/STATUS.md` for the full follow-up registry.
