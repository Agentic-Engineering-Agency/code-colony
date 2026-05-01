import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * AGE-72 / CC-DEPLOY-01 — structural deploy contract.
 *
 * Phase B failing tests for "Wire app Worker deploy". Each `it` block tags
 * the spec scenario(s) it covers. The assertions read repo files from disk;
 * they are intentionally textual (regex / substring) rather than AST-based
 * because the spec defines exact tokens. See
 * `docs/specs/AGE-72-deploy-app-worker.md`.
 */

const REPO = path.resolve(__dirname, "..");

async function readRepo(rel: string): Promise<string> {
  return readFile(path.join(REPO, rel), "utf8");
}

interface YamlStep {
  /** Index of the dash line in the original lines array. */
  index: number;
  name: string | undefined;
  /** Concatenated body text for substring searches. */
  body: string;
}

/**
 * Parse GitHub Actions workflow steps. A step starts with a line matching
 * `      - ` (six-space indent + dash). Subsequent lines indented further are
 * part of the step. Tolerates `name:`/`if:`/`run: |` on the dash line or any
 * later line of the same step.
 */
function parseSteps(yaml: string): YamlStep[] {
  const lines = yaml.split("\n");
  const stepStart = /^ {6}- /;
  const steps: YamlStep[] = [];
  let current: { index: number; lines: string[] } | null = null;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (stepStart.test(line)) {
      if (current) steps.push(finalize(current));
      current = { index: i, lines: [line] };
      continue;
    }
    if (current) {
      // Step body continues while the line is blank or indented >=8 spaces.
      if (line === "" || /^ {8}/.test(line)) {
        current.lines.push(line);
      } else {
        steps.push(finalize(current));
        current = null;
      }
    }
  }
  if (current) steps.push(finalize(current));
  return steps;
}

function finalize(s: { index: number; lines: string[] }): YamlStep {
  const body = s.lines.join("\n");
  // Match `name:` on any line of the step, allowing leading dash/spaces.
  const nameMatch = body.match(/(?:^|\n)\s*(?:- )?name:\s*(.+?)\s*$/m);
  const name = nameMatch ? nameMatch[1].trim() : undefined;
  return { index: s.index, name, body };
}

function findStep(steps: YamlStep[], name: string): YamlStep | undefined {
  return steps.find((s) => s.name === name);
}

