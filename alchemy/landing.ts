/**
 * Landing-page stack. References the existing Cloudflare Pages project named
 * `code-colony-landing` rather than recreating it — the project was created
 * manually via `wrangler pages` during the AGE-50 fast-path deploy and is
 * still deployed by the Pages workflow outside this Alchemy stack.
 *
 * Alchemy's currently installed Cloudflare provider does not expose a Pages
 * resource. The apex domain (codecolony.online) is attached as a custom domain
 * to the Pages project via the Cloudflare API in cd-prod.yml. Cloudflare then
 * manages the apex DNS record and TLS automatically.
 * Previews keep using Cloudflare's default Pages/Workers preview URLs.
 */
import type Alchemy from "alchemy";

export interface LandingStackArgs {
  stage: string;
}

export interface LandingStackOutput {
  hostname: string | undefined;
}

export async function landingStack(
  _app: Awaited<ReturnType<typeof Alchemy>>,
  args: LandingStackArgs,
): Promise<LandingStackOutput> {
  if (args.stage !== "prod") {
    return { hostname: undefined };
  }

  return { hostname: "code-colony-landing.pages.dev" };
}
