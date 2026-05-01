import { describe, it, expect, vi } from "vitest";
import {
  buildRunCommandTool,
  isAllowed,
  rejectionReason,
  DEFAULT_ALLOWED_COMMANDS,
} from "../mastra/tools/runCommand";
import {
  SandboxClient,
  SandboxError,
  type ExecResponse,
} from "../mastra/sandboxClient";

function fakeSandbox(execImpl: (req: { command: string }) => ExecResponse) {
  const calls: Array<{ command: string }> = [];
  const fetchImpl: typeof fetch = vi.fn(async (input, init) => {
    const body = JSON.parse(String((init as RequestInit).body));
    calls.push(body);
    return new Response(JSON.stringify(execImpl(body)), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as unknown as typeof fetch;
  const sandbox = new SandboxClient({
    baseUrl: "https://sandbox.example",
    hmacSecret: "test-secret",
    fetchImpl,
    now: () => 1700000000000,
  });
  return { sandbox, calls, fetchImpl };
}

async function runTool(
  tool: ReturnType<typeof buildRunCommandTool>,
  input: { command: string; sandboxId?: string },
) {
  // Mastra's createTool returns a Tool object whose `execute` receives the
  // validated input data as its first argument.
  const exec = tool.execute as unknown as (
    input: { command: string; sandboxId?: string },
  ) => Promise<{
    allowed: boolean;
    command: string;
    exitCode?: number;
    stdout?: string;
    stderr?: string;
    reason?: string;
  }>;
  return exec(input);
}

describe("rejectionReason / isAllowed", () => {
  it("matches verbatim prefixes", () => {
    expect(isAllowed("git status", DEFAULT_ALLOWED_COMMANDS)).toBe(true);
    expect(isAllowed("git status -sb", DEFAULT_ALLOWED_COMMANDS)).toBe(true);
    expect(isAllowed("git push", DEFAULT_ALLOWED_COMMANDS)).toBe(false);
  });

  it("requires whole-token boundaries", () => {
    expect(isAllowed("npm install", DEFAULT_ALLOWED_COMMANDS)).toBe(false);
    expect(isAllowed("npm ls", DEFAULT_ALLOWED_COMMANDS)).toBe(true);
    expect(isAllowed("npm lsmalicious", DEFAULT_ALLOWED_COMMANDS)).toBe(false);
  });

  it("respects custom allow-list", () => {
    expect(isAllowed("echo hi", ["echo"])).toBe(true);
    expect(isAllowed("echo hi", [])).toBe(false);
  });

  describe("rejects shell metacharacter injection (BLOCKER regression net)", () => {
    const cases: Array<[string, string]> = [
      ["semicolon", "git status ; rm -rf /"],
      ["andand", "git status && curl evil"],
      ["oror", "git status || curl evil"],
      ["pipe", "grep x . | cat /etc/shadow"],
      ["redirect-out", "ls > /etc/passwd"],
      ["redirect-in", "cat < /etc/passwd"],
      ["backtick", "git status `whoami`"],
      ["dollar-paren", "git status $(whoami)"],
      ["newline", "git status\n; evil"],
      ["carriage-return", "git status\r; evil"],
      ["tab", "git status\t; evil"],
      ["backslash", "git status \\; evil"],
      ["paren", "git status ( evil )"],
    ];
    for (const [name, command] of cases) {
      it(`rejects ${name}`, () => {
        expect(isAllowed(command, DEFAULT_ALLOWED_COMMANDS)).toBe(false);
        const reason = rejectionReason(command, DEFAULT_ALLOWED_COMMANDS);
        expect(reason).toMatch(/forbidden shell character/);
      });
    }
  });

  it("rejects git --output (=PATH and space-PATH bypass)", () => {
    for (const cmd of [
      "git diff --output=/tmp/pwn",
      "git diff --output /tmp/pwn",
    ]) {
      expect(isAllowed(cmd, DEFAULT_ALLOWED_COMMANDS)).toBe(false);
      const reason = rejectionReason(cmd, DEFAULT_ALLOWED_COMMANDS);
      expect(reason).toMatch(/--output is not allowed/);
    }
  });

  it("rejects rg --pre (=CMD and space-CMD subprocess bypass)", () => {
    for (const cmd of [
      "rg hello --pre=touch .",
      "rg hello --pre touch",
    ]) {
      expect(isAllowed(cmd, DEFAULT_ALLOWED_COMMANDS)).toBe(false);
      const reason = rejectionReason(cmd, DEFAULT_ALLOWED_COMMANDS);
      expect(reason).toMatch(/--pre is not allowed/);
    }
  });

  it("does NOT include node --version in the default allow-list (--eval bypass)", () => {
    expect(DEFAULT_ALLOWED_COMMANDS).not.toContain("node --version");
    expect(
      isAllowed(
        "node --version --eval require('fs').writeFileSync('/tmp/x','')",
        DEFAULT_ALLOWED_COMMANDS,
      ),
    ).toBe(false);
  });
});

describe("runCommand tool", () => {
  it("rejects allow-list misses without calling the sandbox and logs the denial", async () => {
    const { sandbox, calls } = fakeSandbox(() => {
      throw new Error("should not be called");
    });
    const denials: Array<{ command: string; reason: string }> = [];
    const tool = buildRunCommandTool({
      sandbox,
      onDeny: (e) => denials.push(e),
    });
    const result = await runTool(tool, { command: "rm -rf /" });
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/not in allow-list|forbidden shell character/);
    expect(calls).toHaveLength(0);
    expect(denials).toHaveLength(1);
    expect(denials[0]?.command).toBe("rm -rf /");
  });

  it("rejects shell-injection attempts WITHOUT calling the sandbox", async () => {
    const { sandbox, calls } = fakeSandbox(() => {
      throw new Error("should not be called");
    });
    const tool = buildRunCommandTool({ sandbox, onDeny: () => {} });
    const result = await runTool(tool, {
      command: "git status ; rm -rf /",
    });
    expect(result.allowed).toBe(false);
    expect(calls).toHaveLength(0);
  });

  it("forwards an allowed command and surfaces stdout / exitCode", async () => {
    const { sandbox, calls } = fakeSandbox((req) => ({
      ok: true,
      command: req.command,
      sandboxId: "agent-shell",
      exitCode: 0,
      stdout: "hello\n",
      stderr: "",
      durationMs: 12,
    }));
    const tool = buildRunCommandTool({ sandbox });
    const result = await runTool(tool, { command: "git status -sb" });
    expect(result.allowed).toBe(true);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe("hello\n");
    expect(calls).toEqual([{ command: "git status -sb" }]);
  });

  it("propagates a custom sandboxId", async () => {
    const { sandbox, calls } = fakeSandbox((req) => ({
      ok: true,
      command: req.command,
      sandboxId: "isolated",
      exitCode: 0,
      stdout: "",
      stderr: "",
      durationMs: 3,
    }));
    const tool = buildRunCommandTool({ sandbox });
    await runTool(tool, { command: "ls", sandboxId: "isolated" });
    expect(calls[0]).toEqual({ command: "ls", sandboxId: "isolated" });
  });

  it("uses an injected allow-list", async () => {
    const { sandbox } = fakeSandbox(() => ({
      ok: true,
      command: "echo hi",
      sandboxId: "agent-shell",
      exitCode: 0,
      stdout: "hi\n",
      stderr: "",
      durationMs: 1,
    }));
    const tool = buildRunCommandTool({ sandbox, allowList: ["echo"] });
    const allowed = await runTool(tool, { command: "echo hi" });
    expect(allowed.allowed).toBe(true);
    const blocked = await runTool(tool, { command: "git status" });
    expect(blocked.allowed).toBe(false);
  });

  it("signs requests with the configured HMAC secret", async () => {
    let observed: { ts?: string; sig?: string } = {};
    const fetchImpl: typeof fetch = vi.fn(async (_input, init) => {
      const headers = new Headers(init?.headers);
      observed = {
        ts: headers.get("x-sandbox-ts") ?? undefined,
        sig: headers.get("x-sandbox-sig") ?? undefined,
      };
      return new Response(
        JSON.stringify({
          ok: true,
          command: "ls",
          sandboxId: "agent-shell",
          exitCode: 0,
          stdout: "",
          stderr: "",
          durationMs: 1,
        }),
        { status: 200 },
      );
    }) as unknown as typeof fetch;
    const sandbox = new SandboxClient({
      baseUrl: "https://sandbox.example",
      hmacSecret: "secret",
      fetchImpl,
      now: () => 1700000000000,
    });
    const tool = buildRunCommandTool({ sandbox });
    await runTool(tool, { command: "ls" });
    expect(observed.ts).toBe("1700000000000");
    expect(observed.sig).toMatch(/^[0-9a-f]{64}$/);
  });

  it("returns a structured error when the sandbox responds non-2xx", async () => {
    const fetchImpl: typeof fetch = vi.fn(async () => {
      return new Response("auth failed", {
        status: 401,
        headers: { "content-type": "text/plain" },
      });
    }) as unknown as typeof fetch;
    const sandbox = new SandboxClient({
      baseUrl: "https://sandbox.example",
      hmacSecret: "secret",
      fetchImpl,
      now: () => 1700000000000,
    });
    const tool = buildRunCommandTool({ sandbox });
    const result = await runTool(tool, { command: "ls" });
    expect(result.allowed).toBe(true);
    expect(result.reason).toMatch(/sandbox exec failed/);
    expect(result.stderr).toMatch(/401/);
  });

  it("SandboxError carries status, path, and bodyExcerpt", async () => {
    const fetchImpl: typeof fetch = vi.fn(async () => {
      return new Response("rate limit", { status: 429 });
    }) as unknown as typeof fetch;
    const sandbox = new SandboxClient({
      baseUrl: "https://sandbox.example",
      hmacSecret: "secret",
      fetchImpl,
      now: () => 1700000000000,
    });
    await expect(sandbox.exec({ command: "ls" })).rejects.toMatchObject({
      name: "SandboxError",
      status: 429,
      path: "/exec",
    } satisfies Partial<SandboxError>);
  });

  it("strips trailing slash from baseUrl to avoid double-slash paths", async () => {
    let requestedUrl = "";
    const fetchImpl: typeof fetch = vi.fn(async (input) => {
      requestedUrl = String(input);
      return new Response(JSON.stringify({ ok: true, command: "ls", sandboxId: "x", exitCode: 0, stdout: "", stderr: "", durationMs: 1 }), { status: 200 });
    }) as unknown as typeof fetch;
    const sandbox = new SandboxClient({
      baseUrl: "https://sandbox.example/",
      hmacSecret: "secret",
      fetchImpl,
      now: () => 1700000000000,
    });
    await sandbox.exec({ command: "ls" });
    expect(requestedUrl).toBe("https://sandbox.example/exec");
  });
});
