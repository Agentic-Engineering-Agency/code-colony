import { describe, it, expect, vi } from "vitest";
import {
  buildRunCommandTool,
  isAllowed,
  DEFAULT_ALLOWED_COMMANDS,
} from "../mastra/tools/runCommand";
import {
  SandboxClient,
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
    reason?: string;
  }>;
  return exec(input);
}

describe("isAllowed", () => {
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
});

describe("runCommand tool", () => {
  it("rejects commands outside the allow-list without calling the sandbox", async () => {
    const { sandbox, calls } = fakeSandbox(() => {
      throw new Error("should not be called");
    });
    const tool = buildRunCommandTool({ sandbox });
    const result = await runTool(tool, { command: "rm -rf /" });
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("not in allow-list");
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
    const fetchImpl: typeof fetch = vi.fn(async (input, init) => {
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
});
