# Comprehensive Documentation Update Plan for Code Colony

## Objective

Audit, restructure, and rewrite all project documentation so it accurately reflects the current codebase state (as of May 2026), the multi-app workspace architecture, the ADR-driven evolution, the CI matrix, runbooks, and the gap between implemented surfaces and mocked/demo surfaces. Eliminate duplication, stale forward references, and missing cross-links.

## Assumptions

1. The `AGE-XX` ticket prefix maps to Linear tickets in the Agentic Engineering project.
2. The repo follows a rebase/fast-forward workflow with no merge commits.
3. The `landing/` folder at repo root has been superseded by `apps/landing/` but may still exist; documentation should not claim it as the source of truth without verification.
4. The detached-HEAD commit `424d32a` ("Add activity feed API") from May 2, 2026 is not on any named branch and should be treated as lost work unless recovered.
5. The user wants documentation updated conceptually; actual file edits will be performed by an implementation agent (Forge).

---

## Implementation Plan

### Phase 1 — Repository-Wide Documentation Audit

- [ ] Generate a full inventory of every `.md` file in the repository with: path, last substantive update date (from git log), word count, primary audience, and freshness score (current/stale/unknown).
- [ ] Identify every file that references a path, command, or dependency that no longer exists (e.g., `landing/` at repo root, `wrangler secret put` as the primary secret flow, `npm run build` as the only build command).
- [ ] Map every `AGE-XX` and `CC-XXX` reference in docs to its implementation status: done, in-progress (branch exists), open (no branch), or abandoned.
- [ ] Verify whether `landing/` at repo root still exists and whether `apps/landing/README.md` claim that it is the "source of truth" is still accurate.

### Phase 2 — README.md Rewrite

- [ ] Expand the elevator pitch to one paragraph that names the four deployed surfaces: Next.js app (`localhost:3000`), TanStack Start app (`localhost:3001`, future primary), Vite landing page (`localhost:5173`), and Cloudflare sandbox-runner Worker.
- [ ] Add a "Workspace structure" section that maps `apps/landing/`, `apps/sandbox-runner/`, `alchemy/`, `convex/`, `mastra/`, `src/`, and `app/` to their responsibilities.
- [ ] Update "Run locally" to include all dev commands: `npm run dev`, `npm run dev:tanstack`, `npm run landing:dev`, `npx convex dev`.
- [ ] Add a "Quick verification" section that mirrors CI: `npm run lint && npm run typecheck && npm test && npm run build`.
- [ ] Rewrite "Architecture" to mention: Next.js (current), TanStack Start (coexisting, future primary per ADR 0005), Convex backend (schema + seed ready, frontend migration pending), Alchemy IaC (prod DNS + sandbox deployed, app deploy in AGE-72), Mastra agent layer (configured, triage workflow stubbed), Cloudflare Sandbox SDK (ADR 0001, runner scaffolded).
- [ ] Expand "What is mocked" into a table with three columns: Surface, Status (mocked / partially real / real), and Future Ticket.
- [ ] Rewrite "Next sprint" into a prioritized roadmap with ticket links: AGE-72 (app deploy), AGE-44b (TanStack client cutover), AGE-55 (real Mastra triage), AGE-63+ (billing/orchestration/email components).
- [ ] Add "Documentation map" subsection linking to AGENTS.md, runbooks, ADRs, and product spec.
- [ ] Add "Contributing" subsection with the rebase workflow convention, commit message format (`feat(AGE-XX): …`), and the requirement to run the full verification sequence before pushing.

### Phase 3 — AGENTS.md Update

- [ ] Add `apps/` to "Key Directories" with descriptions for `apps/landing/` (Vite marketing surface) and `apps/sandbox-runner/` (Cloudflare Worker sandbox).
- [ ] Add `alchemy/` to "Key Directories" as the Infrastructure-as-Code layer (ADR 0002).
- [ ] Add `docs/adr/` to "Key Directories" as the architecture decision record registry.
- [ ] Add `docs/runbooks/` to "Key Directories" as operational playbooks.
- [ ] Add `docs/specs/` to "Key Directories" as implementation specifications.
- [ ] Update "Architecture & Data Flow" to mention TanStack Start parallel coexistence (ADR 0005) and the Convex migration arc (schema ready, frontend not yet switched).
- [ ] Update "Development Commands" to include `npm run dev:tanstack`, `npm run landing:dev`, `npm run iac:diff`, `npm run iac:deploy`, `npx convex dev`, and `npx convex run seed:seedFromDemoData`.
- [ ] Add "Multi-app workspace conventions" subsection: each app under `apps/` has its own `package.json`, test runner, and build output; root commands proxy to them where needed.
- [ ] Add "Alchemy / IaC conventions" subsection: resources declared in `alchemy/*.ts`, stages defined in `alchemy.run.ts`, never edit `wrangler.toml` directly.
- [ ] Add "Convex conventions" subsection: always read `convex/_generated/ai/guidelines.md` first; install skills with `npx convex ai-files install`; wrappers in `convex/<name>.ts` must hide `components.*` from the rest of the codebase.
- [ ] Update "Important Files" to include: `alchemy.run.ts`, `alchemy/app.ts`, `vite.config.mts`, `convex/schema.ts`, `convex/seed.ts`, `mastra/agents/backlog-triage.ts`, and the CI workflow file.
- [ ] Update "Testing & QA" to mention that `apps/sandbox-runner/` and `apps/landing/` have their own test/build legs in CI, and that Convex dev sync runs on CI when `CONVEX_DEPLOY_KEY` is present.
- [ ] Add "Documentation versioning" note: ADRs are immutable after acceptance; follow-up status lives in a new `docs/adr/STATUS.md` file (see Phase 5).

