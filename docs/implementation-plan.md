# Code Colony MVP Implementation Plan — COMPLETE

> This document records the original MVP plan. All five milestones have been delivered. Post-MVP architecture evolution is documented below and in the ADR registry (`docs/adr/`).

## Product thesis

Code Colony turns a real software project into a playable pixel-art/tabletop company colony. Persistent agent employees, specs, reviews, runtime runs, artifacts, memory, trust, risk, cost, skills, and loadouts become visible product objects rather than hidden chat logs.

## MVP scope

Ship a local, installable vertical slice that demonstrates: project world → spec card → approval → agent assignment → simulated Oh My Pi runtime preview → artifact review → memory record and skill proposal.

## Architecture choice

Use Next.js, React, and TypeScript for the first app. Use the provided CSS tokens/components directly. Implement the world map as React/CSS for speed and isolate PixiJS as a later adapter. Use typed seeded mock data shaped for Convex replacement; do not block the MVP on backend credentials.

## Data model plan

The first model includes Company, ProjectWorld, Region, Room, OperationBoard, Job, Spec, ArchitectureDecision, ApprovalRequest, AgentEmployee, AgentRun, RuntimeEvent, ArtifactBundle, MemoryRecord, SkillUpdateProposal, MarketplacePackage, TrustPolicy, RegionRiskProfile, and RuntimeCostLedger.

## UI plan

Screens: World Map, Operation Board, Spec Governance, Agent Employees, Runtime Run Preview, Artifact Review, Memory Ledger, and Marketplace/Loadouts. Visual language: dark felt board, parchment cards, pixel labels, board-game tokens, room tiles, agent standees, district colors, dense dashboard panels.

## Milestones

| Milestone | Status | Date completed | Evidence |
| --- | --- | --- | --- |
| 1. Repo/source docs and planning | Done | 2026-04-28 | Initial README, AGENTS.md, product spec |
| 2. App foundation, CI, design tokens, shell | Done | 2026-04-28 | `app/`, `docs/design/`, `.github/workflows/ci.yml` |
| 3. Typed mock domain model and seeded scenario | Done | 2026-04-28 | `src/domain/types.ts`, `src/domain/demoData.ts`, `__tests__/demoData.test.ts` |
| 4. Required screens and local workflow interactions | Done | 2026-04-28 | `src/components/CodeColonyApp.tsx` with all 8 screens |
| 5. QA, README, screenshots, and follow-up sprint | Done | 2026-04-28 | README, CI green, screenshot assets in `screenshots/` |

## Post-MVP Architecture Evolution

The following ADRs have been accepted since the MVP:

| ADR | Date | Summary |
| --- | --- | --- |
| ADR 0001 | 2026-04-29 | Adopt Cloudflare Sandbox SDK on Workers Containers for agent execution primitive |
| ADR 0002 | 2026-04-29 | Adopt Alchemy as Infrastructure-as-Code layer for all Cloudflare resources |
| ADR 0004 | 2026-04-29 | Mount eleven first-party Convex Components (workflows, rate limits, auth, R2, etc.) |
| ADR 0005 | 2026-04-29 | Migrate to TanStack Start with parallel coexistence; future primary app framework |
| ADR 0006 | 2026-05-01 | Expand Convex Components for billing, agents, orchestration, email, webhooks |

## Current State

| Surface | Status | Ticket / ADR | Notes |
| --- | --- | --- | --- |
| Next.js app | real | MVP | Local dev on port 3000; current primary UI |
| TanStack Start scaffold | real | ADR 0005 / AGE-44 | Parallel coexistence; `npm run dev:tanstack` on port 3001 |
| TanStack Start deploy | real | AGE-72 | App Worker deployed to `app.codecolony.online` |
| Convex schema + seed | real | ADR 0004 / AGE-62 | 21 components mounted; seed mutation idempotent |
| Convex frontend queries | not started | AGE-44b | Migration arc pending Next.js → TanStack Start cutover |
| Alchemy IaC (prod) | real | ADR 0002 / AGE-58 | DNS, landing Pages, sandbox-runner, app Worker all deployed |
| Sandbox-runner Worker | real | ADR 0001 / AGE-49 | HMAC auth, `exec` + `git-clone` endpoints; Container DO with `max_instances=5` |
| Mastra `backlogTriageAgent` | partially real | AGE-47 | Agent configured with OpenRouter; `runCommand` tool stubbed pending AGE-55 |
| Oh My Pi runtime | mocked / simulated | — | Simulated in UI; real sandbox execution pending AGE-55 |
| Artifact diffs, tests, cost | mocked / simulated | — | Demo data only |
| Marketplace installs | mocked | — | UI browseable; no real install flow |
| Multiplayer presence | mocked | — | Single-player local state only |
| Repo scanning | partially real | — | `repoScans` table + seed data exist; live scan pipeline stubbed |
| Company onboarding wizard | not started | AGE-63+ | — |

## Risks and unknowns

Active risks only:

- **TanStack Start RC stability** — We are on `@tanstack/react-start@1.167.51`. Patch releases have been stable, but breaking changes on minor versions are possible. Mitigation: pin exact versions and validate `npm run build:tanstack` before every bump.
- **`--legacy-peer-deps` install time** — `better-auth` and `@waynesutton/agent-ready` pull conflicting React type peers. Mitigation: CI cache absorbs the impact; monitor upstream for peer relaxations.
- **Cloudflare Sandbox SDK churn** — The SDK is in active development on `github.com/cloudflare/sandbox-sdk`. Mitigation: thin `runInSandbox` adapter in `apps/sandbox-runner/` lets us swap to raw Containers if needed.

Stale risks (resolved):

- ~~Convex/Honcho credentials are not required for MVP~~ — Credentials are provisioned and the backend is deployed. Convex dev sync runs on CI when `CONVEX_DEPLOY_KEY` is present.
- ~~PixiJS integration may be deferred~~ — Explicitly deferred; React/CSS map is the accepted MVP choice per ADR-css-map in `demoData`.
