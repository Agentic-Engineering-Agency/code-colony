/**
 * Landing-page stack. Imports the existing Cloudflare Pages project named
 * `code-colony-landing` rather than recreating it — the project was created
 * manually via `wrangler pages` during the AGE-50 fast-path deploy and we
 * want Alchemy to adopt it without disrupting the live URL.
 *
 * Until the AGE-51 Vite port lands, this stack is a no-op for non-prod
 * stages: previews of the landing page do not justify a separate Pages
 * project per PR (the static fast-path already covers the demo surface).
 */
import { Pages } from "alchemy/cloudflare";
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

  // `adopt: true` tells Alchemy to bind to the existing `code-colony-landing`
  // Pages project instead of erroring out on creation conflict.
  const project = await Pages("landing", {
    name: "code-colony-landing",
    adopt: true,
    productionBranch: "main",
  });

  return { hostname: project.subdomain };
}
