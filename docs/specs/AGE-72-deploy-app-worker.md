# AGE-72 — CC-DEPLOY-01 Wire app Worker deploy: vite build → alchemy entrypoint

Linear: AGE-72. Branch: `feat/age-72-deploy-app-worker`. Conventions: see `AGENTS.md` (one-concept-one-representation, edit > create, no tombstones, conventional commits with `AGE-72:` prefix). Coexistence context: AGE-44 (Next.js + TanStack Start parallel coexistence). Rollback contract: `docs/runbooks/rollback.md`.

## Goal

Re-enable the TanStack Start app Worker in production by inserting a `vite build` step into `cd-prod.yml` ahead of `iac:deploy`, repointing `alchemy/app.ts` `Worker.entrypoint` at the built artifact, and uncommenting `appStack` in `alchemy.run.ts`, so that `https://app.codecolony.online` serves SSR HTML produced by the same artifact alchemy uploads.

## Non-goals

- Removing or replacing the Next.js app at the repo root. Coexistence per AGE-44 stays intact; nothing under `app/page.tsx`, `app/layout.tsx`, `app/api/`, `next.config.mjs`, or the `npm run build` (`next build`) script changes in this PR.
- Introducing a new alchemy stack. Only `alchemy/app.ts` and `alchemy.run.ts` are edited; `alchemy/landing.ts`, `alchemy/sandbox.ts`, `alchemy/dns.ts`, `alchemy/secrets.ts` are not touched.
- Changing wrangler.jsonc semantics for local dev (`npm run dev:tanstack` continues to use the virtual `@tanstack/react-start/server-entry` module via vite). Only the deploy-time entrypoint switches to the built artifact path.
- Changing the bindings surface of the app Worker. The CONVEX_URL / OPENROUTER_* / SANDBOX_* binding shape from `alchemy/app.ts` is preserved verbatim; this PR does not add, remove, or rename a binding.
- Migrating any secret to Cloudflare Secrets Store. The deploy `CLOUDFLARE_API_TOKEN` lacks `Secrets Store: Edit`, so secrets must continue to flow inline through `alchemy.secret(process.env.X)` (see `docs/runbooks/secrets.md`).
- Re-enabling per-PR app previews on a custom subdomain. Previews continue to use the `*.workers.dev` fallback URL the cd-preview workflow already comments on the PR.
- Adding a new CI leg to `ci.yml`. Build-on-PR for the TanStack Start surface is out of scope and tracked separately (see Out-of-scope follow-ups).

## API / contract

### Build artifact path (deploy contract)

The `@cloudflare/vite-plugin` running with `viteEnvironment: { name: "ssr" }` (see `vite.config.mts`) emits a Cloudflare Worker bundle for the SSR environment under the project's Vite `outDir`. The exact path is treated as a single source of truth in `alchemy/app.ts` and is captured by a constant added to that file:

```ts
// alchemy/app.ts (new constant; replaces WRANGLER_ENTRYPOINT at deploy time)
const BUILT_WORKER_ENTRYPOINT = "dist/server/index.mjs";
```

The exact filename emitted by `@cloudflare/vite-plugin@1.34.0` paired with `@tanstack/start-plugin-core@1.169.6` for the `ssr` environment is verified during Phase D against an actual `npm run build:tanstack` run on this worktree. The verified emit on this branch is `dist/server/index.mjs` (the SSR Vite environment writes its rolldown output to `dist/server/`, not `dist/ssr/` — the latter is only the *environment name*, not the on-disk folder). The constant is the only place the path appears; no string is duplicated in CI scripts, runbooks, or wrangler.jsonc.

`wrangler.jsonc` `main` is intentionally left as `@tanstack/react-start/server-entry` so that local `wrangler dev` and `npm run dev:tanstack` continue to work against the virtual module. The deploy contract is asserted by alchemy, not wrangler.jsonc.

### `alchemy/app.ts` deltas

