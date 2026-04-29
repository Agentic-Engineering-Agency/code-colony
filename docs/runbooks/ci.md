# CI Runbook

Authoritative source: [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml).

## Triggers

- `pull_request` — every PR.
- `push` to `main` — post-merge guardrail.

## Concurrency

```
group: ${{ github.workflow }}-${{ github.event.pull_request.number || github.run_id }}
cancel-in-progress: pull_request only
```

Re-pushing to a PR cancels the in-flight CI run for that PR. Pushes to `main` are
isolated per `run_id`, so they never cancel each other.

## Matrix legs

CI runs four parallel workspace legs and a final aggregator. Each leg is its own
job because the commands diverge per workspace.

| Leg | Job id | Workspace | Verifies | Skip-with-success guard |
| --- | --- | --- | --- | --- |
| root | `root` | repo root (Next.js) | `npm ci` → lint → typecheck → vitest → `next build` | always runs (root `package.json` is required) |
| landing | `landing` | `apps/landing/` (Vite) | `npm ci` → typecheck → `vite build` | step probe: skipped when `apps/landing/package.json` is absent |
| sandbox | `sandbox` | `apps/sandbox-runner/` (Cloudflare Worker) | `npm ci` → vitest → `wrangler deploy --dry-run` | step probe: skipped when `apps/sandbox-runner/package.json` is absent |
| convex | `convex` | `convex/` (root install) | full Convex dev sync (`convex dev --once`) + `tsc --noEmit -p convex/tsconfig.json` | step probe: skipped when `CONVEX_DEPLOY_KEY` secret is absent (e.g. fork PRs) |

The probe steps make CI safe to merge **before** the apps land. Once an app's
`package.json` exists on the branch, that leg starts running real checks
automatically — no workflow edit needed.

## Per-leg notes

### root

Mirrors the historical single-job behavior: lint, typecheck, vitest, and
`next build`. This leg owns the Next.js app, the shared `src/server/*RouteCore`
modules, the `src/domain/*` types and seed data, and the `__tests__/` suite.

### landing

Vite SPA at `apps/landing/`. No tests yet; CI runs typecheck + production build
to catch regressions in the marketing surface. Tests will be added under the
same leg when the app introduces them.

### sandbox

Cloudflare Worker at `apps/sandbox-runner/`. Runs `vitest` for unit tests and
`wrangler deploy --dry-run` to validate the Worker entry, bindings, and
`wrangler.toml`. The dry-run does **not** publish.

`WRANGLER_DOCKER_BIN: /usr/bin/true` is exported at the job level so wrangler
skips its Docker probe in CI (the runner has no Docker daemon and no `--dry-run`
work needs containers).

### convex

The Convex CLI requires a deployment context for both `dev` and `codegen` —
there is no fully offline mode. The leg therefore branches on the presence of
the `CONVEX_DEPLOY_KEY` secret.

- **Secret present** (default for branches pushed inside this repo):
  `npx convex dev --once --typecheck disable` performs a full dev sync —
  it pushes the current schema and function definitions to the configured dev
  deployment, regenerates `convex/_generated/`, and exits. The job then runs
  `npx tsc --noEmit -p convex/tsconfig.json` to typecheck `convex/*.ts` against
  the freshly generated types.
- **Secret absent** (fork PRs, or repos that have not configured the secret):
  the leg's probe step writes `ready=false`, every subsequent step is gated by
  `if: steps.probe.outputs.ready == 'true'` and is skipped, and the job ends
  green with a `::notice::` line explaining the skip. Convex code is **not**
  validated on these PRs — the post-merge `push` run on `main` (where the
  secret is always available) is the backstop.

Why the secret gate is the right primitive here: the Convex CLI's `codegen`
subcommand still calls into the deployment selection layer, which exits with
`No CONVEX_DEPLOYMENT set` when neither `CONVEX_DEPLOYMENT` nor
`CONVEX_DEPLOY_KEY` is configured. There is no documented offline-only
codegen flag at the package version pinned in this repo.

The convex leg deliberately runs `npm ci` at the repo root rather than inside
`convex/`, because the Convex CLI ships with the root dependency tree.

## Final status check

`ci` is the single required status check. Branch protection should be
configured to require it (and only it) — the per-leg jobs do not need to be
required individually because `ci` only succeeds when every matrix leg either
succeeded or skipped-with-success.

```
needs: [root, landing, sandbox, convex]
if: always()              # run even if a leg fails, so the rollup can fail
```

The aggregator step inspects `needs.<leg>.result`. Allowed values: `success`
and `skipped`. Any `failure` or `cancelled` causes the rollup to fail, which
fails the required check `ci`.

## Adding a new workspace leg

1. Add a new job above the `ci` job. Mirror the `landing` or `sandbox` shape if
   it lives under `apps/`; mirror `convex` if it shares the root install.
2. Use a `probe` step (or `hashFiles(...)` `if:` guard) so the leg is safe to
   merge before the workspace exists.
3. Add the new job id to `needs:` on the `ci` job and add a row above.
4. If the leg needs secrets that fork PRs cannot access, document the offline
   fallback the same way the convex leg does.

## Out of scope

Deployment is **not** part of `ci.yml`. Deploys live in `cd-*.yml` workflows
(see CC-CI-02). Do not add `wrangler deploy` (without `--dry-run`),
`vercel deploy`, or `convex deploy` here.
