type FetchLike = typeof fetch;

export type PostHogEventName =
  | "repo_onboarding_started"
  | "repo_onboarding_completed"
  | "agent_lifecycle_event"
  | "workflow_event"
  | "workpool_event"
  | "ai_observation"
  | "payment_lifecycle_event"
  | "webhook_failure"
  | "automation_audit_event";

export type PostHogCapture = {
  event: PostHogEventName;
  distinctId?: string;
  properties?: Record<string, unknown>;
};

export type PostHogClient = {
  capture(input: PostHogCapture): Promise<{ ok: boolean; skipped?: true; reason?: string }>;
};

export type PostHogClientOptions = {
  apiKey?: string;
  host?: string;
  enabled?: boolean;
  fetchImpl?: FetchLike;
  now?: () => string;
};

const DEFAULT_HOST = "https://us.i.posthog.com";
const MAX_STRING_LENGTH = 240;
const SECRET_KEY_PATTERN = /(secret|api_?key|password|authorization|cookie|signature|payload|prompt|document|content|diff|private|credit|card|payment_method|access.?token|refresh.?token|session.?token|bearer)/i;

function env(name: string): string | undefined {
  return process.env[name]?.trim() || undefined;
}

function truncate(value: string): string {
  return value.length > MAX_STRING_LENGTH ? `${value.slice(0, MAX_STRING_LENGTH)}...` : value;
}

function sanitizeValue(key: string, value: unknown): unknown {
  if (SECRET_KEY_PATTERN.test(key)) return "[redacted]";
  if (typeof value === "string") return truncate(value);
  if (typeof value === "number" || typeof value === "boolean" || value === null) return value;
  if (Array.isArray(value)) return value.slice(0, 20).map((entry, index) => sanitizeValue(`${key}.${index}`, entry));
  if (typeof value === "object" && value) {
    return sanitizeProperties(value as Record<string, unknown>);
  }
  return undefined;
}

export function sanitizeProperties(properties: Record<string, unknown> = {}): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(properties)) {
    const clean = sanitizeValue(key, value);
    if (clean !== undefined) sanitized[key] = clean;
  }
  return sanitized;
}

export function createPostHogClient(options: PostHogClientOptions = {}): PostHogClient {
  const apiKey = options.apiKey ?? env("POSTHOG_API_KEY") ?? env("NEXT_PUBLIC_POSTHOG_KEY");
  const enabled = options.enabled ?? env("POSTHOG_DISABLED") !== "1";
  const host = (options.host ?? env("POSTHOG_HOST") ?? env("NEXT_PUBLIC_POSTHOG_HOST") ?? DEFAULT_HOST).replace(/\/+$/, "");
  const fetchImpl = options.fetchImpl ?? fetch;
  const now = options.now ?? (() => new Date().toISOString());

  return {
    async capture(input) {
      if (!enabled) return { ok: true, skipped: true, reason: "disabled" };
      if (!apiKey) return { ok: true, skipped: true, reason: "missing_api_key" };

      const body = {
        api_key: apiKey,
        event: input.event,
        distinct_id: input.distinctId ?? "anonymous",
        properties: {
          ...sanitizeProperties(input.properties),
          observed_at: now(),
          telemetry_source: "code-colony",
        },
      };

      try {
        const response = await fetchImpl(`${host}/capture/`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        });

        return response.ok
          ? { ok: true }
          : { ok: false, reason: `posthog_capture_failed:${response.status}` };
      } catch (error) {
        const reason = error instanceof Error && error.message
          ? error.message
          : "unknown_error";
        return { ok: false, reason: `posthog_capture_error:${reason}` };
      }
    },
  };
}

export const postHog = createPostHogClient();

export async function captureAutomationAudit(properties: Record<string, unknown>, client: PostHogClient = postHog) {
  return client.capture({ event: "automation_audit_event", properties });
}

export async function captureWebhookFailure(properties: Record<string, unknown>, client: PostHogClient = postHog) {
  return client.capture({ event: "webhook_failure", properties });
}

export async function capturePaymentLifecycle(properties: Record<string, unknown>, client: PostHogClient = postHog) {
  return client.capture({ event: "payment_lifecycle_event", properties });
}