describe("AGE-72 deploy contract", () => {
  it("alchemy/app.ts uses BUILT_WORKER_ENTRYPOINT pointing under dist/ and preserves bindings", async () => {
    // spec: AGE-72 / scenario S1, S6
    const src = await readRepo("alchemy/app.ts");

    const constMatch = src.match(
      /const\s+BUILT_WORKER_ENTRYPOINT\s*=\s*["']([^"']+)["']/,
    );
    expect(
      constMatch,
      "alchemy/app.ts must declare `const BUILT_WORKER_ENTRYPOINT = \"dist/...\"` (the deploy contract for the built artifact path; spec §API/contract)",
    ).not.toBeNull();
    expect(
      constMatch![1],
      `alchemy/app.ts BUILT_WORKER_ENTRYPOINT value must match /^dist\\/[^"']+$/, got ${JSON.stringify(constMatch![1])}`,
    ).toMatch(/^dist\/[^"']+$/);

    expect(
      /entrypoint:\s*BUILT_WORKER_ENTRYPOINT\b/.test(src),
      "alchemy/app.ts Worker(...) must pass `entrypoint: BUILT_WORKER_ENTRYPOINT` (currently still WRANGLER_ENTRYPOINT)",
    ).toBe(true);
    expect(
      src.includes('entrypoint: "@tanstack/react-start/server-entry"'),
      "alchemy/app.ts must not pass the virtual `@tanstack/react-start/server-entry` literal as the deploy entrypoint",
    ).toBe(false);

    const bindingsMatch = src.match(/bindings:\s*{([\s\S]*?)\n\s{4}}/);
    expect(
      bindingsMatch,
      "alchemy/app.ts must declare a `bindings: { ... }` block in the Worker(...) call",
    ).not.toBeNull();
    const bindingsBlock = bindingsMatch![1];
    const keys = Array.from(
      bindingsBlock.matchAll(/^\s{6}([A-Z_][A-Z0-9_]*)\s*[:,]/gm),
    )
      .map((m) => m[1])
      .sort();
    const expectedKeys = [
      "CONVEX_URL",
      "OPENROUTER_API_KEY",
      "OPENROUTER_MODEL_ID",
      "OPENROUTER_URL",
      "SANDBOX_HMAC_KEY",
      "SANDBOX_RUNNER_URL",
    ];
    expect(
      keys,
      `alchemy/app.ts bindings keys must remain exactly ${expectedKeys.join(", ")} (spec §Bindings); got ${keys.join(", ")}`,
    ).toEqual(expectedKeys);
  });

  it("alchemy.run.ts re-enables appStack and wires it into dnsStack", async () => {
    // spec: AGE-72 / scenario S1
    const src = await readRepo("alchemy.run.ts");

    expect(
      /^\s*import\s+\{\s*appStack\s*\}\s+from\s+["']\.\/alchemy\/app\.ts["'];/m.test(
        src,
      ),
      "alchemy.run.ts must import { appStack } from \"./alchemy/app.ts\" (uncommented)",
    ).toBe(true);
    expect(
      /\/\/\s*import\s+\{\s*appStack\s*\}/.test(src),
      "alchemy.run.ts must not retain a commented `// import { appStack }` line",
    ).toBe(false);

    expect(
      /^\s*const\s+appWorker\s*=\s*await\s+appStack\(\s*app\s*,\s*\{\s*stage\s*,\s*sandbox\s*\}\s*\)\s*;/m.test(
        src,
      ),
      "alchemy.run.ts must contain `const appWorker = await appStack(app, { stage, sandbox });` uncommented",
    ).toBe(true);
    expect(
      /\/\/\s*const\s+appWorker\s*=\s*await\s+appStack\(/.test(src),
      "alchemy.run.ts must not retain a commented `// const appWorker = await appStack(...)` line",
    ).toBe(false);

    expect(
      /app:\s*\{\s*hostname:\s*appWorker\.hostname\s*,\s*workerName:\s*appWorker\.workerName/.test(
        src,
      ),
      "alchemy.run.ts dnsStack(...) must be called with `app: { hostname: appWorker.hostname, workerName: appWorker.workerName }` (currently passes `hostname: undefined` placeholder)",
    ).toBe(true);
  });

  it("cd-prod.yml inserts `Build TanStack Start app` between Install Alchemy and Deploy Cloudflare infrastructure", async () => {
    // spec: AGE-72 / scenario S1
    const yaml = await readRepo(".github/workflows/cd-prod.yml");
    const steps = parseSteps(yaml);

    const build = findStep(steps, "Build TanStack Start app");
    const install = findStep(steps, "Install Alchemy for deploy");
    const deploy = findStep(steps, "Deploy Cloudflare infrastructure");

    expect(
      build,
      ".github/workflows/cd-prod.yml must contain a step named `Build TanStack Start app` (spec §CI step insertion (cd-prod.yml))",
    ).toBeDefined();
    expect(
      install,
      ".github/workflows/cd-prod.yml is missing the `Install Alchemy for deploy` step — repo invariant violated",
    ).toBeDefined();
    expect(
      deploy,
      ".github/workflows/cd-prod.yml is missing the `Deploy Cloudflare infrastructure` step — repo invariant violated",
    ).toBeDefined();

    expect(
      /\brun:\s*npm\s+run\s+build:tanstack\b/.test(build!.body),
      ".github/workflows/cd-prod.yml `Build TanStack Start app` step must `run: npm run build:tanstack`",
    ).toBe(true);

    expect(
      install!.index < build!.index && build!.index < deploy!.index,
      `.github/workflows/cd-prod.yml step order must be Install Alchemy for deploy → Build TanStack Start app → Deploy Cloudflare infrastructure (got line indices install=${install!.index}, build=${build?.index}, deploy=${deploy!.index})`,
    ).toBe(true);
  });

  it("cd-preview.yml mirrors the build step gated on deploy-secrets.ready", async () => {
    // spec: AGE-72 / scenario S2
    const yaml = await readRepo(".github/workflows/cd-preview.yml");
    const steps = parseSteps(yaml);

    const build = findStep(steps, "Build TanStack Start app");
    const install = findStep(steps, "Install Alchemy for deploy");
    const deploy = findStep(steps, "Deploy Cloudflare preview infrastructure");

    expect(
      build,
      ".github/workflows/cd-preview.yml must contain a step named `Build TanStack Start app` (spec §CI step insertion (cd-preview.yml))",
    ).toBeDefined();
    expect(install).toBeDefined();
    expect(deploy).toBeDefined();

    expect(
      /if:\s*steps\.deploy-secrets\.outputs\.ready\s*==\s*'true'/.test(
        build!.body,
      ),
      ".github/workflows/cd-preview.yml `Build TanStack Start app` step must be gated by `if: steps.deploy-secrets.outputs.ready == 'true'`",
    ).toBe(true);
    expect(
      /\brun:\s*npm\s+run\s+build:tanstack\b/.test(build!.body),
      ".github/workflows/cd-preview.yml `Build TanStack Start app` step must `run: npm run build:tanstack`",
    ).toBe(true);

    expect(
      install!.index < build!.index && build!.index < deploy!.index,
      `.github/workflows/cd-preview.yml step order must be Install Alchemy for deploy → Build TanStack Start app → Deploy Cloudflare preview infrastructure (got line indices install=${install!.index}, build=${build?.index}, deploy=${deploy!.index})`,
    ).toBe(true);
  });

  it("wrangler.jsonc dev entrypoint stays at the virtual @tanstack/react-start/server-entry module", async () => {
    // spec: AGE-72 / scenario S6
    const raw = await readRepo("wrangler.jsonc");
    // Strip `//` line comments (JSONC) before parsing.
    const stripped = raw.replace(/^\s*\/\/.*$/gm, "");
    const config = JSON.parse(stripped) as { main?: unknown };
    expect(
      config.main,
      "wrangler.jsonc `main` must remain `@tanstack/react-start/server-entry` so `npm run dev:tanstack` keeps using the virtual module (spec §S6 adversarial drift)",
    ).toBe("@tanstack/react-start/server-entry");
  });

  it("docs/specs/AGE-72-deploy-app-worker.md exists with the required H2 sections in order", async () => {
    // spec: AGE-72 / scenario S1-S6 (regression guard on spec presence)
    const md = await readRepo("docs/specs/AGE-72-deploy-app-worker.md");
    const headings = Array.from(md.matchAll(/^##\s+(.+?)\s*$/gm)).map(
      (m) => m[1],
    );
    const expected = [
      "Goal",
      "Non-goals",
      "API / contract",
      "Behavior",
      "Out-of-scope follow-ups",
      "Acceptance",
      "Risk register",
    ];
    expect(
      headings,
      `docs/specs/AGE-72-deploy-app-worker.md H2 sections must equal ${expected.join(" → ")}; got ${headings.join(" → ")}`,
    ).toEqual(expected);
  });
});
