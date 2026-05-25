# Local Development Runbook

## Prerequisites

- Node 20 or newer.
- npm; this repo uses `package-lock.json` and CI runs `npm ci`.
- Convex CLI through the root dependency tree (`npx convex ...`).
- Wrangler/Cloudflare auth only when running Worker or Alchemy commands.

## First setup

```bash
npm install
cp .env.example .env.local
cp apps/landing/.env.example apps/landing/.env.local
cp apps/sandbox-runner/.dev.vars.example apps/sandbox-runner/.dev.vars
```

Fill local placeholders only. Do not paste production-only provider keys into
example files or commit real `.env.local` / `.dev.vars` files.

## Local surfaces

```bash
npm run dev                    # Next.js app, http://localhost:3000
npm run tanstack:dev           # TanStack Start app, http://localhost:3001
npm run landing:dev            # Vite landing app, http://localhost:5173
npm --prefix apps/sandbox-runner run dev
npx convex dev
```

Seed Convex when needed:

```bash
npx convex run seed:seedFromDemoData
```

## Validation before handoff

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run tanstack:build
npm run iac:validate
npm run landing:typecheck
npm run landing:build
npm --prefix apps/sandbox-runner test
npm --prefix apps/sandbox-runner run deploy:dry
```

Run `npx convex dev --once --typecheck disable` and
`npm run convex:typecheck` when a Convex deploy key/dev deployment is available.

## Safety boundaries

- Keep Dodo in `test_mode`.
- Keep `AUTOMATION_DRY_RUN=1` unless explicitly testing an approved local side effect.
- Do not run live deploys, migrations, email sends, webhook broadcasts, or paid AI
  calls as part of ordinary local validation.

## Related runbooks

- CI: `docs/runbooks/ci.md`
- Secrets: `docs/runbooks/secrets.md`
- PostHog: `docs/runbooks/posthog.md`
- Workflows/workpools: `docs/runbooks/workflows-workpools.md`
