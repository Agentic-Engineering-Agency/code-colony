/**
 * DNS stack. Owns the `agenticengineering.lat` zone records for the Code
 * Colony deployment: landing page at `codecolony`, TanStack Start app at
 * `app.codecolony`, sandbox runner at `sandbox.codecolony`, and the AGE-56
 * FreeLLMAPI tunnel placeholder at `llm.codecolony`.
 *
 * Only runs for the `prod` stage. Preview stages use the per-PR
 * `*.workers.dev` and `*.pages.dev` URLs Cloudflare emits by default.
 *
 * Distinction:
 *   - `CustomDomain` binds a Cloudflare Worker to a hostname. We use it for
 *     the app Worker and sandbox Worker.
 *   - `DnsRecords` writes raw zone records (CNAME, A, TXT). The landing page
 *     points at the existing Pages hostname, and the FreeLLMAPI tunnel is a
 *     CNAME to `<tunnel-id>.cfargotunnel.com`, so both go through
 *     `DnsRecords`.
 *
 * Local verification on 2026-05-01 confirmed Wrangler is authenticated to
 * Cloudflare account `48f381bf59212dbd98d2b424ba4b9a04`. This Wrangler
 * version does not expose `wrangler dns records list`, and no local
 * `CLOUDFLARE_API_TOKEN` was present for direct zone lookup; if the zone is
 * absent at deploy time, use the emitted `*.workers.dev` / `*.pages.dev`
 * hostnames and skip this prod DNS stack until the zone is delegated.
 */
import { CustomDomain, DnsRecords } from "alchemy/cloudflare";
import type Alchemy from "alchemy";

export interface DnsStackArgs {
  stage: string;
  landing: { hostname: string | undefined };
  app: { hostname: string | undefined; workerName: string };
  sandbox: { hostname: string | undefined; workerName: string };
}

export async function dnsStack(
  _app: Awaited<ReturnType<typeof Alchemy>>,
  args: DnsStackArgs,
) {
  if (args.stage !== "prod") return;

  if (args.landing.hostname) {
    await DnsRecords("landing-apex", {
      zone: "agenticengineering.lat",
      records: [
        {
          type: "CNAME",
          name: "codecolony",
          content: args.landing.hostname,
          proxied: true,
        },
      ],
    });
  }

  if (args.app.hostname) {
    await CustomDomain("app", {
      name: "app.codecolony.agenticengineering.lat",
      zoneName: "agenticengineering.lat",
      workerName: args.app.workerName,
    });
  }

  if (args.sandbox.hostname) {
    await CustomDomain("sandbox", {
      name: "sandbox.codecolony.agenticengineering.lat",
      zoneName: "agenticengineering.lat",
      workerName: args.sandbox.workerName,
    });
  }
  await DnsRecords("freellm-tunnel", {
    zone: "agenticengineering.lat",
    records: [
      {
        type: "CNAME",
        name: "llm.codecolony",
        content: "<TODO-AGE-56:tunnel-id>.cfargotunnel.com",
        proxied: true,
      },
    ],
  });
}
