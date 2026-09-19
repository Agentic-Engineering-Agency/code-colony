# Portfolio integration contract

This document maps Code Colony into the delivery portfolio without treating the seeded simulation
as live orchestration evidence. It does not define the root contract, and no Ultimate Harness or
Telar adapter is shipped here.

## Role and maturity

| Classification | Current status |
|---|---|
| Primary role | Orchestration experiment and operator-experience prototype |
| Real surfaces | Application shells, domain types, selected Convex schema/components, Mastra triage agent, infrastructure, and PostHog boundary |
| Simulated surfaces | OMP runtime execution, diffs/checks/cost ledger, artifact review, memory/skill promotion, presence/votes, and marketplace behavior |
| Current evidence status | Not applicable for production runtime or benchmark claims |
| Portfolio integration | Proposed; no Ultimate Harness or Telar adapter is shipped here |

## Evidence boundary

| Category | Current system of record | Allowed claim |
|---|---|---|
| Product behavior | Source, tests, built app, and exercised rendered path | The verified prototype interaction only |
| Seeded orchestration | `src/domain/types.ts` and seed transitions | UI/domain simulation, never a completed external run |
| Convex state | Owning schema and wrapper functions | Implemented backend structure; not proof that every frontend flow is wired |
| Runtime/model receipt | None for the simulated OMP run | `unavailable` |
| Quality/cost/latency/tokens | Mock values where labeled; real telemetry only when a live path emits it | Never mix mock and observed fields in one receipt |
| Blind review | Not implemented | No independent/blind-quality claim |

PostHog is the planned/implemented telemetry seam for real product and runtime events, but the
existence of an instrumentation module does not prove an event was emitted or received.

## Portfolio seam

1. Code Colony owns the simulation and operator experience. It must keep mock data visibly labeled.
2. A future live runtime integration consumes a small adapter interface and returns immutable run,
   artifact, and verification references. It must not leak provider internals into UI state.
3. Ultimate Harness may later remain the only Run Control for externally executed attempts. Code
   Colony visualizes its receipts; it does not start a second controller for the same attempt.
4. The proposed Telar plane may own planning/governance and normalized evidence references. No
   current Code Colony screen is proof that Telar behavior exists.

## Future plan

- Replace the simulated runtime card only after a real adapter produces attempt lineage, resolved
  harness/model, repository/config hashes, artifact hashes, checks, cost, latency, tokens, and
  explicit missing-field reasons.
- Keep independent review separate from implementation and retain judge/reviewer identity,
  evidence view, revision, verdict, and limitations.
- Prove one end-to-end spec-to-diff path before exposing portfolio rollups or learning promotion.
