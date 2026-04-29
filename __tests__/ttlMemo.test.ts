import { describe, expect, it } from "vitest";
import { createTtlMemo } from "../src/server/ttlMemo";

describe("ttl memo", () => {
  it("returns the same value within the TTL without re-invoking the producer", async () => {
    let calls = 0;
    let clock = 1_000;
    const memo = createTtlMemo(async () => { calls += 1; return calls; }, { ttlMs: 5_000, now: () => clock });

    expect(await memo.get()).toBe(1);
    clock = 2_000;
    expect(await memo.get()).toBe(1);
    clock = 5_999;
    expect(await memo.get()).toBe(1);
    expect(calls).toBe(1);
  });

  it("re-runs the producer after the TTL expires", async () => {
    let calls = 0;
    let clock = 1_000;
    const memo = createTtlMemo(async () => { calls += 1; return calls; }, { ttlMs: 5_000, now: () => clock });

    expect(await memo.get()).toBe(1);
    clock = 6_001;
    expect(await memo.get()).toBe(2);
    expect(calls).toBe(2);
  });

  it("invalidate forces the next get to re-run the producer", async () => {
    let calls = 0;
    const memo = createTtlMemo(async () => { calls += 1; return calls; }, { ttlMs: 60_000, now: () => 1_000 });

    expect(await memo.get()).toBe(1);
    memo.invalidate();
    expect(await memo.get()).toBe(2);
  });

  it("does not cache rejected promises", async () => {
    let calls = 0;
    const memo = createTtlMemo(async () => {
      calls += 1;
      if (calls === 1) throw new Error("boom");
      return calls;
    }, { ttlMs: 60_000, now: () => 1_000 });

    await expect(memo.get()).rejects.toThrow("boom");
    expect(await memo.get()).toBe(2);
    expect(calls).toBe(2);
  });

  it("dedupes concurrent callers within a single producer call", async () => {
    let calls = 0;
    let release: (() => void) | null = null;
    const memo = createTtlMemo(async () => {
      calls += 1;
      await new Promise<void>((resolve) => { release = resolve; });
      return calls;
    }, { ttlMs: 60_000, now: () => 1_000 });

    const a = memo.get();
    const b = memo.get();
    expect(release).not.toBeNull();
    (release as (() => void) | null)?.();
    expect(await a).toBe(1);
    expect(await b).toBe(1);
    expect(calls).toBe(1);
  });
});
