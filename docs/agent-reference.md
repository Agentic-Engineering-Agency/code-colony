# Code Colony engineering reference

This reference carries the architecture and subsystem constraints that are too detailed for
`AGENTS.md`. The code and accepted ADRs remain the source of truth for current inventories.

## Product and migration boundaries

Code Colony is currently a seeded local vertical slice. Runtime execution, artifact diffs,
tests, costs, marketplace installs, memory providers, and multiplayer behavior may still be
simulated. Keep simulation explicit in UI copy; never present mock repository mutation as real.

The shared `CodeColonyApp` renders through both Next.js and TanStack Start while ADR 0005's
cutover is in progress. Domain types and seed transitions live under `src/domain/`; change the
domain contract before teaching a UI a new product concept. Convex is replacing seed-backed
state incrementally, and `mastra/`, `convex/triage.ts`, and the server route-core modules own AI
orchestration and transport-neutral route contracts. Read the accepted ADRs and `specs/` before
changing these migration seams.

## Frontend and data rules

- Keep demo transitions pure and immutable; do not mutate the shared seed object.
- Extract components only when reuse or readability warrants it. Preserve the dense
  pixel/tabletop language of panels, cards, badges, meters, queues, nodes, and standees.
- Use classes and the tokens under `docs/design/`; reserve inline styles for values that are
  genuinely dynamic.
- Use plain `<img>` for shared image assets. `next/image` emits `/_next/image` requests that the
  TanStack Cloudflare Worker does not serve.
- Validate external inputs at boundaries even though current internal demo data is typed.
- `apps/landing/` and `apps/sandbox-runner/` are independent packages. Do not assume a shared
  `node_modules`; use each package's own test/build commands where its code changes.
- Preserve the edit markers in `docs/design/tweaks-panel.jsx`; its Babel-in-the-browser shape is
  owned by the design workflow. The landing app's TypeScript port mirrors it one-to-one.

## Convex and orchestration rules

Read `convex/_generated/ai/guidelines.md` before editing Convex code; it overrides remembered
Convex patterns. Component wrappers in `convex/<name>.ts` are the only modules allowed to expose
`components.*`. Set component variables with `npx convex env set`. The root TypeScript check
excludes `convex/`; use the repository's `convex:typecheck` script for that tree. Fresh installs
currently require `--legacy-peer-deps` because of Better Auth's transitive React peer types.
Install the repository Convex agent files with `npx convex ai-files install` when needed. Use
`npx convex dev` for an authenticated development sync and
`npx convex run seed:seedFromDemoData` for the idempotent demo seed; neither is a deployment gate.

Convex generation is owned by the CLI; never edit `convex/_generated/`. The seed mutation is
idempotent. Frontend reads and writes should enter through queries and mutations as the migration
lands, rather than adding a second state-access convention.

## Infrastructure, automation, and provider safety

Alchemy owns production Cloudflare state. Declare resources under `alchemy/`; do not hand-edit
`wrangler.toml`. Local state belongs in the ignored `.alchemy/` directory, while CI uses the
configured cloud state store. Preview stages use `preview-<n>` and are destroyed when the PR
closes.

Default every automation path to dry-run or local simulation. Without an explicit request, do
not deploy, destroy infrastructure, run production migrations, send email, charge cards, contact
prospects, invoke outbound workflows, or mutate live Cloudflare/Convex state.

Payment processing must verify signatures, use provider event IDs as idempotency keys, retain
only minimal lifecycle metadata, and use Dodo test mode outside production. Outbound webhooks are
signed; inbound signatures use timing-safe comparison; retries use managed components; failures
store metadata, never raw payloads.

PostHog is the canonical analytics and operational telemetry destination. Keep event names stable
and snake_case. Record identifiers, counts, enums, latency, token usage, model/provider, and cost
estimates—not secrets, raw payment payloads, private repository content, documents, or full
prompts. Remove obsolete observability integrations instead of extending them unless a current
separate error tool has an explicitly documented boundary.

## Documentation and code intelligence

Accepted ADRs are immutable. Put follow-up state in `docs/adr/STATUS.md`; if an ADR needs an
explicit status update, append only a clearly labeled status subsection and do not rewrite its
decision.

GitNexus indexes this repository as `code-colony`. Before changing a function, class, or method,
run upstream impact analysis and report the blast radius. Warn before HIGH or CRITICAL changes.
Use GitNexus query/context for unfamiliar flows, its rename operation for symbols, and change
detection before a commit. If the index reports staleness, refresh it with
`npx gitnexus analyze`. Never substitute textual find-and-replace for a semantic rename.
