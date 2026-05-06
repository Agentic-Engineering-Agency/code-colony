# Claude-specific Guidelines

This file augments `AGENTS.md` with patterns particular to Claude (Anthropic) agent sessions. The canonical repository conventions, commands, and architecture overview live in `AGENTS.md` — read that first.

## Tool usage patterns

- **Parallel reads**: When you need information from multiple files, read them in a single batch rather than sequentially. Claude can issue multiple tool calls at once; use that capability to reduce latency.
- **No sequential tool calls when independent**: If a file edit does not depend on the result of a previous command, send both tools in the same response.
- **Prefer `read` over `shell` for file inspection**: Use the dedicated `read` tool rather than `cat` / `head` / `tail` shell commands.
- **Prefer `patch` over `sed` or `awk`**: For edits, use `patch` or `multi_patch` instead of shell text manipulation.

## Design workflow (`tweaks-panel.jsx`)

The design team maintains `docs/design/tweaks-panel.jsx` as a live tweak panel. It is intentionally ignored by ESLint. When working with it:

- Preserve the `/*EDITMODE-BEGIN*/ … /*EDITMODE-END*/` markers — the design team's host script rewrites the block between them.
- Do not refactor the Babel-in-the-browser globals pattern inside `tweaks-panel.jsx` unless explicitly asked; the design team's workflow depends on the current structure.
- The Vite port at `apps/landing/src/tweaks-panel.tsx` mirrors the legacy file one-to-one.

## Convex code conventions

- **Always read `convex/_generated/ai/guidelines.md` first** before editing any Convex file. The guidelines there override general Convex knowledge from training data.
- Install Convex agent skills with `npx convex ai-files install` when available.
- Wrappers in `convex/<name>.ts` must hide `components.*` from the rest of the codebase; never import `components.*` outside the wrapper file that owns it.
- The root `tsconfig.json` excludes `convex/` from the Next.js typecheck. Convex-specific typechecking happens via `npx convex dev` or `npx tsc --noEmit -p convex/tsconfig.json`.

## Commit and verification reminder

Before finishing a session, run the CI verification sequence when any code or documentation with commands changed:

```bash
npm run lint && npm run typecheck && npm test && npm run build
```