```ts
// before (current)
const WRANGLER_ENTRYPOINT = "@tanstack/react-start/server-entry";
// ...
entrypoint: WRANGLER_ENTRYPOINT,

// after (this PR)
const BUILT_WORKER_ENTRYPOINT = "dist/server/index.mjs"; // verified in Phase D
// ...
entrypoint: BUILT_WORKER_ENTRYPOINT,
```

`AppStackArgs`, `AppStackOutput`, `compatibilityDate`, `compatibilityFlags`, and the `bindings` block are unchanged. `Worker.adopt` stays absent (parity with current `appStack` behavior; sandbox stack uses `adopt: true`, app stack does not — that asymmetry is intentional and out of scope).

### `alchemy.run.ts` deltas

Lines 29 and 50 (currently `// import { appStack } ...` and `// const appWorker = await appStack(...)`) are uncommented. The order remains: `secretsStack` → `landingStack` → `sandboxStack` → `appStack` → `dnsStack`. The `dnsStack` `app` argument switches from `{ hostname: undefined, workerName: "code-colony-app" }` to `{ hostname: appWorker.hostname, workerName: appWorker.workerName }` so the `CustomDomain("app", ...)` branch in `alchemy/dns.ts` (line 67, gated on `args.app.hostname`) actually runs in prod and binds `app.codecolony.online` to the app Worker.

### Bindings (verbatim from `alchemy/app.ts`, prod values)

| Key | Type | Prod value | Source |
| --- | --- | --- | --- |
| `CONVEX_URL` | string literal | `https://pastel-cricket-679.convex.cloud` | constant in `alchemy/app.ts` |
| `OPENROUTER_URL` | string literal | `https://openrouter.ai/api/v1` | constant `OPENROUTER_URL` |
| `OPENROUTER_MODEL_ID` | string literal | `qwen/qwen3-coder:free` | constant `OPENROUTER_MODEL_ID` |
| `OPENROUTER_API_KEY` | secret | `alchemy.secret(process.env.OPENROUTER_API_KEY)` | GitHub secret |
| `SANDBOX_RUNNER_URL` | string | `args.sandbox.hostname` || `https://${args.sandbox.workerName}.${ACCOUNT_ID}.workers.dev` | sandbox stack output |
| `SANDBOX_HMAC_KEY` | secret | `alchemy.secret(process.env.SANDBOX_HMAC_KEY)` | GitHub secret |

No binding is added, removed, or renamed. The `alchemy.secret(...)` wrapper is mandatory because the deploy token does not carry `Secrets Store: Edit` (see `docs/runbooks/secrets.md`); inline-encrypted state is the only available path.

### npm scripts

No new scripts. The existing `build:tanstack` is reused verbatim:

```bash
npm run build:tanstack   # \u2192 vite build --config vite.config.mts
```

### TanStack Start scaffolding completion (AGE-44 follow-through)

AGE-44 (`docs/adr/0005-tanstack-start.md`) scaffolded `app/routes/__root.tsx`, `app/routes/index.tsx`, and `app/routeTree.gen.ts` but never produced the `app/router.tsx` entry that `@tanstack/start-plugin-core@1.169.6` requires (`node_modules/@tanstack/start-plugin-core/dist/esm/planning.js` line 63 \u2014 `defaultEntry: "router"`, `required: true`). AGE-72 is the first PR to actually run `vite build`, so it is also the first PR where the missing entry blocks anything; this PR adds it as the minimum scaffolding that lets `vite build` complete. The new file exports `getRouter()` (matching the `#tanstack-router-entry` contract used by `@tanstack/start-client-core/dist/esm/client/hydrateStart.js` line 5) and contains no app behavior \u2014 it only wires `routeTree` into `createRouter`.

