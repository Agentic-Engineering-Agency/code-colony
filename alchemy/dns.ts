/**
 * DNS stack. Owns the `codecolony.dev` zone records that fan out to the
 * landing page (Pages CustomDomain), the sandbox runner Worker
 * (CustomDomain), and the FreeLLMAPI tunnel (raw DnsRecords CNAME).
 *
 * Only runs for the `prod` stage. Preview stages use the per-PR
 * `*.workers.dev` and `*.pages.dev` URLs Cloudflare emits by default.
 *
 * Distinction:
 *   - `CustomDomain` binds a Cloudflare Worker (or Pages project) to a
 *     hostname. We use it for the landing page and sandbox Worker.
 *   - `DnsRecords` writes raw zone records (CNAME, A, TXT). The
 *     FreeLLMAPI tunnel is just a CNAME to `<tunnel-id>.cfargotunnel.com`,
 *     so it goes through `DnsRecords`, not `CustomDomain`.
 */
import { CustomDomain, DnsRecords } from "alchemy/cloudflare";
import type Alchemy from "alchemy";

export interface DnsStackArgs {
  stage: string;
  landing: { hostname: string | undefined };
  sandbox: { hostname: string | undefined; workerName: string };
}

export async function dnsStack(
  _app: Awaited<ReturnType<typeof Alchemy>>,
  args: DnsStackArgs,
) {
  if (args.stage !== "prod") return;

  if (args.landing.hostname) {
    await CustomDomain("landing-apex", {
      name: "codecolony.dev",
      zoneName: "codecolony.dev",
      workerName: args.landing.hostname,
    });

    await CustomDomain("landing-www", {
      name: "www.codecolony.dev",
      zoneName: "codecolony.dev",
      workerName: args.landing.hostname,
    });
  }

  if (args.sandbox.hostname) {
    await CustomDomain("sandbox", {
      name: "sandbox.codecolony.dev",
      zoneName: "codecolony.dev",
      workerName: args.sandbox.workerName,
    });
  }

  // Cloudflare Tunnel CNAME for FreeLLMAPI. Tunnel id comes from
  // `cloudflared tunnel create freellmapi` output (AGE-56). Fail loudly if
  // the placeholder is still in place — pushing it to prod would break
  // `llm.codecolony.dev` and leave a bogus CNAME on the live zone.
  const tunnelId = process.env.FREELLM_TUNNEL_ID;
  if (!tunnelId) {
    throw new Error(
      "dnsStack(prod): FREELLM_TUNNEL_ID not set. Run `cloudflared tunnel create freellmapi` (AGE-56) and set the resulting UUID before deploying DNS.",
    );
  }

  await DnsRecords("freellm-tunnel", {
    zone: "codecolony.dev",
    records: [
      {
        type: "CNAME",
        name: "llm",
        content: `${tunnelId}.cfargotunnel.com`,
        proxied: true,
      },
    ],
  });
}
