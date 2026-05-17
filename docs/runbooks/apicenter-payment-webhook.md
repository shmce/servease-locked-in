# APICenter Payment Webhook Runbook

## Purpose

ServEase receives APICenter payment checkout status updates through the API Gateway and reconciles them in payment-service. This runbook is for local verification, deployment setup, and the APICenter owner handoff.

## Runtime Contract

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

## Deployment Setup

Set this secret in the backend runtime:

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

After APICenter registration:

1. Create a ServEase booking as a customer.
2. Start an APICenter checkout from the mobile payment screen.
3. Complete the checkout in the provider checkout page.
4. Confirm webhook delivery returns HTTP 200.
5. Confirm `GET /v1/payments/checkout-sessions/:checkoutId/status` returns `localPaymentStatus: "paid"`.
6. Confirm the customer payment list shows the related payment as `paid`.

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