AGE-72 also corrects two pre-existing typos in the `tanstackStart(...)` plugin invocation in `vite.config.mts`: `routesDirectory` and `generatedRouteTree` were declared as `"app/routes"` / `"app/routeTree.gen.ts"`, but `@tanstack/start-plugin-core@1.169.6`'s `dist/esm/schema.js` line 43 resolves them via `path.resolve(root, srcDirectory, options.router.routesDirectory ?? "routes")` \u2014 i.e. relative to `srcDirectory` (`"app"`), not relative to the worktree root. The original strings double-prefixed to `app/app/routes` / `app/app/routeTree.gen.ts`, the route generator silently produced an empty manifest, and the SSR build crashed in `start-manifest-plugin` on `Object.entries(undefined)`. The corrected values are `"routes"` / `"routeTree.gen.ts"`; the resolved on-disk paths (`app/routes` / `app/routeTree.gen.ts`) are unchanged.

Finally, `vite.config.ts` is renamed to `vite.config.mts` because Vite 8.0.10's Rolldown-based config loader (`node_modules/vite/dist/node/chunks/node.js` `isFilePathESM`, line 1769) treats a `.ts` config without `package.json#type="module"` as CommonJS and `require()`s its plugin imports. `@tanstack/react-start@1.167.51` is ESM-only, so the require throws \"This package is ESM only but it was tried to load by require\" before any plugin runs. The `.mts` extension forces ESM evaluation. The npm scripts (`dev:tanstack`, `build:tanstack`) and the legacy `app.config.ts` shim are updated to the new filename. `package.json` is *not* given `"type": "module"` because that would ripple into Next.js (out of AGE-72 scope; tracked under Out-of-scope follow-ups).

### CI step insertion (cd-prod.yml)

A single `Build TanStack Start app` step is inserted between `Install Alchemy for deploy` (currently the step at line 80) and `Deploy Cloudflare infrastructure` (currently the step at line 83). Placement rationale: alchemy needs the build artifact resolvable on disk before `iac:deploy` runs; the alchemy install step itself does not depend on the artifact, so build comes after install for cache locality on the npm cache reused by both `npm ci` (line 35) and the alchemy install.

```yaml
      - name: Build TanStack Start app
        run: npm run build:tanstack
```

No env vars are added to the workflow. The build step inherits the job-level `env:` block (lines 14–25). `CONVEX_URL` is a build-time literal already inlined in `alchemy/app.ts`; the build itself does not require any of the deploy secrets.

### CI step insertion (cd-preview.yml)

Mirror insertion: a `Build TanStack Start app` step is added between `Install Alchemy for deploy` (line 91) and `Deploy Cloudflare preview infrastructure` (line 94), gated by the same `if: steps.deploy-secrets.outputs.ready == 'true'` so preview build does not run on fork PRs that cannot deploy anyway.

```yaml
      - if: steps.deploy-secrets.outputs.ready == 'true'
        name: Build TanStack Start app
        run: npm run build:tanstack
```

### Build-time vs deploy-time environment

| Phase | Tool | Env it reads | Where it comes from |
| --- | --- | --- | --- |
| Build | `vite build` | none from repo secrets; only the literal CONVEX_URL / OPENROUTER_URL constants embedded by alchemy at deploy time, plus any `import.meta.env.*` usage in `app/` (none today) | GitHub Actions runner, no secrets required |
| Deploy | `alchemy deploy` (Worker upload) | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `ALCHEMY_PASSWORD`, `ALCHEMY_STATE_TOKEN`, `ALCHEMY_STATE_STORE`, `ALCHEMY_STAGE`, `OPENROUTER_API_KEY`, `SANDBOX_HMAC_KEY` | GitHub Actions secrets in `cd-prod.yml` lines 14–25 |
| Deploy (preview) | same | same minus `BETTER_AUTH_SECRET`, `SLACK_WEBHOOK_URL` | `cd-preview.yml` lines 18–29 |

Build-time env never sees secrets. Deploy-time secrets are passed only to alchemy via `process.env.*` and re-bound through `alchemy.secret(...)`.

### Worker naming

