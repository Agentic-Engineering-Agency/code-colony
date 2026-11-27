# ADR 0007 — Commit Convex bindings for keyless CI

**Status** Proposed in [PR #96](https://github.com/Agentic-Engineering-Agency/code-colony/pull/96), 2026-11-25

## Context

The root CI job typechecks the Convex functions on every pull request. Those
functions import modules from `convex/_generated/`. A fresh checkout needs
the bindings even on pull requests that have no `CONVEX_DEPLOY_KEY` for code
generation.

## Decision

Track the Convex-generated API, data model and server bindings in
`convex/_generated/`. Keep local Convex state (`.convex/`) ignored. When a
source or dependency change affects the bindings, regenerate them with Convex
codegen and commit the resulting diff alongside that change. Edit the source
and let codegen produce the bindings.

## Consequences

The root job can typecheck a clean checkout without deployment credentials.
It checks the committed bindings, so a passing typecheck alone cannot detect
every stale binding. The separate Convex job regenerates bindings and syncs
the dev schema when it has a key. It skips the sync on keyless pull requests
and fails if the key is missing on a push to `main`. See the
[CI runbook](../runbooks/ci.md#convex).
