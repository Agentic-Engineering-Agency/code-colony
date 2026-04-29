/**
 * Sandbox-runner stack. Provisions the AGE-49 Worker (with its `Sandbox`
 * Durable Object + Container image) once PR #77 lands.
 *
 * Per-PR previews use the stage suffix as a name prefix so the runner does
 * not collide with prod. The HMAC secret is read from the secrets stack;
 * the Worker only reaches the runtime if `secrets:SANDBOX_HMAC_KEY` exists.
 */
import { Worker, Container, DurableObjectNamespace } from "alchemy/cloudflare";
import type Alchemy from "alchemy";

export interface SandboxStackArgs {
  stage: string;
}

export interface SandboxStackOutput {
  hostname: string | undefined;
  workerName: string;
}

export async function sandboxStack(
  _app: Awaited<ReturnType<typeof Alchemy>>,
  args: SandboxStackArgs,
): Promise<SandboxStackOutput> {
  const isProd = args.stage === "prod";
  const namePrefix = isProd ? "" : `${args.stage}-`;
  const workerName = `${namePrefix}code-colony-sandbox-runner`;

  // The Container resource builds the image referenced by the AGE-49
  // wrangler.toml, then mounts it as the Sandbox DO class. Until PR #77
  // merges, the source path is intentionally relative — Alchemy resolves
  // it from the repo root.
  const sandboxImage = await Container(`${workerName}-image`, {
    name: `${workerName}-image`,
    build: {
      context: "apps/sandbox-runner",
      dockerfile: "Dockerfile",
    },
    instanceType: "standard-2",
    maxInstances: isProd ? 5 : 2,
  });

  const sandboxDO = await DurableObjectNamespace(`${workerName}-sandbox-do`, {
    className: "Sandbox",
    sqlite: true,
  });

  const worker = await Worker(workerName, {
    name: workerName,
    entrypoint: "apps/sandbox-runner/src/index.ts",
    compatibilityDate: "2026-04-29",
    bindings: {
      Sandbox: sandboxDO,
      SANDBOX_IMAGE: sandboxImage,
      SANDBOX_HMAC_KEY: alchemySecret("SANDBOX_HMAC_KEY"),
    },
  });

  return { hostname: worker.url, workerName };
}

// Inline secret reference; the secretsStack registers the value with the
// matching name, so this stays declarative.
function alchemySecret(name: string) {
  return { type: "secret" as const, name };
}