### Phase 4 — CLAUDE.md Specialization

- [ ] If the decision is to keep CLAUDE.md, rewrite it to be Claude-specific rather than a verbatim copy of AGENTS.md. Include: preferred tool usage patterns (parallel reads, no sequential tool calls when independent), how to interact with the `tweaks-panel.jsx` design workflow, Convex agent file conventions, and the requirement to read `convex/_generated/ai/guidelines.md` before editing Convex code.
- [ ] Alternatively, if the decision is to remove CLAUDE.md, add a note to AGENTS.md explaining that Claude reads `AGENTS.md` directly and no separate file is needed.
- [ ] Regardless of the above, remove the exact duplication between AGENTS.md and CLAUDE.md to eliminate maintenance surface.

### Phase 5 — docs/implementation-plan.md Rewrite

- [ ] Rename the file or add a prominent header: "MVP Implementation Plan — COMPLETE" to signal that the 5 milestones listed have been delivered.
- [ ] Convert the "Milestones" list into a completion table with checkboxes: Milestone, Status, Date Completed, Evidence (file or PR).
- [ ] Add a "Post-MVP Architecture Evolution" section summarizing the ADRs accepted since the MVP: 0001 (sandbox), 0002 (Alchemy IaC), 0004 (Convex Components core), 0005 (TanStack Start), 0006 (Convex Components expansion).
- [ ] Add a "Current State" subsection mapping each major surface to its implementation status (real / stubbed / mocked / not started) with ticket links.
- [ ] Update "Risks and unknowns" to reflect only active risks (e.g., TanStack Start RC stability, `--legacy-peer-deps` install time, Cloudflare Sandbox SDK churn).
- [ ] Remove or archive stale risks (e.g., "Convex/Honcho credentials are not required for MVP" is no longer true; credentials are provisioned and the backend is deployed).

### Phase 6 — Product Spec Refresh

- [ ] Update the document status from "Draft v0.1" to "Draft v0.2" or "Living Document" with a last-updated date.
- [ ] Add an "Implementation Delta" section at the top that summarizes what has been built vs. what remains speculative.
- [ ] Review the 10 "Open Technical Questions" (`docs/product/agent_company_sim_detailed_spec.md:1767-1778`) and annotate each with: status (answered / partially answered / still open) and the ADR or ticket that addressed it.
- [ ] Add ticket cross-references to the "Immediate Next Steps" section, replacing the generic language with `AGE-XX` links.
- [ ] Update the "MVP Must-Haves" list to reflect what is now real (e.g., repo scanning is real; company onboarding wizard is not).

### Phase 7 — ADR Follow-Up Status Tracking

- [ ] Create `docs/adr/STATUS.md` as a single tracking table for all open ADR follow-ups.
- [ ] Populate it with rows from ADR 0001, 0002, 0004, 0005, and 0006: Ticket, ADR, Description, Status (Done / In Progress / Open), Branch or PR if applicable, and Last Verified Date.
- [ ] Update each ADR to add a "Status update (2026-05-04)" subsection at the bottom that links to `docs/adr/STATUS.md` and summarizes which follow-ups are now resolved.
- [ ] In ADR 0002, update the verification section: it now **does** invoke `alchemy deploy` against a live account; remove the disclaimer that says otherwise.
- [ ] In ADR 0005, add a note that Phase 1 (scaffold) is complete and AGE-72 is the first PR to build + deploy the TanStack Start Worker.

### Phase 8 — Runbook Cross-Referencing and Gap-Filling

- [ ] In `docs/runbooks/ci.md`, add a "Troubleshooting" subsection with common failures: Convex secret absent on fork PRs, sandbox-runner fake-docker shim behavior, landing probe skip, and the missing TanStack Start build leg.
- [ ] In `docs/runbooks/rollback.md`, add an "Alchemy state implications" note: rolling back a Worker via Wrangler does not revert Alchemy state, so a subsequent `alchemy deploy` may re-promote the old version unless the source is fixed.
- [ ] In `docs/runbooks/secrets.md`, add a "Local development secrets" subsection listing `.env.local` (Next.js / Convex), `.dev.vars` (sandbox-runner), and the required variables for each.
- [ ] Cross-link all three runbooks to each other and to `docs/adr/0002-iac-alchemy.md` and `docs/runbooks/rollback.md`.