- prod: `code-colony-app` (no stage prefix; `namePrefix = ""` in `alchemy/app.ts`).
- preview: `${stage}-code-colony-app` where `stage = "preview-${PR_NUMBER}"`. Hostname falls back to `https://${stage}-code-colony-app.48f381bf59212dbd98d2b424ba4b9a04.workers.dev`. No custom subdomain is bound for preview (dnsStack early-returns when `stage !== "prod"`, see `alchemy/dns.ts` line 45).
- prod hostname binding: `CustomDomain("app", { name: "app.codecolony.online", zoneName: "codecolony.online", workerName: "code-colony-app", adopt: true })` from `alchemy/dns.ts` lines 67–74.

## Behavior

### AGE-72/S1 — Happy-path prod deploy

- Given `main` advances with this PR merged, all required secrets in the cd-prod job env are populated, and `dist/` does not yet exist on the runner.
- When the `CD Prod` workflow runs `npm ci` → tests → optional Convex deploy → `npm install --no-save alchemy` → `npm run build:tanstack` → `npm run iac:deploy -- --stage prod`.
- Then `vite build` writes the SSR Worker bundle under `dist/ssr/` (path verified Phase D), `appStack` calls `Worker(...)` with `entrypoint: BUILT_WORKER_ENTRYPOINT`, `dnsStack` binds `app.codecolony.online` via `CustomDomain("app", ...)`, the apex Pages domain step still runs after, and `curl --fail-with-body https://app.codecolony.online/` returns HTTP 200 with SSR HTML containing a TanStack Start root marker.

### AGE-72/S2 — Per-PR preview deploy

- Given a PR is opened with `ALCHEMY_STAGE=preview-<n>` derived from the PR number and all `deploy-secrets` are configured.
- When `CD Preview` runs the same build step under the new gate and then `npm run iac:deploy -- --stage preview-<n>`.
- Then alchemy provisions a Worker named `preview-<n>-code-colony-app` reachable at `https://preview-<n>-code-colony-app.48f381bf59212dbd98d2b424ba4b9a04.workers.dev`, no custom domain is bound (dnsStack early-returns), and the existing `Comment preview URLs` step posts that URL on the PR unchanged.

### AGE-72/S3 — Build failure short-circuits the deploy

- Given a TypeScript or Vite-plugin error makes `npm run build:tanstack` exit non-zero (for example a syntax error in `app/routes/__root.tsx`).
- When the `Build TanStack Start app` step runs in `cd-prod.yml`.
- Then the step exits non-zero, the workflow halts before the `Deploy Cloudflare infrastructure` step, no `Worker(...)` upload is attempted, the prior production Worker continues serving traffic at `app.codecolony.online`, and the Slack notify step (line 107, `if: always()`) reports `status: failure`.

### AGE-72/S4 — Built artifact missing at deploy time

- Given `npm run build:tanstack` succeeded but, due to a misconfigured `vite.config.mts` or a regression in `@cloudflare/vite-plugin`, no file exists at the path referenced by `BUILT_WORKER_ENTRYPOINT`.
- When `npm run iac:deploy -- --stage prod` runs immediately after.
- Then `Worker("code-colony-app", { entrypoint: BUILT_WORKER_ENTRYPOINT, ... })` fails fast with an actionable error naming the missing path; the workflow exits non-zero before any DNS or domain step runs; `app.codecolony.online` continues to serve the previous Worker version. The remediation is to update `BUILT_WORKER_ENTRYPOINT` in `alchemy/app.ts` to match the path actually emitted, in a follow-up PR.

### AGE-72/S5 — Adversarial: stale `dist/` from prior incompatible vite version

- Given an Actions runner cache (or local developer worktree) carries a `dist/` directory written by an older `@cloudflare/vite-plugin` whose Worker shape is incompatible with the current `compatibility_date=2026-04-29`.
- When `npm run build:tanstack` runs without first cleaning the directory (vite generally overwrites, but external tooling or partial failures may leave orphan files).
- Then because `BUILT_WORKER_ENTRYPOINT` resolves to a single, fresh artifact written by the current build, alchemy uploads only that artifact; orphan files in `dist/` are not part of the Worker bundle. If a future Vite version writes the entry under a new filename, AGE-72/S4 triggers and the deploy fails fast rather than uploading a stale bundle. CI runners are ephemeral per job, so cache poisoning across runs requires `actions/cache` keys; the existing workflows do not cache `dist/`, only `~/.npm` via `setup-node`'s `cache: npm`, so this scenario is fully contained on CI and only relevant for local repro.

