import { capturePaymentLifecycle, type PostHogClient } from "../observability/posthog";

export type PaymentEvent = {
  provider: "dodo";
  eventId: string;
  eventType: string;
  customerId?: string;
  checkoutId?: string;
  subscriptionId?: string;
  invoiceId?: string;
  amountUsd?: number;
};

export type PaymentProcessingResult =
  | { status: "processed"; idempotencyKey: string }
  | { status: "duplicate"; idempotencyKey: string };

export function buildPaymentIdempotencyKey(event: PaymentEvent): string {
  return [event.provider, event.eventType, event.eventId].map((part) => part.trim()).join(":");
}

export async function processPaymentEventOnce(params: {
  event: PaymentEvent;
  hasProcessed: (idempotencyKey: string) => Promise<boolean> | boolean;
  markProcessed: (idempotencyKey: string) => Promise<void> | void;
  onProcess: (event: PaymentEvent) => Promise<void> | void;
  telemetry?: PostHogClient;
}): Promise<PaymentProcessingResult> {
  const idempotencyKey = buildPaymentIdempotencyKey(params.event);
  if (await params.hasProcessed(idempotencyKey)) {
    await capturePaymentLifecycle(
      {
        provider: params.event.provider,
        event_type: params.event.eventType,
        idempotency_key: idempotencyKey,
        duplicate: true,
      },
      params.telemetry,
    );
    return { status: "duplicate", idempotencyKey };
  }

  await params.onProcess(params.event);
  await params.markProcessed(idempotencyKey);
  await capturePaymentLifecycle(
    {
      provider: params.event.provider,
      event_type: params.event.eventType,
      idempotency_key: idempotencyKey,
      customer_id: params.event.customerId,
      checkout_id: params.event.checkoutId,
      subscription_id: params.event.subscriptionId,
      invoice_id: params.event.invoiceId,
      amount_usd: params.event.amountUsd,
      duplicate: false,
    },
    params.telemetry,
  );
  return { status: "processed", idempotencyKey };
}
