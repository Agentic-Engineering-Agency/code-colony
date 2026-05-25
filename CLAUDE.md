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

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **code-colony** (1518 symbols, 2104 relationships, 55 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/code-colony/context` | Codebase overview, check index freshness |
| `gitnexus://repo/code-colony/clusters` | All functional areas |
| `gitnexus://repo/code-colony/processes` | All execution flows |
| `gitnexus://repo/code-colony/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