### AGE-72/S6 — Adversarial: drift between `wrangler.jsonc` and `alchemy/app.ts`

- Given a maintainer edits `wrangler.jsonc` `main` to point at a built artifact, intending to keep wrangler.jsonc and alchemy in sync.
- When `npm run dev:tanstack` runs locally.
- Then `wrangler dev` (invoked by the cloudflare vite plugin) tries to load the built artifact instead of the virtual module and breaks local SSR. Mitigation: this PR explicitly does not touch `wrangler.jsonc`. The deploy entrypoint lives in `alchemy/app.ts`; the dev entrypoint lives in `wrangler.jsonc`. Two surfaces, two sources of truth, intentionally — local dev needs the virtual module, deploy needs the bundle. A short comment in `alchemy/app.ts` near `BUILT_WORKER_ENTRYPOINT` records this asymmetry so the next maintainer does not "fix" it.

## Out-of-scope follow-ups

- Add a TanStack Start build leg to `ci.yml` so Vite-build regressions are caught on PR rather than at cd-prod time. Proposed Linear title: `CC-CI-03 Add tanstack-start build leg to ci.yml`.
- Bind a custom subdomain (for example `preview-<n>.app.codecolony.online`) for per-PR app previews so end-to-end auth/cookie testing works without the `*.workers.dev` quirks. Proposed title: `CC-DEPLOY-02 Per-PR app preview custom subdomain`.
- Cache `dist/` between cd-preview runs of the same PR to cut build time; only worth doing once average build cost is measured. Proposed title: `CC-CI-04 Cache vite build artifact for cd-preview`.
- Migrate `OPENROUTER_API_KEY` and `SANDBOX_HMAC_KEY` to Cloudflare Secrets Store once the deploy token is granted `Secrets Store: Edit`. Proposed title: `CC-SEC-01 Move app Worker secrets to Cloudflare Secrets Store`.
- Consolidate the repo on `"type": "module"` in `package.json` so Vite/Rolldown does not need `.mts` to recognise the config as ESM. Doing so today would force a Next.js compatibility audit (Next config files, server actions, jest config) that is out of AGE-72 scope. Proposed title: `CC-INFRA-02 Move root package.json to type=module`.
- Decide whether `Worker("code-colony-app", { adopt: true })` should be enabled to mirror the sandbox stack's `adopt: true`. Proposed title: `CC-DEPLOY-03 Adopt existing code-colony-app Worker resource in alchemy state`.

## Acceptance

### Local verification (run from worktree root)

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build:tanstack
ls dist/server/index.mjs   # confirms the path BUILT_WORKER_ENTRYPOINT references
```

The final `ls` confirms the `BUILT_WORKER_ENTRYPOINT` constant matches reality on this branch. If the file lives at a different path, update the constant before opening the PR rather than guessing \u2014 the path is the deploy contract. Phase D verification item: capture the exact emitted filename on a clean `npm run build:tanstack` run on this worktree (no `dist/` present beforehand) and compare against `BUILT_WORKER_ENTRYPOINT` in `alchemy/app.ts`. The verified path on this branch is `dist/server/index.mjs`; if `@cloudflare/vite-plugin@1.34.0` paired with `@tanstack/start-plugin-core@1.169.6` emits to a different path on a future bump, update the constant and re-verify before merge.

### CI assertions

- `cd-prod.yml`: a step named `Build TanStack Start app` exists between `Install Alchemy for deploy` and `Deploy Cloudflare infrastructure`. Its log stream contains `vite v` and exits 0. The subsequent `Deploy Cloudflare infrastructure` step's stdout contains the substring `code-colony-app` (alchemy's resource line for the new Worker) and the workflow as a whole reaches the `Verify apex domain` step with `HTTP 200`.
- `cd-preview.yml`: same step exists, gated by `if: steps.deploy-secrets.outputs.ready == 'true'`, and the existing `Comment preview URLs` step posts the `https://${ALCHEMY_STAGE}-code-colony-app.${CLOUDFLARE_ACCOUNT_ID}.workers.dev` URL.
- `ci.yml`: unchanged; the new build step is intentionally not added to CI in this PR (see Out-of-scope follow-ups).

