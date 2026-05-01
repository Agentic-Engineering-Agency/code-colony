# ADR 0002 — Infrastructure-as-Code with Alchemy

- **Status**: Accepted, 2026-04-29
- **Owners**: Lalo / Code Colony platform
- **Linear**: AGE-58, AGE-59
- **Supersedes**: ad-hoc `wrangler` invocations from `landing/DEPLOY-PROMPT.md`
- **Related**: ADR 0001 (sandbox primitive), ADR 0004 (Convex Components)

## Context

Code Colony already runs four pieces of Cloudflare infrastructure: the static
landing page (Pages), the Next.js app (Workers, future), the sandbox-runner
Worker with a Container-backed Durable Object (AGE-49), and a forthcoming
Cloudflare Tunnel for FreeLLMAPI (AGE-56). DNS at `codecolony.dev` ties them
together. We also keep a roster of secrets (HMAC, FreeLLMAPI key, R2 admin
keys, Better Auth secret, Convex deploy key) that today live in `wrangler
secret put` and ad-hoc shell history.

We need the same artifacts to be reproducible across `dev`, `preview-<pr>`,
and `prod` stages, with per-PR ephemerals destroyed on PR close. We also
want the description of "what is deployed" to live next to the source it
deploys, in plain TypeScript, with no YAML stew.

## Decision

Adopt **[Alchemy](https://alchemy.run)** as the IaC layer. All Cloudflare
resources are declared in `alchemy/*.ts` and orchestrated by
`alchemy.run.ts`. Pulumi, SST, OpenTofu, and raw `wrangler.toml` are
explicitly rejected.

### Layout

```
code-colony/
├── alchemy.run.ts          # entrypoint: stages + stack composition
├── alchemy/
│   ├── landing.ts          # Pages project (adopts code-colony-landing)
│   ├── sandbox.ts          # Worker + Container + Sandbox DO (AGE-49)
│   ├── dns.ts              # codecolony.dev zone records (prod only)
│   └── secrets.ts          # one source of truth for Cloudflare/Convex secrets
└── docs/adr/0002-iac-alchemy.md
```

`package.json` exposes:

```jsonc
"scripts": {
  "iac:diff":    "alchemy diff",
  "iac:deploy":  "alchemy deploy",
  "iac:destroy": "alchemy destroy"
}
```

### Stages

| Stage              | When                          | Resources created                          |
| ------------------ | ----------------------------- | ------------------------------------------ |
| `dev`              | Local laptop                  | Optional — Alchemy state stays in `.alchemy/` |
| `preview-<n>`      | Per-PR via `cd-preview.yml`   | Sandbox runner only; no DNS, no Pages adoption |
| `prod`             | Manual or `cd-prod.yml` trigger | Pages adoption, Worker, Container, Sandbox DO, DNS, all secrets |

The stage convention follows Alchemy's documented `--stage prod` /
`--stage preview-${{ github.event.pull_request.number }}` pattern (see
the AGE-58 research artifact).

### State

- Local dev: JSON files under `.alchemy/` (gitignored).
- CI: `ALCHEMY_STATE_STORE=cloudflare` writes to a Cloudflare KV namespace,
  encrypted with `ALCHEMY_PASSWORD` and authenticated with `ALCHEMY_STATE_TOKEN`.

### Adoption rules

`alchemy/landing.ts` uses `Pages({ name: "code-colony-landing", adopt: true })`
so the live `code-colony-landing.pages.dev` project is brought under
management without disruption. Every other resource is created fresh.

### Why Alchemy

- TS-native: no YAML, no separate language for infra. Strict-TS friendly.
- First-class `Container` resource — handles the AGE-49 Worker Container
  build + DO migration in one place. Pulumi can do this but only via the
  cloudflare provider's resource shape, which still wraps `wrangler.toml`.
- Per-stage destroy semantics. We need ephemerals on PR close.
- Cloudflare-first: the resource catalogue covers Pages, Workers, R2, KV,
  D1, Containers, DnsRecords, CustomDomain, DurableObjectNamespace, and
  Secrets without third-party providers.
- Lock-in is bounded: every resource resolves down to documented
  Cloudflare API calls, so we can leave Alchemy by reading `.alchemy/state`
  and replaying the calls.

### Rejected alternatives

- **`wrangler.toml` per project** — already in use; forces Wrangler-CLI
  hybrid runs (we'd still need a separate tool to manage DNS, R2, and
  Pages adoption), and per-PR ephemerals require shell scripting.
- **Pulumi** — capable, but pulls in a Python/TS runtime split, requires
  an external state backend (S3 or Pulumi Cloud), and the Cloudflare
  provider lags Alchemy's coverage of the Containers preview API.
- **SST** — opinionated toward AWS; adapting to a Cloudflare-only surface
  spends complexity on the parts we don't use.
- **OpenTofu / Terraform** — HCL plus a provider matrix means edits ripple
  through three artifacts to land one change.

## Consequences

- Pro: every cross-cutting deploy concern (stages, secrets, adoption,
  destroy-on-PR-close) lives in one TypeScript tree the rest of the
  repo can read.
- Pro: scripts in `package.json` are stable; CI workflows can call
  `npm run iac:deploy` without reimplementing argument shape.
- Con: Alchemy is younger than Pulumi/Terraform; resource gaps require
  occasional escape hatches into `wrangler` for one-off settings.
- Con: One more dependency to keep current; Alchemy's `Container` shape
  has shipped breaking changes on minor versions in the past.

## Verification

This PR scaffolds the directory and wires the entrypoint, but it does
**not** invoke `alchemy deploy` against the live account — we want the
secrets pipeline (AGE-57) and the prod Convex deployment (AGE-61) to land
first so the first managed apply does not race the manual surface.

Smoke verification:

```
npm run iac:diff         # ✓ Alchemy reads alchemy.run.ts and prints "no changes"
npm run iac:deploy --dry-run
                         # ✓ Resolves resource graph without touching Cloudflare
```

(Live `alchemy deploy` deferred to AGE-57's CD wiring.)

## Open follow-ups

- AGE-57: GitHub Actions workflows that call `alchemy deploy --stage prod`
  on `main` and `--stage preview-${{ pull_request.number }}` on PRs, with
  `alchemy destroy` on PR close.
- AGE-59: flesh out `alchemy/landing.ts` once AGE-51 (Vite port) lands so
  Alchemy can build the `dist/` and upload it (replacing the manual
  `wrangler pages deploy`).
- AGE-56: the placeholder `<TODO-AGE-56:tunnel-id>` in `alchemy/dns.ts`
  needs the real Cloudflare Tunnel UUID once the tunnel is created.
- App stack: `alchemy/app.ts` is intentionally not in this PR — AGE-46
  picks the Workers hosting model first.
