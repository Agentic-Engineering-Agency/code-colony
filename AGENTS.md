# Code Colony Agent Rules

Code Colony is a multiplayer AI-company simulation prototype used to exercise repository, agent, governance, and runtime product flows.

Workspace standards apply here: [../docs/standards/README.md](../docs/standards/README.md).
This file adds only what is specific to this repo. Where they conflict, this file wins, and the
conflict is recorded under `## Deviations`.

## Stack

- Language / runtime: strict TypeScript on Node.js 20 or newer
- Framework / platform: React, Next.js App Router, parallel TanStack Start, Convex, Mastra, and Cloudflare via Alchemy
- Package manager: npm with the committed `package-lock.json`; independent packages under `apps/` install separately
- Tests / style: Vitest and flat ESLint with zero warnings

## Non-negotiables

- Read [`docs/agent-reference.md`](docs/agent-reference.md) before changing domain state, Convex, infrastructure, automation, payments, webhooks, observability, or shared rendering.
- Keep mocked runtime and provider behavior visibly labeled. Mock data is never evidence that a live repository or provider boundary works.
- Change `src/domain/types.ts` before adding a product concept; keep seed transitions pure and immutable.
- Preserve both Next.js and TanStack Start rendering during the cutover. Shared assets use plain `<img>`, not `next/image`.
- Read `convex/_generated/ai/guidelines.md` before any Convex edit. Never edit generated Convex output or expose `components.*` outside its owning wrapper.
- Alchemy owns Cloudflare state. Never hand-edit production `wrangler.toml` or run deploy, destroy, production migration, email, payment, prospecting, or outbound automation without an explicit request.
- Verify payment and webhook signatures, preserve idempotency, and never persist or emit secrets, private repository content, documents, full prompts, or raw payment/webhook payloads.
- PostHog is canonical for product, AI, runtime, payment, webhook, automation, and error telemetry unless a current error tool has a documented separate boundary.
- Preserve `/*EDITMODE-BEGIN*/` and `/*EDITMODE-END*/` and the host-dependent structure in `docs/design/tweaks-panel.jsx`.
- Before modifying a function, class, or method, use GitNexus upstream impact analysis; warn on HIGH/CRITICAL risk, use semantic rename, and run change detection before committing.
- Use dedicated read/edit tools rather than shell text manipulation, and batch independent reads or edits when the harness supports it.

## Commands

| Purpose | Command |
|---|---|
| Install | `npm install --legacy-peer-deps` |
| Next.js dev | `npm run dev` |
| TanStack dev | `npm run tanstack:dev` |
| Landing dev | `npm run landing:dev` |
| Lint | `npm run lint` |
| Typecheck app / Convex | `npm run typecheck` / `npm run convex:typecheck` |
| Test | `npm test` |
| Build Next / TanStack / landing | `npm run build` / `npm run tanstack:build` / `npm run landing:build` |
| Convex codegen | `npm run convex:codegen` |
| Validate infrastructure | `npm run iac:validate` |
| Preview infrastructure diff | `npm run iac:diff` |
| Deploy / destroy infrastructure | `npm run iac:deploy` / `npm run iac:destroy` |

Deployment and destruction commands exist for explicitly authorized operations only; they are not routine verification.

## Verification gates

- Every code change: `npm run lint`, `npm run typecheck`, and `npm test`.
- Convex changes: also `npm run convex:codegen` and `npm run convex:typecheck`.
- App behavior or UI: also build the affected Next/TanStack surface and exercise the real rendered path; UI work requires an unprimed screenshot critique.
- Infrastructure: `npm run iac:validate`; use `npm run iac:diff` only when provider access and the task authorize it.
- Changes under `apps/landing/` or `apps/sandbox-runner/`: run that package's own typecheck, test, or build legs as documented in `docs/runbooks/ci.md`.
- Before handoff of behavior changes, match the CI sequence in `docs/runbooks/ci.md`. Documentation-only work is reviewed against the documentation standard; if it changes executable command guidance, also run the CI sequence unless the task explicitly excludes project-wide validation.

## Read order

1. `README.md`
2. `docs/agent-reference.md`
3. `docs/product/agent_company_sim_detailed_spec.md`
4. `docs/adr/` and `docs/adr/STATUS.md`
5. `specs/` for the active implementation spec
6. The relevant runbook under `docs/runbooks/`
7. `convex/_generated/ai/guidelines.md` before Convex work

## Scope discipline

- Default to the smallest slice that proves the change; record expansion in a PRD, ADR, or spec.
- Follow the active migration seams rather than introducing parallel state, transport, rendering, IaC, or telemetry conventions.
- Use GitNexus query/context instead of broad text search for unfamiliar execution flows; refresh a stale index with `npx gitnexus analyze`.
- Keep live provider side effects out of routine local and CI work. Per-PR infrastructure is isolated by its preview stage.
- Update source declarations, not generated, staged, or deployed copies.

## Command Code (alternate harness)

Command Code is an **alternate** executor available in this repo, admitted for a named
capability gap (taste learning, checkpoints/rewind, plan-mode review, headless `cmd -p` runs,
native MCP with per-server permission gating). It reads this `AGENTS.md` as its memory file, so
this file remains the single instruction source. It is **not** the default — OMP is. The
generated `.commandcode/settings.json` mirrors the OMP discipline in Command Code's permission
rules and is materialized from `scripts/harness-matrix.json`; never hand-edit it. See
`docs/standards/harness.md` (Command Code section) and `docs/research/command-code-evaluation.md`.

## Deviations

- Fresh root installs use `npm install --legacy-peer-deps` because Better Auth currently exposes incompatible transitive React 18 type peers.
