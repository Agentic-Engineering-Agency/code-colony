# Repository Guidelines

## Project Overview

Code Colony is a Next.js + React + TypeScript prototype for a multiplayer AI company simulation: a real repository becomes a pixel-art/tabletop colony with specs, approvals, runtime previews, artifact review, memory, trust, risk, cost, skills, and loadouts. The current app is a local seeded vertical slice; several product concepts are mocked and explicitly simulated.

## Architecture & Data Flow

- `app/page.tsx` renders the single client app component, `CodeColonyApp`.
- `app/layout.tsx` sets app metadata and root density/theme attributes (`data-era`, `data-density`) and imports `app/globals.css`.
- `src/components/CodeColonyApp.tsx` owns all local UI state with React `useState`:
  - selected screen (`world`, `operations`, `governance`, `agents`, `runtime`, `artifact`, `memory`, `marketplace`)
  - selected map region
  - mutable demo state seeded from `demoData`
- `src/domain/types.ts` is the domain contract. Update it first when adding product concepts.
- `src/domain/demoData.ts` contains typed seed data plus immutable state-transition helpers:
  - `moveJob(data, jobId, state)`
  - `voteOnApproval(data, approvalId, decision)`
  - `approveArtifactLearning(data)`
- Runtime execution, artifact diffs, tests, cost ledger, marketplace installs, memory providers, and multiplayer behavior are mock/demo data in the MVP. Keep simulated behavior visibly labeled in UI copy.
- Design choice from docs: React/CSS world map now; PixiJS is a future rendering adapter. Seeded mock data is shaped for a future Convex replacement.
- **TanStack Start parallel coexistence** (ADR 0005): `app/routes/__root.tsx` and `app/routes/index.tsx` render the same `CodeColonyApp` component. `vite.config.mts` builds the TanStack Start surface on port 3001. Default `npm run dev` / `build` still targets Next.js until AGE-44b cuts over the client.
- **Convex migration arc**: schema is ready, 21 components are mounted (ADRs 0004 and 0006), and `convex/seed.ts` idempotently upserts `demoData`. Frontend reads/writes through Convex queries/mutations are pending.

## Key Directories

- `app/` — Next.js App Router entry points and global CSS import.
- `src/components/` — React UI, currently concentrated in `CodeColonyApp.tsx`.
- `src/domain/` — domain types, seed data, and pure state transition helpers.
- `__tests__/` — Vitest unit tests for domain state transitions.
- `apps/landing/` — Vite + React + TypeScript marketing surface. Runs independently on port 5173.
- `apps/sandbox-runner/` — Cloudflare Worker sandbox runner (HMAC auth, `exec` + `git-clone` endpoints). Container-backed Durable Object with `max_instances=5`.
- `alchemy/` — Infrastructure-as-Code layer (Alchemy). Resources declared in `alchemy/*.ts`, stages in `alchemy.run.ts` (ADR 0002).
- `convex/` — Convex backend schema, seed mutation, component wrappers, and HTTP actions.
- `mastra/` — Mastra agent layer: LLM config (`llm.ts`), `backlogTriageAgent`, sandbox client tools.
- `docs/adr/` — architecture decision record registry (0001–0006).
- `docs/runbooks/` — operational playbooks (CI, rollback, secrets).
- `docs/specs/` — implementation specifications (e.g., AGE-72 app Worker deploy).
- `docs/product/` — authoritative product spec/PRD source material.
- `docs/design/` — design-system source files imported by the app (`tokens.css`, `components.css`, `themes.css`) plus reference images.
- `public/assets/` — shipped static assets such as `code-colony-logo.png`.
- `.github/workflows/` — CI verification workflow.

## Development Commands

Use npm and Node 20+.

