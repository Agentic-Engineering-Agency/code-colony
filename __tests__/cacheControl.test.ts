import { describe, expect, it } from "vitest";
import { buildCacheControl } from "../src/server/cacheControl";

describe("cache control header builder", () => {
  it("returns no-store for negative or non-finite max-age", () => {
    expect(buildCacheControl(-1)).toBe("no-store");
    expect(buildCacheControl(Number.NaN)).toBe("no-store");
    expect(buildCacheControl(Number.POSITIVE_INFINITY)).toBe("no-store");
  });

  it("returns must-revalidate for zero max-age", () => {
    expect(buildCacheControl(0)).toBe("private, max-age=0, must-revalidate");
    expect(buildCacheControl(0, "public")).toBe("public, max-age=0, must-revalidate");
  });

  it("returns private max-age for typical positive values", () => {
    expect(buildCacheControl(5)).toBe("private, max-age=5");
    expect(buildCacheControl(3)).toBe("private, max-age=3");
  });

  it("includes s-maxage when scope is public", () => {
    expect(buildCacheControl(60, "public")).toBe("public, max-age=60, s-maxage=60");
  });
});
