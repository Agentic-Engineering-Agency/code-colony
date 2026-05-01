import { DodoPayments } from "@dodopayments/convex";
import { components } from "./_generated/api";

/**
 * Dodo Payments billing integration. Configure with:
 *   npx convex env set DODO_PAYMENTS_API_KEY <key>
 *   npx convex env set DODO_PAYMENTS_ENVIRONMENT test_mode
 *   npx convex env set DODO_PAYMENTS_WEBHOOK_SECRET <secret>
 *
 * TODO(AGE-63): wire identify() to map auth users to Dodo customers.
 */
export const dodo = process.env.DODO_PAYMENTS_API_KEY
  ? new DodoPayments(components.dodopayments, {
      // eslint-disable-next-line @typescript-eslint/require-await
      identify: async () => null,
      apiKey: process.env.DODO_PAYMENTS_API_KEY,
      environment: (process.env.DODO_PAYMENTS_ENVIRONMENT ??
        "test_mode") as "test_mode" | "live_mode",
    })
  : null;

export const checkout = dodo?.api().checkout ?? null;
export const customerPortal = dodo?.api().customerPortal ?? null;
