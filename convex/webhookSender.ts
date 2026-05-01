import { WebhookSender } from "convex-webhook-sender";
import { components } from "./_generated/api";

/**
 * Managed outbound webhook delivery with HMAC signing, retries, and
 * delivery tracking.
 */
export const webhookSender = new WebhookSender(components.webhookSender);
