# Payments Slice

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
- Webhooks.

## Data Ownership

- Payment Service owns the `payment` schema.
- Booking Service remains the source of truth for booking visibility and amount.
- Catalog Service resolves provider profiles.
- API Gateway authenticates and coordinates HTTP service calls only.

## Gateway Routes

### `GET /v1/payments`

Lists payment records visible to the authenticated customer or provider.

### `POST /v1/payments`

Body:

```json
{
  "bookingId": "uuid",
  "paymentMethod": "cash_on_service"
}
```

The gateway verifies booking visibility, then forwards booking IDs and amount to the Payment Service.

## Acceptance Criteria

- Customers can create a payment record for their visible booking.
- Providers can list payment records tied to their provider profile.
- Duplicate create calls for the same booking return the existing payment record.
- Missing booking ID, missing method, or invalid amount is rejected.
- Payment Service stores platform fee and provider payout.
- No gateway database access is introduced.
