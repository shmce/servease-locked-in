# APICenter Payment Reconciliation Runbook

## Purpose

ServEase reconciles APICenter payment checkout status through the API Gateway and payment-service. Checkout status polling is the supported baseline and does not require an APICenter webhook secret. Webhooks are optional acceleration when APICenter can provide a shared secret and timestamped delivery.

## Webhookless Polling Mode

Use this mode when APICenter does not provide `APICENTER_WEBHOOK_SECRET`.

1. The mobile app creates a checkout through `POST /v1/payments/checkout-sessions`.
2. Payment-service stores the local pending payment and APICenter checkout ID.
3. The mobile app opens the APICenter checkout redirect URL.
4. When the app receives `servease://payment/success`, receives `servease://payment/cancel`, or becomes active again, it calls `GET /v1/payments/checkout-sessions/:checkoutId/status`.
5. Payment-service fetches the current APICenter checkout status and reconciles the local payment row.
6. If APICenter still returns `created` or `pending`, the mobile app retries status checks with bounded backoff.
7. The payment remains pending until APICenter reports a terminal status. Providers still cannot complete online-payment bookings until the local payment is `paid`.

No webhook registration is needed for this process. Keep `APICENTER_WEBHOOK_SECRET` unset unless APICenter has explicitly given you a shared secret.

## Runtime Contract

This contract applies only when webhook delivery is available.

Public endpoint:

```text
POST /v1/payments/webhooks/apicenter
```

Required headers:

```text
content-type: application/json
x-apicenter-webhook-secret: <APICENTER_WEBHOOK_SECRET>
x-apicenter-webhook-timestamp: <unix epoch milliseconds>
```

The timestamp must be within five minutes of gateway server time. This is the replay window used by the gateway before it forwards the event to payment-service.

Required body fields:

```json
{
  "checkoutId": "checkout_123",
  "provider": "paymongo",
  "providerMode": "test",
  "status": "paid",
  "referenceId": "booking-uuid",
  "redirectUrl": "https://checkout.example/session",
  "amount": {
    "value": 120000,
    "currency": "PHP"
  },
  "currency": "PHP",
  "paymentMethodsAllowed": ["gcash"],
  "metadata": {
    "bookingId": "booking-uuid"
  }
}
```

Accepted statuses are `created`, `pending`, `paid`, `failed`, `cancelled`, `expired`, `refunded`, and `partially_refunded`.

## Local Mock Verification

From `backend/`:

```sh
npm run smoke:apicenter-webhook
```

This smoke test does not call APICenter. It:

- seeds a synthetic checkout reconciliation row through `servease_record_apicenter_checkout`
- starts payment-service and api-gateway on isolated smoke ports
- verifies a bad secret returns `401 invalid_auth_token`
- verifies a stale timestamp returns `400 invalid_payment_request`
- posts a fake `paid` webhook
- verifies the local payment status reconciles to `paid`
- removes the synthetic payment row through existing smoke cleanup

Optional port overrides:

```sh
APICENTER_WEBHOOK_SMOKE_GATEWAY_PORT=5501 \
APICENTER_WEBHOOK_SMOKE_PAYMENT_PORT=8607 \
npm run smoke:apicenter-webhook
```

## Optional Webhook Deployment Setup

If APICenter provides a shared secret, set this secret in the backend runtime:

```text
APICENTER_WEBHOOK_SECRET=<strong random shared secret>
```

Do not commit the value. The same value must be configured on the APICenter webhook registration.

Register the webhook target with APICenter:

```text
https://<api-domain>/v1/payments/webhooks/apicenter
```

Configure APICenter to send both required headers. If APICenter cannot send `x-apicenter-webhook-timestamp`, pause registration and update the gateway contract deliberately rather than weakening it ad hoc.

## Live Checkout Acceptance

Without webhook registration:

1. Create a ServEase booking as a customer.
2. Start an APICenter checkout from the mobile payment screen.
3. Complete the checkout in the provider checkout page.
4. Return to the app through the deep link or manually reopen the app.
5. Confirm `GET /v1/payments/checkout-sessions/:checkoutId/status` returns `localPaymentStatus: "paid"`.
6. Confirm the customer payment list shows the related payment as `paid`.

With webhook registration, also confirm webhook delivery returns HTTP 200.

## Rollback

If webhook delivery causes incorrect reconciliation:

1. Remove or rotate `APICENTER_WEBHOOK_SECRET` so the gateway rejects webhook traffic.
2. Keep app polling enabled; checkout status polling still reconciles through payment-service.
3. Inspect payment-service logs and the row in `payment.apicenter_checkout_sessions`.
4. Re-run `npm run smoke:apicenter-webhook` after the fix before re-enabling APICenter delivery.

## Troubleshooting

- `401 invalid_auth_token`: shared secret header is missing or mismatched.
- `400 invalid_payment_request`: timestamp is missing/stale, status is unsupported, IDs are blank, provider is unsupported, redirect URL is invalid, or amount is malformed.
- `404 payment_not_found`: APICenter sent a checkout ID that payment-service has not recorded from checkout creation.
- `503 payment_dependency_unavailable`: backend secret is not configured, payment-service is unavailable, or the payment-owned RPC failed.
