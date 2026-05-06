# ADR Follow-Up Status

> Ticket numbers are accurate as of the last update date (2026-05-04) and may be reassigned. Prefer branch names over ticket numbers where possible.

| Ticket | ADR | Description | Status | Branch / PR | Last Verified |
| --- | --- | --- | --- | --- | --- |
| AGE-49 | 0001 | Scaffold `apps/sandbox-runner/` Worker | Done | `feature/age-49-sandbox-runner` → #68 | 2026-05-04 |
| AGE-55 | 0001 | Wire Mastra agents to `runCommand` tool calling the runner | In Progress | `feature/age-55-mastra-runcommand` | 2026-05-04 |
| AGE-46 | 0001 | Share `wrangler.toml` shape between app and sandbox | Done | superseded by AGE-72 | 2026-05-04 |
| AGE-57 | 0002 | GitHub Actions workflows for `alchemy deploy --stage prod` and preview | Done | `cd-prod.yml`, `cd-preview.yml`, `cd-preview-cleanup.yml` | 2026-05-04 |
| AGE-59 | 0002 | Flesh out `alchemy/landing.ts` once AGE-51 (Vite port) lands | Done | `alchemy/landing.ts` adopts `code-colony-landing` | 2026-05-04 |
| AGE-56 | 0002 | Replace `<TODO-AGE-56:tunnel-id>` in `alchemy/dns.ts` with real Tunnel UUID | Done | placeholder removed; tunnel created | 2026-05-04 |
| AGE-72 | 0002 | Add `alchemy/app.ts` app stack (deferred from ADR 0002) | Done | `feat/age-72-deploy-app-worker` → #89 | 2026-05-04 |
| AGE-50 | 0004 | Ship landing-page sign-up calling `waitlist.join` from browser | Open | — | 2026-05-04 |
| AGE-55 | 0004 | Replace simulated triage agent with real Mastra `backlogTriageAgent` | In Progress | `feature/age-55-mastra-runcommand` | 2026-05-04 |
| AGE-58 / AGE-59 | 0004 | Provision R2 bucket + secrets via Alchemy and wire `R2_*` env vars | Partially Done | component mounted; env vars unset | 2026-05-04 |
| Better Auth | 0004 | Ship React provider + sign-in form on `apps/landing` and proxy handler | Open | — | 2026-05-04 |
| AGE-44b | 0005 | TanStack Start client cutover: replace Next.js fetch with `useServerFn`/`useQuery` | Open | — | 2026-05-04 |
| AGE-44c | 0005 | Drop Next.js entirely and switch default `npm run dev` / `build` to Vite | Open | — | 2026-05-04 |
| AGE-72 | 0005 | Deploy TanStack Start app Worker to Cloudflare | Done | `feat/age-72-deploy-app-worker` → #89 | 2026-05-04 |
| AGE-63+ | 0006 | Create `convex/customers.ts` and wire `dodo.identify()` to Better Auth users | Open | — | 2026-05-04 |
| AGE-63+ | 0006 | Disable Resend `testMode` and set up Resend webhook endpoint | Open | — | 2026-05-04 |
| AGE-63+ | 0006 | Run `npx agent-ready setup` and enable public serving of `llms.txt` / `agents.md` | Open | — | 2026-05-04 |
| AGE-63+ | 0006 | Provision `STEEL_API_KEY` and build first browser-automation action | Open | — | 2026-05-04 |
| AGE-63+ | 0006 | Evaluate `@akshatgiri/convex-orchestrator` worker model | Open | — | 2026-05-04 |
| AGE-63+ | 0006 | Wire `llmCache` into Mastra LLM calls in `mastra/llm.ts` | Open | — | 2026-05-04 |
| AGE-63+ | 0006 | Add `debouncer.schedule()` to triage pipeline | Open | — | 2026-05-04 |
| AGE-63+ | 0006 | Wire `webhookSender` to notify external systems on agent runs / billing | Open | — | 2026-05-04 |
| AGE-63+ | 0006 | Add `timeline.push()` / `timeline.undo()` to agent draft revisions | Open | — | 2026-05-04 |
| AGE-63+ | 0006 | Update `convex/rateLimiter.ts` with new rate-limit names | Open | — | 2026-05-04 |
