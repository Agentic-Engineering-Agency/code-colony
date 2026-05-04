# ADR 0005 — Migrate Code Colony to TanStack Start

- Status: Accepted
- Date: 2026-04-29
- Linear: AGE-44
- GitHub PR: #70 (this change), supersedes nothing

## Context

The Code Colony app currently runs on Next.js App Router with five JSON
route handlers under `app/api/*`. We want to deploy on Cloudflare Workers
(see ADR 0003 / AGE-58 for the broader IaC plan) with end-to-end type-safe
RPC between the browser and edge code, and we want the routing layer to
share types with the React tree instead of going through a stringly-typed
fetch boundary.

Two viable paths exist for getting Next-style App Router code onto Workers:

1. **OpenNext for Cloudflare** (`@opennextjs/cloudflare`) — adapter that
   transforms a Next build into a Workers-compatible deployment.
2. **TanStack Start** (`@tanstack/react-start@^1.167`) — Vite-based
   full-stack React framework with first-party Workers support and
   typed server functions.

## Decision

Migrate to **TanStack Start** with a parallel-coexistence cutover.

## Rationale

| Concern | OpenNext | TanStack Start |
|---|---|---|
| Server-to-client RPC types | Manual via `fetch` + zod | First-class via `createServerFn` |
| Workers compatibility | Adapter layer, occasional version drift | Native target via `@cloudflare/vite-plugin` |
| Routing model | Inherited from Next App Router | TanStack Router (used elsewhere in the codebase) |
| Build tool | Next + adapter | Vite directly |
| Memory leak / RC stability | Stable, but adapter releases lag | RC v1.167+ stable since Jan 2026 (issue #5734 fixed) |
| Cost of adoption | Lowest churn (keeps Next) | Higher churn but unifies router story |

The deciding factor is the type-safe server function story: `createServerFn`
collapses the current `fetch("/api/...") -> Response.json -> zod parse`
boilerplate into a single typed call. The five existing route cores
(`*RouteCore.ts`) already have the right shape for that — they already
return discriminated `{ status, body }` unions — so the migration is
mechanically a wrapping job, not a rewrite.

OpenNext was rejected because it preserves the weakest-link API surface
(JSON-over-HTTP with hand-rolled types), and its Cloudflare adapter is a
moving target whose releases trail upstream Next by one to four weeks. We
do not want our Workers deployment story to be blocked on adapter releases.

## Plan: parallel coexistence + cutover

The migration runs in three commits across three PRs:

1. **AGE-44 (this PR)** — Scaffold TanStack Start alongside Next:
   - `vite.config.ts` + `app.config.ts` shim.
   - `app/routes/__root.tsx`, `app/routes/index.tsx` rendering the same
     `<CodeColonyApp />`.
   - `app/server/{health,repoScan,runtimePreview,backlogRefresh,mastraTriage}.ts`
     wrapping the existing pure cores. `mastraTriage` is a stub until
     AGE-47 (PR #62) lands.
   - New scripts: `npm run dev:tanstack`, `npm run build:tanstack`.
   - Default `npm run dev` / `build` stays on Next.
   - CI keeps both stacks green: lint, typecheck, vitest, `next build`.

2. **AGE-44b** (follow-up PR, not this one) — Cut over the client:
   - Replace `app/page.tsx` fetch calls with `useServerFn`/`useQuery` that
     call the TanStack server functions directly.
   - Remove the Next route handlers under `app/api/*`.
   - Keep `app/layout.tsx` only if needed for shared metadata; otherwise
     delete and let `__root.tsx` own the document shell.

3. **AGE-44c** (follow-up PR) — Drop Next:
   - Remove `next`, `next.config.mjs`, `next-env.d.ts`,
     `eslint-config-next`.
   - Switch `npm run dev` / `build` to vite.
   - Land Cloudflare Workers deploy in tandem with AGE-58.

## Notes on package selection

The AGE-44 ticket asked for `@tanstack/start-server-functions` as a
top-level dependency. That package does not exist on npm; server functions
are exported directly from `@tanstack/react-start` (see its `exports` map:
`./server-rpc`, `./client-rpc`, etc.). We installed only the published
packages:

- `@tanstack/react-start@1.167.51`
- `@tanstack/react-router@1.168.25`
- `vite@8.0.10`
- `@vitejs/plugin-react@6.0.1`
- `@cloudflare/vite-plugin@1.34.0` (added: required for the
  "configure server output for Cloudflare Workers" acceptance criterion)
- `wrangler@4.86.0` (peer of `@cloudflare/vite-plugin`)

`vite-config.ts` is the canonical TanStack Start v1 config since v1.121
(Vinxi → Vite migration). We keep `app.config.ts` as a thin re-export of
`vite.config.ts` to satisfy the AGE-44 spec wording without splitting the
source of truth.

## Edge cases tracked

- TanStack Start v1.167 + Vite 8 require Workers `nodejs_compat`; set in
  `wrangler.jsonc`.
- `app/routes/__root.tsx` and `app/routes/index.tsx` live under `app/` but
  do not collide with Next's App Router because Next only treats files
  named `page`, `layout`, `route`, `loading`, `error`, etc. as routes.
- AGE-51 lands a Vite landing under `apps/landing` on its own Vite
  version; that lives in a separate workspace folder and shares no
  `node_modules` with this Vite 8 install.
- File-upload streaming and middleware-error catching limitations
  (TanStack issues #5704, #6381) do not affect any of the five cores we
  ported; revisit before adding upload endpoints.

## Status update (2026-05-04)

- Phase 1 (scaffold) — Done. `vite.config.mts`, `app/routes/__root.tsx`, `app/routes/index.tsx`, and server function wrappers are all in place.
- AGE-72 (build + deploy TanStack Start app Worker) — Done. `feat/age-72-deploy-app-worker` (#89) added `app/router.tsx`, corrected `vite.config.mts` plugin options, and wired `alchemy/app.ts` + `cd-prod.yml` so `https://app.codecolony.online` serves the TanStack Start app.
- AGE-44b (client cutover) — Open. Next.js `app/page.tsx` still owns the primary route; no `useServerFn`/`useQuery` migration has started.
- AGE-44c (drop Next.js) — Open. `next.config.mjs`, `next-env.d.ts`, and `eslint-config-next` still present.

See `docs/adr/STATUS.md` for the full follow-up registry.

## References

- Skill: `tanstack-start` (verified 2026-01-21, expanded April 2026).
- TanStack v1.121 release notes (Vinxi → Vite).
- Cloudflare Workers framework guide for TanStack Start.