### Live prod smoke (after merge to `main` and cd-prod success)

```bash
curl --fail-with-body -sS -o /dev/null -w 'HTTP %{http_code}\n' https://app.codecolony.online/
curl --fail-with-body -sS https://app.codecolony.online/ | grep -F 'data-era'
curl --fail-with-body -sS -o /dev/null -w 'HTTP %{http_code}\n' https://app.codecolony.online/__health
```

The first command must return `HTTP 200` (proving the custom domain binds and TLS is issued). The second must succeed with a non-empty match — the `data-era` attribute is set on the root element by `app/layout` equivalents in TanStack Start and proves SSR HTML, not a Cloudflare error page. The third probes a representative app route; if `/__health` does not exist on this branch, substitute the first declared route from `app/routes/` (verified during PR review) and re-run. Phase D verification item: confirm the exact route path used for the smoke before the PR is opened, and pin it in the PR description.

## Risk register

### Rollback

- Primary rollback: `npx wrangler rollback --name code-colony-app` per `docs/runbooks/rollback.md` (Workers rollback section). The previous deploy is the still-running `code-colony-app` from before this PR — confirm via `npx wrangler deployments list --name code-colony-app` immediately after a bad cd-prod run.
- Secondary rollback: revert the merge commit on `main` and let cd-prod redeploy. Revert is preferred when the failure is a build-step regression rather than a runtime regression, because it removes the failing `vite build` step from the workflow entirely.
- DNS rollback is not required: `CustomDomain("app", ...)` with `adopt: true` is idempotent; rolling the Worker version preserves the existing domain attachment.

### Blast radius

- `appStack` is a leaf in `alchemy.run.ts`: only `dnsStack` reads its output (`appWorker.hostname`, `appWorker.workerName`). A failed `appStack` run causes `dnsStack` to receive `app.hostname = undefined` and skip the `CustomDomain("app", ...)` branch. `landingStack`, `sandboxStack`, and `secretsStack` are not affected.
- The Pages-attach step (`./scripts/attach-pages-domain.sh codecolony.online`) runs after `iac:deploy` and is independent of `appStack`; the apex remains reachable even if `app.codecolony.online` is failing.
- Convex prod deploy runs before alchemy and is decoupled from this change. A bad app deploy does not corrupt Convex schema; a Convex deploy that succeeds while the app deploy fails is a transient inconsistency only — the prior Worker version still talks to the same `pastel-cricket-679.convex.cloud` deployment and continues to function.

### Concurrency

- `cd-prod.yml` declares `concurrency: { group: cd-prod, cancel-in-progress: false }`. A hot-rollback PR merged immediately after a bad deploy will queue behind the in-flight bad run rather than cancel it. If the bad run is hanging (for example on the apex-verify retry loop, lines 96–104), use `npx wrangler rollback --name code-colony-app` directly while the workflow finishes; do not cancel the run from the GitHub UI mid-deploy because that can leave alchemy state half-written.
- Local builds and CI builds do not contend: each runner has its own ephemeral filesystem, so `dist/` on one runner cannot poison another. Local developers running `npm run build:tanstack` in parallel with cd-prod is also safe — alchemy state is read from the Cloudflare KV state store under `ALCHEMY_STATE_STORE=cloudflare`, but only the cd-prod job carries `ALCHEMY_STAGE=prod`, so a dev shell on stage `dev` cannot collide.
- `cd-preview.yml` uses `cancel-in-progress: true` per PR; a fast follow-up push cancels the prior preview deploy. Alchemy's state writes for preview stages are scoped per `${stage}` so cancelled mid-deploy state is recovered on the next push to the same PR.
