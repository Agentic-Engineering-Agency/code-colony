/**
 * DNS stack. Owns the `codecolony.dev` zone records that fan out to the
 * landing page, the app, the sandbox runner, and the FreeLLMAPI tunnel.
 *
 * Only runs for the `prod` stage. Preview stages use the per-PR
 * `*.workers.dev` and `*.pages.dev` URLs that Cloudflare emits by default.
 */
import { CustomDomain, DnsRecords } from "alchemy/cloudflare";
import type Alchemy from "alchemy";

export interface DnsStackArgs {
  stage: string;
  landing: { hostname: string | undefined };
  sandbox: { hostname: string | undefined };
}

export async function dnsStack(
  _app: Awaited<ReturnType<typeof Alchemy>>,
  args: DnsStackArgs,
) {
  if (args.stage !== "prod") return;

  await CustomDomain("landing-apex", {
    zone: "codecolony.dev",
    hostname: "codecolony.dev",
    target: args.landing.hostname,
  });

  await CustomDomain("landing-www", {
    zone: "codecolony.dev",
    hostname: "www.codecolony.dev",
    target: args.landing.hostname,
  });

  await CustomDomain("sandbox", {
    zone: "codecolony.dev",
    hostname: "sandbox.codecolony.dev",
    target: args.sandbox.hostname,
  });

  await DnsRecords("freellm-tunnel", {
    zone: "codecolony.dev",
    records: [
      {
        type: "CNAME",
        name: "llm",
        content: "<TODO-AGE-56:tunnel-id>.cfargotunnel.com",
        proxied: true,
      },
    ],
  });
}
