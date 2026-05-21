# Payments Slice

## Status

- Owner: backend
- Owning service: Payment Service
- Owning schema: `payment`
- Implementation status: implemented

## Problem

Bookings need a server-owned payment record so customers, providers, and future admin workflows can track amount, method, platform fee, payout, and payment status.

## Goals

- Create or return a payment record for a booking visible to the authenticated caller.
- Create and validate fair-price quote snapshots before booking creation.
- List visible payments for customers and providers.
- Keep payment persistence inside the Payment Service and `payment` schema.
- Calculate platform fee and provider payout from the configured commission rate.
- Support cash-on-service records that are paid when the provider completes the service.
- Support APICenter checkout sessions for online payment methods.
- Prevent online-payment bookings from being completed until payment is `paid`.
- Deduct provider payout processing fees consistently by payout method.
- Present cards and wallets in the customer UI as checkout choices, not saved instruments, because APICenter collects those details at payment time.

## Non-Goals

- Direct card/wallet integrations outside APICenter.
- Automatic provider payout execution after admin release.
- Refund processing beyond persisted status support.
- New webhook provider integrations beyond the existing API Center checkout webhook.

## Data Ownership

- Payment Service owns the `payment` schema.
- Booking Service remains the source of truth for booking visibility and amount.
- Catalog Service resolves provider profiles.
- API Gateway authenticates and coordinates HTTP service calls only.

## Gateway Routes

### `POST /v1/pricing/quotes`

- Public route: `POST /v1/pricing/quotes`
- Internal route: `POST /internal/pricing/quotes`
- Auth: required

Creates a server-owned quote snapshot for a provider/service/address/schedule. The quote returns `quoteId`, `estimatedTotal`, `fairRangeMin`, `fairRangeMax`, `fairnessStatus`, `confidence`, line items, fuel/travel signals, and an explanation.

### Quote Validation

- Internal route: `GET /internal/pricing/quotes/:quoteId/validation`
- Caller: API Gateway booking workflow.

Validates quote ownership, provider, service, amount, pricing mode, fairness status, confidence, and expiry before `POST /v1/bookings` persists an accepted quote.

### Provider Pricing Guidance

- Public route: `POST /v1/provider/pricing/guidance`
- Internal route: `POST /internal/pricing/quotes`
- Auth: provider required

Returns the same fair range, confidence, and explanation for a proposed provider service price before the provider saves that rate.

### `GET /v1/payments`

- Public route: `GET /v1/payments`
- Internal route: `GET /internal/payments`
- Auth: required

Lists payment records visible to the authenticated customer or provider.

Visible payment records include the latest APICenter checkout metadata exposed by the Payment Service RPC: checkout ID, checkout status, provider, provider mode, and persisted failure/dispute fields. Mobile refreshes this list after booking creation and after checkout session creation so confirmation/detail screens can reconcile pending online payments even after navigation or app restart.

### `POST /v1/payments`

- Public route: `POST /v1/payments`
- Internal route: `POST /internal/payments`
- Auth: required
- Idempotency: duplicate create for the same booking returns the existing payment record.

Body:

```json
{
  "bookingId": "uuid",
  "paymentMethod": "cash_on_service"
}
```

The gateway verifies booking visibility, then forwards booking IDs and amount to the Payment Service.

Cash-on-service bookings also create or update a local pending payment as a booking side effect. When the provider completes the booking, the gateway asks the Payment Service to confirm the matching cash payment as `paid`.

### `POST /v1/payments/checkout-sessions`

- Public route: `POST /v1/payments/checkout-sessions`
- Internal route: `POST /internal/payments/checkout-sessions`
- Auth: required
- Idempotency: pass `Idempotency-Key` to APICenter through the Payment Service.

Creates an APICenter checkout session, stores local checkout metadata, and leaves the local payment pending until APICenter status polling or webhook reconciliation marks it paid.

Customer payment acceptance fees from APICenter/PayMongo are platform costs covered by the configured commission. Provider earnings do not change based on whether the customer paid by card, GCash, Maya, QR Ph, GrabPay, online banking, or cash. Provider payout deductions are applied only when a provider payout is created.

The customer app stores only a preferred checkout method label for card and wallet rails. It must not show fake saved card numbers or imply that GCash/Maya credentials were captured. Pending online payments remain actionable as "check payment status" until reconciliation marks the payment paid.

### `POST /v1/payments/payouts`

- Public route: `POST /v1/payments/payouts`
- Internal route: `POST /internal/payments/payouts`
- Auth: provider required
- Idempotency: supported through `Idempotency-Key`.

Creates a provider payout request against available paid earnings. The payout `amount` is the gross provider earning amount reserved for payout. `processingFee` is calculated by the payout method, and `netAmount` is the amount the provider receives after the payout rail fee.

Supported provider payout method fees:

| Payout method | Provider deduction |
| --- | ---: |
| `bank` | `min(amount, PHP 10)` |
| `gcash` | `min(amount, PHP 10)` |
| `paymaya` | `min(amount, PHP 10)` |

The cap prevents tiny payout rows from creating negative provider net amounts.

## Error States

- `401 auth_required`
- `401 invalid_auth_token`
- `400 invalid_payment_request`
- `404 booking_not_found`
- `404 payment_not_found`
- `503 payment_dependency_unavailable`

## Acceptance Criteria

- Customers can create a payment record for their visible booking.
- Providers can list payment records tied to their provider profile.
- Duplicate create calls for the same booking return the existing payment record.
- Missing booking ID, missing method, or invalid amount is rejected.
- Payment Service stores platform fee and provider payout.
- Cash-on-service completion marks the matching cash payment paid.
- Online booking completion is rejected while the matching payment is missing or not paid.
- Provider UI blocks online service completion while payment is pending and does not create a completion update before the booking transition succeeds.
- Provider payout requests and admin payment releases use the same payout method fee calculation.
- No gateway database access is introduced.

## Verification Commands

```sh
cd backend
npm run test
npm run build
```
