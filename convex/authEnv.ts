const LOCAL_AUTH_URL = "http://localhost:3000";
const PRODUCTION_APP_URL = "https://app.codecolony.online";

const PLACEHOLDER_SECRETS = new Set([
  "",
  "change-me",
  "changeme",
  "secret",
  "better-auth-secret",
  "dev-secret",
]);

export type AuthRuntimeConfig = {
  baseURL: string;
  trustedOrigins: string[];
  hasExplicitSecret: boolean;
};

export type AuthEmailConfig = {
  from: string;
  replyTo?: string;
  hasProvider: boolean;
};

function env(name: string): string | undefined {
  return process.env[name]?.trim() || undefined;
}

function isProduction(): boolean {
  return env("NODE_ENV") === "production" || env("CONVEX_DEPLOYMENT")?.startsWith("prod:") === true;
}

function validateURL(value: string, label: string, requireHttps: boolean): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} must be an absolute URL`);
  }
  if (requireHttps && url.protocol !== "https:") {
    throw new Error(`${label} must use https in production`);
  }
  return url.origin;
}


export function getAuthBaseURL(): string {
  const configured = env("BETTER_AUTH_URL") ?? env("SITE_URL");
  if (configured) return validateURL(configured, "BETTER_AUTH_URL or SITE_URL", isProduction());
  if (isProduction()) {
    throw new Error("Production auth requires BETTER_AUTH_URL or SITE_URL set to the public app origin");
  }
  return LOCAL_AUTH_URL;
}

export function getTrustedOrigins(baseURL = getAuthBaseURL()): string[] {
  const configured = env("BETTER_AUTH_TRUSTED_ORIGINS")
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];

  return Array.from(new Set([baseURL, PRODUCTION_APP_URL, LOCAL_AUTH_URL, ...configured.map((origin) => validateURL(origin, "BETTER_AUTH_TRUSTED_ORIGINS", isProduction()))]));
}

export function validateBetterAuthSecret(): string | undefined {
  const secret = env("BETTER_AUTH_SECRET") ?? env("AUTH_SECRET");
  if (!isProduction()) return secret;

  if (!secret || PLACEHOLDER_SECRETS.has(secret.toLowerCase()) || secret.length < 32) {
    throw new Error("Production auth requires BETTER_AUTH_SECRET or AUTH_SECRET with at least 32 characters");
  }

  return secret;
}

export function getAuthEmailConfig(): AuthEmailConfig {
  const from = env("AUTH_EMAIL_FROM") ?? env("RESEND_FROM_EMAIL");
  const replyTo = env("AUTH_EMAIL_REPLY_TO") ?? env("SUPPORT_EMAIL");
  const hasProvider = Boolean(env("RESEND_API_KEY"));

  if (isProduction()) {
    if (!hasProvider) {
      throw new Error("Production auth email requires RESEND_API_KEY");
    }
    if (!from) {
      throw new Error("Production auth email requires AUTH_EMAIL_FROM or RESEND_FROM_EMAIL");
    }
  }

  return {
    from: from ?? "Code Colony <onboarding@resend.dev>",
    ...(replyTo ? { replyTo } : {}),
    hasProvider,
  };
}

export function getAuthRuntimeConfig(): AuthRuntimeConfig {
  const baseURL = getAuthBaseURL();
  return {
    baseURL,
    trustedOrigins: getTrustedOrigins(baseURL),
    hasExplicitSecret: Boolean(validateBetterAuthSecret()),
  };
}