### Phase 9 — App README Updates

- [ ] In `apps/landing/README.md`, verify whether the legacy `landing/` folder at repo root still exists. If it has been deleted or superseded, remove the claim that it is the "source of truth" and mark the Vite port as the current surface.
- [ ] In `apps/landing/README.md`, update "Known TODOs" to show AGE-53 status and whether the waitlist wiring has progressed.
- [ ] In `apps/sandbox-runner/README.md`, verify whether the Dockerfile is still a placeholder. Update the README accordingly and add a note about the `max_instances=5` limit and container cold-start behavior.
- [ ] In `apps/sandbox-runner/README.md`, add a link to `docs/runbooks/secrets.md` for HMAC key rotation and to `docs/adr/0001-agent-sandbox.md` for architecture context.

### Phase 10 — New Documentation Files (Conditional)

- [ ] Create `docs/ROADMAP.md` if the team wants a single public-facing roadmap. It should contain: current quarter priorities (AGE-72, AGE-44b, AGE-55), medium-term goals (AGE-63+ component wiring, Honcho memory), and long-term goals (PixiJS renderer, multiplayer, marketplace real installs). This file should be a thin overlay on `docs/adr/STATUS.md` and the README next-sprint section.
- [ ] Create `docs/CONTRIBUTING.md` only if explicitly requested. Otherwise, fold contribution guidelines into README.md and AGENTS.md.
- [ ] Create `docs/ARCHITECTURE.md` only if explicitly requested. Otherwise, ensure the architecture description in README.md and AGENTS.md is sufficient.

---

## Verification Criteria

- [ ] Every path referenced in documentation exists on disk at the referenced location.
- [ ] Every command block in documentation runs successfully (or is explicitly marked as forward-reference / placeholder).
- [ ] `AGE-XX` references in docs are consistent with branch names and Linear ticket existence.
- [ ] No two documentation files contain identical verbatim text longer than 10 lines (eliminate AGENTS.md / CLAUDE.md duplication).
- [ ] The README "What is mocked" table accurately matches the `src/domain/demoData.ts` seed data and the `src/domain/runtime.ts` simulated runtime label.
- [ ] The CI runbook matches the actual `.github/workflows/ci.yml` job names, probe logic, and concurrency rules.
- [ ] All ADR follow-ups are either marked Done in `docs/adr/STATUS.md` or linked to an active branch.

---

## Potential Risks and Mitigations

1. **Risk: Landing `landing/` folder confusion**
   Mitigation: Verify disk state before rewriting `apps/landing/README.md`. If `landing/` still exists, document the relationship explicitly; if deleted, remove all references.

2. **Risk: Over-documenting speculative features**
   Mitigation: The product spec (`agent_company_sim_detailed_spec.md`) should remain the place for speculative depth. README, AGENTS.md, and runbooks must only describe what exists or has an active ticket + branch.

3. **Risk: Linear ticket numbers drift**
   Mitigation: Add a disclaimer in `docs/adr/STATUS.md` that ticket numbers are accurate as of the last update date and may be reassigned. Prefer branch names over ticket numbers where possible.

4. **Risk: TanStack Start commands change between RC versions**
   Mitigation: Pin the exact package versions in documentation and add a note that commands are validated against `@tanstack/react-start@1.167.51` and `@cloudflare/vite-plugin@1.34.0`.

5. **Risk: CLAUDE.md deletion breaks external tool expectations**
   Mitigation: Check whether any external tool (e.g., Cursor, Claude Code, GitHub Copilot) expects `CLAUDE.md` to exist. If so, specialize it rather than deleting it.

---

## Alternative Approaches

1. **Incremental updates vs. full rewrite**: Instead of rewriting README.md from scratch, patch only the delta sections. Trade-off: faster but may leave stale cross-references and inconsistent tone.
2. **Keep CLAUDE.md as a symlink or re-export**: Instead of specializing or deleting, make CLAUDE.md a 5-line file that imports AGENTS.md and adds Claude-specific notes. Trade-off: still requires maintenance but reduces duplication.
3. **Merge runbooks into README**: Instead of separate runbook files, fold CI, rollback, and secrets into a single "Operations" section in README. Trade-off: README becomes very long; runbooks are harder to link to individually.

---

## Handoff Notes for Implementation Agent

- Start with Phase 2 (README.md) and Phase 3 (AGENTS.md) because they have the highest reader traffic.
- Use `git log --oneline --all --graph` to verify branch and commit states before claiming any AGE ticket is "in progress."
- Run `npm run lint && npm run typecheck && npm test && npm run build` after any documentation change that includes code examples to ensure snippets are valid.
- When updating ADRs, append the status-update section at the bottom; do not rewrite the accepted decision text (ADRs are immutable after acceptance).
- If `landing/` at repo root no longer exists, grep the entire repo for references to it and remove them all in one pass.