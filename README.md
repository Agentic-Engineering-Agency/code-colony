# Code Colony

Where your repo becomes a living company.

Code Colony is a multiplayer AI company simulation prototype. A real software project becomes a pixel-art/tabletop colony; persistent agent employees work through specs, approvals, runtime previews, artifact reviews, memory, trust, risk, cost, skills, and loadouts.

## Current MVP

This first working version is a local, seeded vertical slice:

1. Open the Code Colony world map.
2. Inspect regions, rooms, agents, active jobs, risk, trust, and cost signals.
3. Review the active spec card: “Build Spec-to-Diff Preview”.
4. Approve, request changes, or reject the spec in local state.
5. Move job cards across the operation board.
6. Inspect a simulated Oh My Pi runtime run with event log, diff preview, and checks.
7. Review the artifact bundle.
8. Approve generated learning objects: a memory record and a skill update proposal.
9. Browse memory ledger and marketplace/loadout registry.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Verification commands

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Architecture

- Next.js + React + TypeScript app.
- Provided design tokens and components imported from `docs/design`.
- Typed mock data in `src/domain` shaped for future Convex replacement.
- World map is React/CSS for the MVP; PixiJS remains a future rendering adapter.
- Runtime preview is explicitly simulated and does not mutate repositories.

## Source materials

Authoritative PRD/design files live under:

- `docs/product/agent_company_sim_detailed_spec.md`
- `docs/design/design-system.html`
- `docs/design/tokens.css`
- `docs/design/themes.css`
- `docs/design/components.css`
- `docs/design/tweaks-panel.jsx`
- `docs/design/reference-images/`

## What is mocked

- Multiplayer presence and votes.
- Convex/Honcho memory providers.
- Oh My Pi runtime execution.
- Artifact diffs, tests, and cost ledger.
- Marketplace installs and agent loadout changes.

## Next sprint

- Replace local mock state with Convex schema and subscriptions.
- Add real repo scanning and project-world generation.
- Add a local runtime worker adapter for real Oh My Pi sessions.
- Add PixiJS world renderer behind the current map interface.
- Add screenshot capture and design QA in CI.

## Project links

- GitHub: https://github.com/Agentic-Engineering-Agency/code-colony
- Linear project: https://linear.app/agentic-eng/project/code-colony-e8a49896272e
