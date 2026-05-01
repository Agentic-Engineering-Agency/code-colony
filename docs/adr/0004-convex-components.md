# ADR 0004 — Convex Components stack

- **Status**: Accepted, 2026-04-29
- **Owners**: Lalo / Code Colony platform
- **Linear**: AGE-62
- **Supersedes**: none. Companion to ADR 0001 (sandbox primitive) and ADR 0002 (IaC)

## Context

The MVP runs against a Convex dev deployment with a hand-written schema and a
single seed mutation. Several upcoming surfaces (durable agent runs, rate
limits on FreeLLMAPI, OG-image storage in R2, real waitlist signups, streaming
LLM rationale) need infrastructure that is awkward to express directly on raw
Convex tables. Convex publishes a curated set of *components* — pre-packaged,
versioned modules that mount under `app.use(...)` and expose a typed client —
which solves each of these without growing our own one-off helpers.

## Decision

Adopt eleven first-party Convex Components. Each one solves a concrete Code
Colony need and earns its place in the dependency graph; we did **not** install
the broader catalogue. The mount point is `convex/convex.config.ts`.

| Package                                 | Why we use it                                                            | Demo callsite                                                |
| --------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------ |
| `@convex-dev/workflow`                  | Durable multi-step workflows for triage / agent run / approval pipelines | `convex/triage.ts` `triageWorkflow`                          |
| `@convex-dev/rate-limiter`              | Per-email and per-key limits without ad-hoc `Date.now()` math            | `convex/waitlist.ts` `join`, `convex/triage.ts` `startTriage` |
| `@convex-dev/action-cache`              | TTL cache for LLM/external-API actions                                   | `convex/cache.ts` `triageCache`                              |
| `@convex-dev/action-retrier`            | Exponential-backoff retry for flaky external actions                     | `convex/retrier.ts` + `convex/triage.ts`                     |
| `@convex-dev/aggregate`                 | O(log n) sum/count of `agentEmployees.trust`                             | `convex/trustLedger.ts`                                      |
| `@convex-dev/sharded-counter`           | High-throughput per-region sandbox-spawn counters                        | `convex/triage.ts` `recordSandboxSpawn`                      |
| `@convex-dev/migrations`                | Resumable batched migrations                                             | `convex/migrations.ts` `backfillWaitlistJoinedAt`            |
| `@convex-dev/persistent-text-streaming` | Stream LLM tokens to the browser while persisting them                   | `convex/streaming.ts` + `convex/http.ts` `/chat-stream`      |
| `@convex-dev/crons`                     | Dynamic cron registration                                                | `convex/dynamicCrons.ts` `health-ping` interval              |
| `@convex-dev/better-auth`               | Email/password + session + provider auth on Convex                       | `convex/auth.ts` + `/api/auth/*` HTTP routes                 |
| `@convex-dev/r2`                        | First-party Cloudflare R2 file storage                                   | `convex/r2.ts` `getOgImageUrl`, `getDemoVideoUrl`            |

### Mount

`convex/convex.config.ts` calls `app.use(...)` for each component. The Convex
build step expands these into a `components` namespace exposed via
`./_generated/api`. Wrappers live in `convex/<name>.ts` and never reach into
`components.*` from outside that file, so the rest of the codebase only sees a
strongly typed facade (`workflow`, `rateLimiter`, `triageCache`, …).

### Configuration

Components that read environment variables expect them via
`npx convex env set`:

| Variable                | Component(s)               | Notes                                                                |
| ----------------------- | -------------------------- | -------------------------------------------------------------------- |
| `SITE_URL`              | `better-auth`, dynamic-crons | Origin of the Next.js app (`https://codecolony.dev` in production) |
| `BETTER_AUTH_SECRET`    | `better-auth`              | 32+ random bytes; rotates yearly                                     |
| `R2_ENDPOINT`           | `r2`                       | `https://<account>.r2.cloudflarestorage.com`                         |
| `R2_BUCKET`             | `r2`                       | e.g. `code-colony-prod`                                              |
| `R2_ACCESS_KEY_ID`      | `r2`                       |                                                                      |
| `R2_SECRET_ACCESS_KEY`  | `r2`                       |                                                                      |
| `R2_TOKEN`              | `r2`                       | Cloudflare API token with R2 read/write                              |

