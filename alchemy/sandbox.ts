/**
 * Sandbox-runner stack. Provisions the AGE-49 Worker (with its `Sandbox`
 * Durable Object + Container image) once PR #77 lands.
 *
 * Per-PR previews use the stage suffix as a name prefix so the runner does
 * not collide with prod. The HMAC secret is bound via `alchemy.secret(...)`
 * so it is encrypted in state and delivered to the Worker's runtime env.
 */
import alchemy from "alchemy";
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
      // alchemy.secret() pulls from ALCHEMY_PASSWORD-encrypted state and
      // delivers the plaintext to the Worker's runtime env. The
      // secretsStack registers SANDBOX_HMAC_KEY first; this binding pins
      // the value on the Worker.
      SANDBOX_HMAC_KEY: alchemy.secret(process.env.SANDBOX_HMAC_KEY),
    },
  });

  return { hostname: worker.url, workerName };
}
