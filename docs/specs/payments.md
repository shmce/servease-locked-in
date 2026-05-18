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
- List visible payments for customers and providers.
- Keep payment persistence inside the Payment Service and `payment` schema.
- Calculate platform fee and provider payout from the configured commission rate.
- Support cash/manual payment methods before external payment processor integration.

## Non-Goals

- Card charging.
- Wallet integrations.
- Provider payout execution.
- Refund processing beyond persisted status support.
- New webhook provider integrations beyond the existing API Center checkout webhook.

## Data Ownership

- Payment Service owns the `payment` schema.
- Booking Service remains the source of truth for booking visibility and amount.
- Catalog Service resolves provider profiles.
- API Gateway authenticates and coordinates HTTP service calls only.

## Gateway Routes

### `GET /v1/payments`

- Public route: `GET /v1/payments`
- Internal route: `GET /internal/payments`
- Auth: required

Lists payment records visible to the authenticated customer or provider.

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
- No gateway database access is introduced.

## Verification Commands

```sh
cd backend
npm run test
npm run build
```
