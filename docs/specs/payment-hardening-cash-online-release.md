# Payment hardening: cash, online checkout, and provider release

## Scope

ServEase supports two customer payment paths:

- Cash on service: the customer pays the provider when the job is completed.
- Online checkout: the customer pays through APICenter before completion.

Provider earnings are released by an admin through the payment service payout workflow. The gateway must not write payment database state directly.

APICenter/PayMongo payment acceptance MDR is treated as a platform cost covered by ServEase commission. Provider earnings stay consistent across customer payment methods; provider deductions are applied only when money is paid out through a provider payout rail.

## Contracts

### Cash on service

- Booking creation may include `paymentMethod: "cash_on_service"`.
- The gateway creates or updates a local pending payment record for cash bookings after the booking is created.
- When a provider marks a cash booking `completed`, the gateway asks the payment service to confirm the matching cash payment as `paid`.
- Cash confirmation is idempotent. A payment already marked `paid` keeps its original `paidAt`.
- Cash confirmation rejects non-cash, cancelled, or refunded payments.

### Online checkout

- Online payments are created through `POST /v1/payments/checkout-sessions`.
- APICenter checkout creation stores a local payment and checkout reference.
- APICenter status polling reconciles the local payment to `paid`, `cancelled`, or `refunded`; webhooks are optional when APICenter provides a shared secret.
- A provider cannot complete an online-payment booking until the matching local payment is `paid`.

### Admin provider release

- `POST /v1/admin/payments/:paymentId/release` releases a paid payment to the provider payout workflow.
- The admin release uses the provider default payout method and creates a provider payout in `processing`.
- The payout processing fee is calculated by payout method. Current `bank`, `gcash`, and `paymaya` rails deduct `min(providerPayout, PHP 10)`.
- Release is idempotent per payment; repeating the request returns the existing payout.
- Release rejects unpaid, cancelled, refunded, or malformed payments and payments without a provider payout method.
- Payout settlement/reconciliation remains the final proof of actual money movement.

## Acceptance Criteria

- Cash bookings have a local pending payment without requiring a separate reserve-payment action.
- Completing a cash booking marks the matching cash payment paid.
- Completing an online booking with a pending/failed/missing payment is rejected.
- Admin release creates one payout for one paid payment and does not duplicate on retry.
- Admin release and provider-requested payouts use the same payout method fee rule and never create negative `netAmount`.
- Admin release, settlement approval, and reconciliation remain available only through admin-authenticated gateway routes.
