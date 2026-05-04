# sandbox-runner

Cloudflare Worker that fronts [`@cloudflare/sandbox`](https://github.com/cloudflare/sandbox-sdk) so Code Colony agents can run shell commands and clone repos in an isolated container.

> Decision: see [`docs/adr/0001-agent-sandbox.md`](../../docs/adr/0001-agent-sandbox.md).
> Linear: AGE-49 (CC-SBX-02). GitHub: #68.

## Surface

| Method | Path         | Body                                                               | Auth      |
| ------ | ------------ | ------------------------------------------------------------------ | --------- |
| GET    | `/health`    | —                                                                  | none      |
| POST   | `/exec`      | `{ "command": string, "sandboxId"?: string }`                      | HMAC      |
| POST   | `/git-clone` | `{ "repoUrl": string, "branch"?, "targetDir"?, "depth"?, "sandboxId"? }` | HMAC |

Streaming, port forwarding, and file I/O are intentionally out of scope for this scaffold and are tracked under CC-SBX-03.

## Auth

Every authed request must carry two headers:

- `x-sandbox-ts` — Unix epoch milliseconds when the request was signed.
- `x-sandbox-sig` — `hex(hmac-sha256(timestamp || body, env.SANDBOX_HMAC_KEY))`.

Requests with a timestamp more than five minutes off from the Worker clock are rejected to limit replay. The body is bound into the MAC, so any tampering invalidates the signature.

## Environment variables

| Name                | Purpose                                                       |
| ------------------- | ------------------------------------------------------------- |
| `SANDBOX_HMAC_KEY`  | Shared secret used to verify `x-sandbox-sig` on each request. |

Set it locally with `wrangler secret put SANDBOX_HMAC_KEY` before running `wrangler dev`, or place it in `.dev.vars` (gitignored) for local-only development.

## Bindings

`wrangler.toml` declares:

- `[[durable_objects.bindings]] name = "Sandbox"` — bound to the `Sandbox` class re-exported by the SDK.
- `[[containers]] class_name = "Sandbox" image = "./Dockerfile"` with `instance_type = "standard-2"` and `max_instances = 5`.
- `[[migrations]] new_sqlite_classes = ["Sandbox"] tag = "v1"` — Cloudflare requires `new_sqlite_classes` for Container DOs.

The included `Dockerfile` is a placeholder (alpine + git + bash); the real
runtime image is supplied by the SDK in CC-SBX-03. The container is
configured with `max_instances = 5` and `instance_type = "standard-2"`.
Cold-start latency stacks per `exec` call; batch flows into a single shell
invocation (`bash -lc 'a && b && c'`) where possible.

## Develop

```bash
npm install
npm run typecheck
npm test
npm run deploy:dry  # wrangler deploy --dry-run --outdir=.dryrun
```

`npm run dev` boots `wrangler dev`. The `Sandbox` Durable Object requires Workers Containers, which is a paid-plan feature; local dev without a Cloudflare account will skip the container and report the limitation.

## Smoke test

Once `npm run dev` is running on `http://127.0.0.1:8787`:

```bash
SECRET=$(cat .dev.vars | awk -F= '/SANDBOX_HMAC_KEY/{print $2}' | tr -d '"')
TS=$(node -e 'process.stdout.write(String(Date.now()))')
BODY='{"command":"echo hello"}'
SIG=$(node -e "
  const c=require('node:crypto');
  process.stdout.write(c.createHmac('sha256',process.argv[1]).update(process.argv[2]+process.argv[3]).digest('hex'));
" "$SECRET" "$TS" "$BODY")

curl -sS -X POST http://127.0.0.1:8787/exec \
  -H "content-type: application/json" \
  -H "x-sandbox-ts: $TS" \
  -H "x-sandbox-sig: $SIG" \
  --data "$BODY"
```

`GET /health` is unauthenticated and useful for liveness checks:

```bash
curl -sS http://127.0.0.1:8787/health
```

## Layout

```
apps/sandbox-runner/
├── src/
│   ├── index.ts          # fetch handler + Sandbox re-export
│   ├── auth.ts           # signHmac + verifyHmac (Web Crypto)
│   └── types.ts          # ExecRequest/Response, GitCloneRequest/Response
├── __tests__/
│   └── auth.test.ts      # vitest coverage for the auth helpers
├── Dockerfile            # placeholder image (alpine + git + bash)
├── entrypoint.sh         # `tail -f /dev/null` keep-alive
├── wrangler.toml         # bindings, containers, migrations
├── package.json
└── tsconfig.json
```

## Architecture context

- ADR: `docs/adr/0001-agent-sandbox.md`
- Secrets runbook: `docs/runbooks/secrets.md`
- Linear: AGE-49 (CC-SBX-02). GitHub: #68.