```bash
npm install
npm run dev                    # Next.js locally; open http://localhost:3000
npm run dev:tanstack           # TanStack Start locally; open http://localhost:3001
npm run landing:dev            # Vite landing page; open http://localhost:5173
npm run lint
npm run typecheck
npm test
npm run build                  # next build
npm run build:tanstack         # vite build --config vite.config.mts
npm run iac:diff               # alchemy diff
npm run iac:deploy             # alchemy deploy
npx convex dev                 # watches schema/functions, deploys to dev deployment
npx convex run seed:seedFromDemoData   # idempotent seed
```

- `npm run dev` starts Next.js locally; open `http://localhost:3000`.
- `npm run dev:tanstack` starts TanStack Start locally; open `http://localhost:3001`.
- `npm run landing:dev` starts the Vite landing page; open `http://localhost:5173`.
- `npm run lint` runs ESLint with `--max-warnings=0`.
- `npm run typecheck` runs `tsc --noEmit`.
- `npm test` runs `vitest run`.
- `npm run build` runs `next build`.
- `npm run build:tanstack` runs `vite build --config vite.config.mts`.
- `npm run iac:diff` previews infrastructure changes via Alchemy.
- `npm run iac:deploy` deploys Cloudflare infrastructure via Alchemy.
- CI runs `npm ci`, lint, typecheck, tests, then build on PRs and pushes to `main`.

## Code Conventions & Common Patterns

- Use strict TypeScript. `tsconfig.json` enables `strict`, `isolatedModules`, `moduleResolution: "bundler"`, and the `@/*` alias to `src/*`.
- Prefer domain-first edits: add/update types in `src/domain/types.ts`, seed representative data in `src/domain/demoData.ts`, then render it in components.
- Keep state transitions pure and immutable; existing helpers return cloned `DemoData` objects rather than mutating seed data.
- UI is componentized with small local functions in `CodeColonyApp.tsx`; extract only when reuse or readability demands it.
- Styling uses CSS classes and design tokens from `docs/design/*.css`; avoid inline styles except for dynamic values such as CSS variables, positions, widths, or colors derived from data.
- Preserve the dense pixel/tabletop visual language: panels, cards, badges, meters, queues, map nodes, standees, and token colors.
- Use `next/image` for image assets where appropriate; the logo lives at `/assets/code-colony-logo.png`.
- Use clear labels for mock/simulated runtime surfaces. Do not imply real repository mutation unless real runtime integration exists.
- Trust internal typed data, but validate future external inputs at boundaries when replacing mocks with real providers.

## Multi-app workspace conventions

Each app under `apps/` has its own `package.json`, test runner, and build output. Root commands proxy to them where needed:

- `apps/landing/` — independent Vite SPA with `npm run dev` / `npm run build` / `npm run typecheck`.
- `apps/sandbox-runner/` — independent Cloudflare Worker with `npm test` (vitest) and `npm run deploy:dry`.

Do not assume shared `node_modules` across workspaces; each app installs its own dependencies.

## Alchemy / IaC conventions

- Resources are declared in `alchemy/*.ts`; stages are defined in `alchemy.run.ts`.
- Never edit `wrangler.toml` directly for production state — Alchemy owns it.
- Local dev state lives in `.alchemy/` (gitignored). CI uses `ALCHEMY_STATE_STORE=cloudflare` with `ALCHEMY_PASSWORD` and `ALCHEMY_STATE_TOKEN`.
- Per-PR preview stages use `--stage preview-<n>` and are destroyed on PR close.

## Convex conventions

- Always read `convex/_generated/ai/guidelines.md` first before editing Convex code.
- Install Convex agent skills with `npx convex ai-files install`.
- Wrappers in `convex/<name>.ts` must hide `components.*` from the rest of the codebase.
- Environment variables for components are set via `npx convex env set`.
- `--legacy-peer-deps` is required for fresh installs due to `better-auth` transitive React 18 type peers.

## Important Files

