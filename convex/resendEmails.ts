import { Resend } from "@convex-dev/resend";
import { components } from "./_generated/api";

/**
 * Resend email delivery. Configure with:
 *   npx convex env set RESEND_API_KEY <key>
 *   npx convex env set RESEND_WEBHOOK_SECRET <secret>
 *
 * Defaults to testMode: true (only @resend.dev addresses) until explicitly
 * disabled in the constructor options.
 *
 * TODO(AGE-63): disable testMode and wire onEmailEvent handler for production.
 */
export const resendEmails = process.env.RESEND_API_KEY
  ? new Resend(components.resend, {
      apiKey: process.env.RESEND_API_KEY,
      testMode: true,
    })
  : null;
