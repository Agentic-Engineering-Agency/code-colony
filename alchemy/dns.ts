/**
 * DNS stack. Owns the `codecolony.online` zone records for the Code Colony
 * deployment: landing page at the apex (and `www`), TanStack Start app at
 * `app`, sandbox runner at `sandbox`.
 *
 * Only runs for the `prod` stage. Preview stages use the per-PR
 * `*.workers.dev` and `*.pages.dev` URLs Cloudflare emits by default.
 *
 * Distinction:
 *   - `CustomDomain` binds a Cloudflare Worker to a hostname. We use it for
 *     the app Worker and sandbox Worker.
 *   - `DnsRecords` writes raw zone records (CNAME, A, TXT). The landing page
 *     points at the existing Pages hostname through `DnsRecords`.
 *
 * The `codecolony.online` zone is delegated to the Agentic Engineering
 * Cloudflare account (`48f381bf59212dbd98d2b424ba4b9a04`). If the zone is
 * absent at deploy time, fall back to the emitted `*.workers.dev` /
 * `*.pages.dev` hostnames and skip this prod DNS stack until delegation
 * is restored.
 *
 * The previous AGE-56 `llm.codecolony.online` Cloudflare-Tunnel record is
 * intentionally absent: we now call OpenRouter directly from the app
 * Worker, so no self-hosted LLM endpoint needs to be reachable from
 * Cloudflare's edge.
 */
import { CustomDomain, DnsRecords } from "alchemy/cloudflare";
import type Alchemy from "alchemy";

const ZONE = "codecolony.online";

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
      zone: ZONE,
      records: [
        {
          type: "CNAME",
          name: "@",
          content: args.landing.hostname,
          proxied: true,
        },
        {
          type: "CNAME",
          name: "www",
          content: args.landing.hostname,
          proxied: true,
        },
      ],
    });
  }

  if (args.app.hostname) {
    await CustomDomain("app", {
      name: `app.${ZONE}`,
      zoneName: ZONE,
      workerName: args.app.workerName,
    });
  }

  if (args.sandbox.hostname) {
    await CustomDomain("sandbox", {
      name: `sandbox.${ZONE}`,
      zoneName: ZONE,
      workerName: args.sandbox.workerName,
    });
  }
}
