# ADR 0001 — Agent sandbox primitive

**Status:** Accepted
**Date:** 2026-04-29
**Linear:** AGE-52 (CC-SBX-01) · GitHub: [#67](https://github.com/Agentic-Engineering-Agency/code-colony/issues/67)
**Deciders:** Lalo

## Context

Code Colony agents (Mastra-powered) need to execute repository commands — `git clone`, `npm ci`, `npm test`, repo scans, build steps — in production. Today the Worker shells out via `execFile` / `spawn`, which is fine on a developer laptop but cannot work on Cloudflare Workers (no FS, no subprocess) and would be unsafe even where it could.

We need an isolated remote execution primitive the Worker can call to:

- run a sandboxed shell with a working directory
- clone a repo
- read/write files inside the sandbox
- forward a port if a runtime preview spins up an HTTP server
- enforce per-agent allow-listed commands

## Decision

Adopt the **Cloudflare Sandbox SDK** (`@cloudflare/sandbox`) on top of Workers Containers.

- Sandbox SDK GA'd alongside Workers Containers on **2026-04-13** (Workers Paid plan).
- It wraps the Container Durable Object lifecycle behind a high-level TypeScript surface (`exec`, `gitCheckout`, `writeFile`, `readFile`, `exposePort`, code interpreter, PTY).
- The Containers primitive itself is GA; the Sandbox SDK package is still in active development on `github.com/cloudflare/sandbox-sdk`. Acceptable for our use case behind a thin `runInSandbox` adapter that lets us swap to raw Containers if the SDK churns.

Raw `@cloudflare/containers` is rejected for now — we don't need custom DO lifecycle or multi-port routing today, and the SDK saves us a meaningful amount of boilerplate.

## Alternatives considered

| Option | Why not |
|---|---|
| **Raw Workers Containers** | Same isolation model as the Sandbox SDK but more boilerplate; we'd reimplement what `@cloudflare/sandbox` already gives us. Keep as a fallback if the SDK proves unstable. |
| **E2B** | Firecracker microVMs, ~150ms cold start, AI-agent ergonomic — but a separate vendor, separate billing, separate auth, and Code Colony already lives on Cloudflare. Loses service-binding latency wins. |
| **Daytona** | Persistent dev-workspace model. Strong for human IDE flows; mismatched for ephemeral per-job agent execution and adds another vendor. |
| **Modal** | GPU-native; we don't need GPUs for shell/build/test. Python-first, TS still beta. |
| **Fly Machines / Sprites** | Firecracker again. Strong option but, like E2B, off-Cloudflare. |
| **Local subprocess only** | Fails on Workers. Already the status quo and the source of the problem. |

## Consequences

### Wins
- One platform, one billing surface, low-latency service binding from the main Worker.
- Built-in `gitCheckout` + R2 mounting for cross-session persistence.
- Sandbox class is a Durable Object, so we get instance pinning + isolation for free.

### Risks / pitfalls (Cloudflare docs, dated 2026)
- **No Docker Hub image cache** — pin digests, prefer registries with cached pulls.
- **Cold-start latency** stacks per `exec` call. Batch flows into a single shell invocation (`bash -lc 'a && b && c'`).
- **Filesystem resets on idle**. Use R2 bucket mount for cross-session persistence.
- **`workers.dev` no wildcard DNS** for `exposePort` — runtime previews that need a public URL require a custom domain.
- **Provisioning delay** of ~2–3 min on first deploy.

### Wrangler binding pattern

```toml
name = "sandbox-runner"
main = "src/index.ts"
compatibility_date = "2026-04-29"

[[containers]]
class_name = "Sandbox"
image = "./Dockerfile"
instance_type = "standard-2"   # 1 vCPU, 6 GiB RAM, 12 GB disk
max_instances = 5

[[durable_objects.bindings]]
class_name = "Sandbox"
name = "Sandbox"

[[migrations]]
new_sqlite_classes = ["Sandbox"]
tag = "v1"
```

### Worker call pattern

```ts
import { getSandbox } from "@cloudflare/sandbox";
export { Sandbox } from "@cloudflare/sandbox";

export default {
  async fetch(req: Request, env: Env) {
    const sandbox = getSandbox(env.Sandbox, "agent-shell");
    await sandbox.gitCheckout(`https://${env.GH_TOKEN}@github.com/Agentic-Engineering-Agency/code-colony.git`, { depth: 1 });
    const r = await sandbox.exec("cd code-colony && npm ci && npm test");
    return Response.json({ ok: r.success, stdout: r.stdout, stderr: r.stderr, exit: r.exitCode });
  },
};
```

## Follow-up issues

- **AGE-49 (CC-SBX-02)** — scaffold `apps/sandbox-runner/` Worker
- **AGE-55 (CC-SBX-03)** — wire Mastra agents to a `runCommand` tool calling the runner
- **AGE-46** — must share the same `wrangler.toml` shape

## Sources

- Sandbox SDK getting-started: https://developers.cloudflare.com/sandbox/get-started/
- Container instance types: https://developers.cloudflare.com/containers/platform-details/limits/
- Image management caveats: https://developers.cloudflare.com/containers/platform-details/image-management/
- Persistent storage tutorial: https://developers.cloudflare.com/sandbox/tutorials/persistent-storage/
- Git workflows guide: https://developers.cloudflare.com/sandbox/guides/git-workflows/
- SDK repo: https://github.com/cloudflare/sandbox-sdk

## Status update (2026-05-04)

- AGE-49 (scaffold `apps/sandbox-runner/`) — Done. The Worker is deployed with HMAC auth and a Container-backed Durable Object.
- AGE-55 (wire Mastra `runCommand` tool) — In Progress. Branch `feature/age-55-mastra-runcommand` exists.
- AGE-46 (`wrangler.toml` shape sharing) — Done; superseded by AGE-72, which aligned both app and sandbox runner deploy shapes.

See `docs/adr/STATUS.md` for the full follow-up registry.