- `package.json` — scripts, Node engine, framework/test dependencies.
- `app/page.tsx` — Next route entry rendering `CodeColonyApp`.
- `app/layout.tsx` — metadata and root app attributes.
- `app/globals.css` — global app layout plus imports for design tokens/components/themes.
- `app/routes/__root.tsx` / `app/routes/index.tsx` — TanStack Start route shell (parallel coexistence).
- `vite.config.mts` — TanStack Start + Cloudflare Workers Vite config.
- `src/components/CodeColonyApp.tsx` — main UI and local interaction flow.
- `src/domain/types.ts` — domain model for company, world, governance, agents, runtime, artifacts, memory, marketplace, trust, risk, and cost.
- `src/domain/demoData.ts` — seeded MVP scenario and state transition helpers.
- `__tests__/demoData.test.ts` — current unit coverage for domain helpers.
- `alchemy.run.ts` — Alchemy IaC entrypoint (stages + stack composition).
- `alchemy/app.ts` — app Worker resource definition.
- `convex/schema.ts` — Convex schema for all domain tables + component-backed tables.
- `convex/seed.ts` — idempotent seed mutation from `demoData`.
- `mastra/agents/backlog-triage.ts` — Mastra backlog triage agent definition.
- `.github/workflows/ci.yml` — authoritative CI command order.
- `README.md` — current MVP behavior, mocked areas, next-sprint notes, and source-material links.

## Runtime/Tooling Preferences

- Required runtime: Node `>=20` (`package.json` and CI both use Node 20).
- Package manager: npm; `package-lock.json` is present and CI uses `npm ci`.
- Framework: Next.js App Router with React and TypeScript (current); TanStack Start coexisting (future primary per ADR 0005).
- Test runner: Vitest.
- Linting: flat ESLint config in `eslint.config.mjs` using Next core-web-vitals and TypeScript presets. The design tweak script `docs/design/tweaks-panel.jsx` is intentionally ignored.
- Next config is currently empty (`next.config.mjs`); do not add framework complexity unless a real requirement needs it.

## Testing & QA

- Add or update Vitest tests for domain behavior when changing `src/domain/demoData.ts` helpers or data invariants.
- Current tests assert that job moves, governance votes, and artifact-learning approvals are immutable state transitions.
- For UI changes, at minimum run lint, typecheck, and build; add component or interaction tests when behavior becomes non-trivial.
- `apps/sandbox-runner/` and `apps/landing/` have their own test/build legs in CI (see `docs/runbooks/ci.md`).
- Convex dev sync runs on CI when `CONVEX_DEPLOY_KEY` is present; it is skipped on fork PRs.
- Run the same verification sequence used by CI before handoff when behavior changes:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

- Do not rely on mocked runtime data as proof of real execution. If integrating a real runtime, verify the real boundary and keep simulation/fake data visually distinct.

## Documentation Sources

- Product direction: `docs/product/agent_company_sim_detailed_spec.md`.
- MVP implementation notes: `docs/implementation-plan.md`.
- ADR registry: `docs/adr/`.
- Runbooks: `docs/runbooks/`.
- Design system: `docs/design/design-system.html` and the CSS files under `docs/design/`.
- README is the concise source for current MVP scope, mocked areas, and next-sprint direction.

## Documentation versioning

ADRs are immutable after acceptance. Follow-up status lives in `docs/adr/STATUS.md`. Do not append status notes to the accepted decision text of an ADR; add a "Status update" subsection at the bottom instead.

## Convex backend

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->

- `convex/schema.ts` — schema for all Code Colony domain tables (companies, projectWorlds, regions, rooms, ..., backlogIssues), each with a `by_seed_id` index keyed on the original demo `seedId`.
- `convex/seed.ts` — `seedFromDemoData` mutation that idempotently upserts the seeded `demoData` into Convex tables. Run with `npx convex run seed:seedFromDemoData`.
- `convex/_generated/` is generated by `npx convex dev`; gitignored.
- Local dev: `npx convex dev` (watches schema/functions, deploys to the dev deployment named in `.env.local` as `CONVEX_DEPLOYMENT`).
- Frontend reads/writes will go through Convex queries/mutations once the migration arc lands.
