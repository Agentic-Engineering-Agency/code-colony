# Code Colony

Where your repo becomes a living company.

Code Colony is a multiplayer AI company simulation. A real software project becomes a pixel-art/tabletop colony; persistent agent employees work through specs, approvals, runtime previews, artifact reviews, memory, trust, risk, cost, skills, and loadouts. The current build is a local, seeded vertical slice with a Convex backend schema ready and several deployed surfaces coexisting.

## Current MVP

This first working version is a local, seeded vertical slice:

1. Open the Code Colony world map.
2. Inspect regions, rooms, agents, active jobs, risk, trust, and cost signals.
3. Review the active spec card: "Build Spec-to-Diff Preview".
4. Approve, request changes, or reject the spec in local state.
5. Move job cards across the operation board.
6. Inspect a simulated Oh My Pi runtime run with event log, diff preview, and checks.
7. Review the artifact bundle.
8. Approve generated learning objects: a memory record and a skill update proposal.
9. Browse memory ledger and marketplace/loadout registry.

## Run locally

```bash
npm install
npm run dev              # Next.js app — http://localhost:3000
npm run dev:tanstack     # TanStack Start app — http://localhost:3001
npm run landing:dev      # Vite landing page — http://localhost:5173
npx convex dev           # Convex backend dev sync
```

## Quick verification

Mirror the CI sequence before pushing:

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

## Workspace structure

| Path | Responsibility |
| --- | --- |
| `app/` | Next.js App Router entry points (current primary app surface) |
| `src/` | Shared domain types, seed data, React components, and server route cores |
| `apps/landing/` | Vite + React + TypeScript marketing page (ported from legacy Babel prototype) |
| `apps/sandbox-runner/` | Cloudflare Worker sandbox runner (HMAC auth, `exec` + `git-clone` endpoints) |
| `alchemy/` | Infrastructure-as-Code resources (Alchemy) — Pages, Workers, Containers, DNS, secrets |
| `convex/` | Convex backend — schema, seed mutation, component wrappers, and HTTP actions |
| `mastra/` | Mastra agent layer — LLM config, `backlogTriageAgent`, sandbox client tools |
| `docs/adr/` | Architecture decision records (0001–0006) |
| `docs/runbooks/` | Operational playbooks — CI, rollback, secrets |
| `docs/specs/` | Implementation specifications (e.g., AGE-72 app Worker deploy) |
| `docs/product/` | Authoritative PRD and design source material |
| `docs/design/` | Design-system CSS and reference images |

## Architecture

- **Next.js** (`app/`) — current primary app surface; runs locally on port 3000.
- **TanStack Start** (`app/routes/`, `vite.config.mts`) — coexists alongside Next.js per ADR 0005; future primary app surface once the client cutover completes. Runs on port 3001 via `npm run dev:tanstack`.
- **Convex backend** (`convex/`) — full schema + 21 mounted components (ADRs 0004 and 0006); seed mutation ready; frontend queries/mutations migration pending.
- **Alchemy IaC** (`alchemy/`, `alchemy.run.ts`) — production DNS, landing Pages, sandbox-runner Worker, and app Worker all deployed via `npm run iac:deploy`.
- **Mastra agent layer** (`mastra/`) — configured with OpenRouter; `backlogTriageAgent` is real but the `runCommand` tool is stubbed until AGE-55 lands.
- **Cloudflare Sandbox SDK** (`apps/sandbox-runner/`) — ADR 0001; Container-backed Durable Object with `max_instances=5`; Dockerfile is a placeholder pending SDK runtime image (CC-SBX-03).

## What is mocked

| Surface | Status | Future ticket |
| --- | --- | --- |
| Multiplayer presence and votes | mocked | multiplayer-UX milestone |
| Oh My Pi runtime execution | mocked / simulated | AGE-55 |
| Artifact diffs, tests, cost ledger | mocked / simulated | AGE-63+ |
| Marketplace installs and agent loadout changes | mocked | AGE-63+ |
| Convex/Honcho memory providers | partially real | Convex `memories` table is real; Honcho integration not started |
| Repo scanning | partially real | `repoScans` table + seed data exist; live scan pipeline stubbed |
| Company onboarding wizard | not started | AGE-63+ |

## Next sprint (prioritized)

| Priority | Ticket | Description |
| --- | --- | --- |
| 1 | AGE-72 | App Worker deploy (TanStack Start → Cloudflare Workers) — **merged to main** |
| 2 | AGE-44b | TanStack Start client cutover: replace Next.js fetch calls with `useServerFn`/`useQuery` |
| 3 | AGE-55 | Real Mastra triage: wire `runCommand` tool to live sandbox-runner |
| 4 | AGE-63+ | Billing/orchestration/email component wiring (Dodo Payments, Resend, Steel, webhooks) |
| 5 | AGE-53 | Landing page video URL + waitlist wiring to Convex mutation |
| 6 | AGE-50 | Landing page sign-up calling `waitlist.join` from the browser |
| Future | — | PixiJS world renderer, multiplayer real-time, marketplace real installs |

## Source materials

Authoritative PRD/design files live under:

- `docs/product/agent_company_sim_detailed_spec.md`
- `docs/design/design-system.html`
- `docs/design/tokens.css`
- `docs/design/themes.css`
- `docs/design/components.css`
- `docs/design/tweaks-panel.jsx`
- `docs/design/reference-images/`

## Documentation map

- **Agent guidelines**: `AGENTS.md` — conventions, commands, and code patterns for this repo.
- **Runbooks**: `docs/runbooks/ci.md`, `docs/runbooks/rollback.md`, `docs/runbooks/secrets.md`
- **ADRs**: `docs/adr/0001-agent-sandbox.md` through `docs/adr/0006-convex-components-billing-orchestration.md`
- **Product spec**: `docs/product/agent_company_sim_detailed_spec.md`
- **MVP implementation notes**: `docs/implementation-plan.md`

## Contributing

This repo uses a **rebase/fast-forward workflow** with no merge commits.

- Branch from `main`, open a PR, and rebase before merging.
- Commit messages: `feat(AGE-XX): …`, `fix(AGE-XX): …`, `docs(AGE-XX): …`
- Run the full verification sequence before pushing:

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

## Project links

- GitHub: https://github.com/Agentic-Engineering-Agency/code-colony
- Linear project: https://linear.app/agentic-eng/project/code-colony-e8a49896272e