The dev deployment currently has `SITE_URL=http://localhost:3000` set. R2 vars
are intentionally unset — provisioning lands in AGE-58 (Alchemy stacks).

### Rejections

- **`@akshatgiri/convex-orchestrator`** — overlaps with `@convex-dev/workflow`
  but ships explicit TODOs for retries, cancellation, observability, and
  authentication as of 2026-04-29. The published model also assumes a
  laptop-resident worker, which contradicts our Workers-first deployment.
  Revisit only if local-machine step execution becomes a hard requirement.
- **`@convex-dev/expo-push-notifications`** — no mobile client.
- **`@convex-dev/workpool`** — already an indirect peer dep via `workflow`.
  Mounting it twice would split the workpool state.
- **`@convex-dev/presence`** — defer to the multiplayer-UX milestone.
- **`@convex-dev/rag`** — defer until we pick an embedding provider.

### Schema additions

Three component-facing tables:

- `waitlistEntries(email, role, repo?, joinedAt)` with `by_email` for dedupe.
- `triageStreams(issueSeedId, streamId)` for the persisted stream record id.
- `r2Assets(key, uploadedAt, runSeedId?, filename?)` indexes uploaded keys so
  Convex queries do not need to ask R2 for the object listing.

`backlogIssues` gains an optional `triageSuggestion` field used by the
durable triage workflow.

### Operational notes

- npm install requires `--legacy-peer-deps` because `better-auth` pulls in
  `@lynx-js/react@0.120.0` which pins `@types/react@^18`. Convex itself is
  unaffected.
- `convex/types.d.ts` declares an ambient `process` so the Convex tsconfig
  does not need `@types/node` just for `process.env.SITE_URL` lookups.
- The component named `crons` clashes with Convex's built-in
  `convex/crons.ts` filename convention. We rename our wrapper to
  `convex/dynamicCrons.ts` and mount it under the same `crons` component name.

## Consequences

- **Pro**: every cross-cutting concern (rate limits, retries, caches,
  counters, streaming, migrations, auth, R2) is exposed via a single typed
  client in `convex/<name>.ts`. Removing or swapping a component touches one
  wrapper file plus the `convex.config.ts` mount.
- **Pro**: `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`
  pass unchanged because the root `tsconfig.json` excludes `convex/` from the
  Next.js typecheck, and the convex-specific typecheck runs as part of
  `npx convex dev`.
- **Con**: 12 new component packages (11 + `@convex-dev/workpool` peer) raise
  the install footprint by ~750 packages. CI cache mitigates the impact but
  cold installs are slower.
- **Con**: `better-auth` brings transitive React 18 type peers; `--legacy-peer-deps`
  is now required for fresh installs until upstream relaxes the peer.

## Verification

- `npx convex dev --once` installs all 11 components cleanly.
- `bash scripts/smoke.sh` exercises `waitlist:join`, `waitlist:count`,
  `triage:recordSandboxSpawn`, `triage:sandboxSpawnsForRegion`, and
  `system:ping` against the dev deployment.
- Vitest, lint, typecheck, and `next build` all pass.

## Open follow-ups

- AGE-50: ship the landing-page sign-up that calls `waitlist.join` from the
  browser via `convex/react`.
- AGE-55: replace the simulated triage agent in `convex/triage.ts` with the
  real Mastra `backlogTriageAgent` invocation through the sandbox runner.
- AGE-58 / AGE-59: provision the R2 bucket + secrets via Alchemy and wire
  `R2_*` env vars through `npx convex env set`.
- Better Auth: ship the React provider + sign-in form on `apps/landing` and
  the proxy handler in `apps/code-colony/app/api/auth/[...all]/route.ts`.
