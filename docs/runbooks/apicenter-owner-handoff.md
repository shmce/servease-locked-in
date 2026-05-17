# APICenter Owner Handoff

Copy this message to the APICenter owner when they are available.

```text
Hey, ServEase is ready to receive APICenter payment checkout webhooks. Can you register or confirm the webhook contract below?

Webhook URL
https://<servease-api-domain>/v1/payments/webhooks/apicenter

Method
POST

Required headers
content-type: application/json
x-apicenter-webhook-secret: <shared secret we configure in APICENTER_WEBHOOK_SECRET>
x-apicenter-webhook-timestamp: <unix epoch milliseconds>

The timestamp needs to be within 5 minutes of gateway server time. The gateway rejects stale or missing timestamps before forwarding to payment-service.

Expected payload shape
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

Accepted statuses on our side
created, pending, paid, failed, cancelled, expired, refunded, partially_refunded

Can you confirm:
1. Can APICenter send x-apicenter-webhook-timestamp as epoch milliseconds?
2. Are the emitted checkout statuses exactly the accepted values above, or do we need a mapping?
3. Does APICenter use provider "paymongo" for these checkout sessions?
4. Will referenceId be the ServEase booking ID we pass during checkout creation?
5. What source IPs, if any, should we allowlist at the infrastructure layer?

Local verification already completed on our side:
- npm run smoke:apicenter
- npm run smoke:apicenter-webhook

The mock webhook smoke verifies bad secret rejection, stale timestamp rejection, and successful local reconciliation to paid without creating a real APICenter checkout.
```

Internal reference: [APICenter Payment Webhook Runbook](apicenter-payment-webhook.md).
