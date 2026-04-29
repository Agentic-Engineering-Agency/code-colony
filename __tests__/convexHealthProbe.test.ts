import { describe, expect, it } from "vitest";
import { buildConvexHealthProbe } from "../src/server/convexHealthProbe";

const stubResponse = (body: unknown, ok = true, status = 200): Response => {
  return {
    ok,
    status,
    json: async () => body,
  } as unknown as Response;
};

describe("convex health probe", () => {
  it("reports unavailable when CONVEX_URL is missing", async () => {
    const probe = buildConvexHealthProbe({ convexUrl: undefined });
    const result = await probe();
    expect(result.available).toBe(false);
    expect(result.detail).toBe("NEXT_PUBLIC_CONVEX_URL not set");
  });

  it("reports available with backlog count when system:ping succeeds", async () => {
    const calls: string[] = [];
    const fetchImpl: typeof fetch = async (input, init) => {
      calls.push(typeof input === "string" ? input : (input as URL).toString());
      const body = JSON.parse((init as RequestInit).body as string) as { path: string };
      expect(body.path).toBe("system:ping");
      return stubResponse({ status: "success", value: { ok: true, now: 1, backlogCount: 3 } });
    };
    const probe = buildConvexHealthProbe({ convexUrl: "https://example.convex.cloud", fetchImpl });
    const result = await probe();

    expect(calls).toEqual(["https://example.convex.cloud/api/query"]);
    expect(result.available).toBe(true);
    expect(result.detail).toContain("3 backlog rows");
  });

  it("strips trailing slash from convexUrl", async () => {
    const calls: string[] = [];
    const fetchImpl: typeof fetch = async (input) => {
      calls.push(typeof input === "string" ? input : (input as URL).toString());
      return stubResponse({ status: "success", value: { ok: true, backlogCount: 0 } });
    };
    const probe = buildConvexHealthProbe({ convexUrl: "https://example.convex.cloud/", fetchImpl });
    await probe();
    expect(calls).toEqual(["https://example.convex.cloud/api/query"]);
  });

  it("reports unavailable when convex returns a non-success status", async () => {
    const fetchImpl: typeof fetch = async () =>
      stubResponse({ status: "error", errorMessage: "boom" });
    const probe = buildConvexHealthProbe({ convexUrl: "https://example.convex.cloud", fetchImpl });
    const result = await probe();
    expect(result.available).toBe(false);
    expect(result.detail).toContain("error");
  });

  it("reports unavailable when fetch throws", async () => {
    const fetchImpl: typeof fetch = async () => {
      throw new Error("ENOTFOUND");
    };
    const probe = buildConvexHealthProbe({ convexUrl: "https://example.convex.cloud", fetchImpl });
    const result = await probe();
    expect(result.available).toBe(false);
    expect(result.detail).toBe("ENOTFOUND");
  });
});
