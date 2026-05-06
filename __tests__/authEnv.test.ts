import { afterEach, describe, expect, it } from "vitest";
import { getAuthEmailConfig, getAuthRuntimeConfig, validateBetterAuthSecret } from "../convex/authEnv";

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

  it("allows development auth without an email provider", () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.AUTH_EMAIL_FROM;
    (process.env as Record<string, string | undefined>).NODE_ENV = "development";

    expect(getAuthEmailConfig()).toMatchObject({
      from: "Code Colony <onboarding@resend.dev>",
      hasProvider: false,
    });
  });

  it("fails loudly when production lacks email provider configuration", () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    delete process.env.RESEND_API_KEY;
    process.env.AUTH_EMAIL_FROM = "Code Colony <auth@codecolony.online>";

    expect(() => getAuthEmailConfig()).toThrow(/RESEND_API_KEY/);
  });

  it("fails loudly when production lacks an auth email sender", () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    process.env.RESEND_API_KEY = "re_test_key";
    delete process.env.AUTH_EMAIL_FROM;
    delete process.env.RESEND_FROM_EMAIL;

    expect(() => getAuthEmailConfig()).toThrow(/AUTH_EMAIL_FROM/);
  });
});
