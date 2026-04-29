import { describe, expect, it } from "vitest";
import { jsonRouteResponse } from "../src/server/routeResponse";

describe("jsonRouteResponse", () => {
  it("returns a Response carrying the supplied status, JSON body, and a private max-age Cache-Control", async () => {
    const response = jsonRouteResponse({ ok: true, n: 42 }, { status: 200, cacheSeconds: 5 });

    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("private, max-age=5");
    expect(response.headers.get("Content-Type")).toMatch(/^application\/json/);
    await expect(response.json()).resolves.toEqual({ ok: true, n: 42 });
  });

  it("emits no-store when cacheSeconds is negative", () => {
    const response = jsonRouteResponse({}, { status: 200, cacheSeconds: -1 });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("propagates non-200 statuses without altering the cache header contract", async () => {
    const response = jsonRouteResponse({ error: "no preview available" }, { status: 404, cacheSeconds: -1 });
    expect(response.status).toBe(404);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({ error: "no preview available" });
  });

  it("uses must-revalidate when cacheSeconds is 0", () => {
    const response = jsonRouteResponse({}, { status: 200, cacheSeconds: 0 });
    expect(response.headers.get("Cache-Control")).toBe("private, max-age=0, must-revalidate");
  });
});
