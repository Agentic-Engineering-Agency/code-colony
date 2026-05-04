# Roadmap

> This is a high-level overlay on the ADR follow-up tracker (`docs/adr/STATUS.md`) and the README "Next sprint" section. For the authoritative list of open items with branch names and verification dates, see `docs/adr/STATUS.md`.

## Current quarter (Q2 2026)

| Priority | Ticket | Surface | Description |
| --- | --- | --- | --- |
| 1 | AGE-72 | App / IaC | Deploy TanStack Start app Worker to Cloudflare via Alchemy |
| 2 | AGE-44b | App | TanStack Start client cutover: replace Next.js fetch with `useServerFn`/`useQuery` |
| 3 | AGE-55 | Agents / Sandbox | Real Mastra triage: wire `runCommand` tool to live `apps/sandbox-runner` |
| 4 | AGE-63+ | Backend | Billing / orchestration / email component wiring (Dodo, Resend, Steel, webhooks) |
| 5 | AGE-53 | Landing | Landing-page video URL + waitlist wiring to Convex mutation |
| 6 | AGE-50 | Landing | Landing-page sign-up calling `waitlist.join` from the browser |

## Medium-term (Q3 2026)

- Complete TanStack Start migration and drop Next.js (AGE-44c).
- Live repo-scanning pipeline feeding real `repoScans` data into the world map.
- Honcho memory integration for agent long-term context.
- Real multiplayer presence and collaborative voting (no longer mocked).
- Marketplace real installs and agent loadout persistence in Convex.

## Long-term (2027)

- PixiJS world renderer replacing the CSS grid map.
- Agent skill market with third-party skill submissions.
- Real-time multiplayer sessions with shared cursors and voice.
- Cost-ledger and trust-oracle v2 with on-chain attestation option.
