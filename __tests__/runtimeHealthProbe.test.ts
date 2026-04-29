import { describe, expect, it } from "vitest";
import { demoData } from "../src/domain/demoData";
import { buildRuntimeHealthProbe } from "../src/server/runtimeHealthProbe";

describe("runtime health probe", () => {
  it("reports available with seeded event count when the worker resolves", async () => {
    const probe = buildRuntimeHealthProbe({ data: demoData });
    const result = await probe();

    expect(result.available).toBe(true);
    expect(result.detail).toMatch(/simulated worker \u00b7 \d+ events?/);
  });

  it("reports unavailable when the fetcher returns null", async () => {
    const probe = buildRuntimeHealthProbe({ data: demoData, fetcher: async () => null });
    const result = await probe();

    expect(result.available).toBe(false);
    expect(result.detail).toBe("no preview available");
  });

  it("captures fetcher errors as the detail message", async () => {
    const probe = buildRuntimeHealthProbe({ data: demoData, fetcher: async () => { throw new Error("worker offline"); } });
    const result = await probe();

    expect(result.available).toBe(false);
    expect(result.detail).toBe("worker offline");
  });
});
