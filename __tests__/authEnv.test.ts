import { afterEach, describe, expect, it } from "vitest";
import { getAuthRuntimeConfig, validateBetterAuthSecret } from "../convex/authEnv";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("auth runtime environment", () => {
  it("keeps localhost as the development fallback", () => {
    delete process.env.BETTER_AUTH_URL;
    delete process.env.SITE_URL;
    (process.env as Record<string, string | undefined>).NODE_ENV = "development";

    expect(getAuthRuntimeConfig()).toMatchObject({
      baseURL: "http://localhost:3000",
      hasExplicitSecret: false,
    });
  });

  it("prefers BETTER_AUTH_URL and deduplicates trusted origins", () => {
    process.env.BETTER_AUTH_URL = "https://auth.codecolony.online";
    process.env.SITE_URL = "https://ignored.example";
    process.env.BETTER_AUTH_TRUSTED_ORIGINS = "https://app.codecolony.online, https://custom.example, https://custom.example";

    expect(getAuthRuntimeConfig()).toMatchObject({
      baseURL: "https://auth.codecolony.online",
      trustedOrigins: [
        "https://auth.codecolony.online",
        "https://app.codecolony.online",
        "http://localhost:3000",
        "https://custom.example",
      ],
    });
  });

  it("fails loudly when production lacks an explicit auth URL", () => {
    delete process.env.BETTER_AUTH_URL;
    delete process.env.SITE_URL;
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    process.env.BETTER_AUTH_SECRET = "12345678901234567890123456789012";

    expect(() => getAuthRuntimeConfig()).toThrow(/Production auth requires BETTER_AUTH_URL/);
  });

  it("fails loudly on short production secrets", () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    process.env.BETTER_AUTH_SECRET = "short";

    expect(() => validateBetterAuthSecret()).toThrow(/Production auth requires BETTER_AUTH_SECRET/);
  });
});
