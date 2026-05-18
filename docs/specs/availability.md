# Feature Spec: Booking Availability Guards

## Status

- Owner: backend
- Owning service: Booking Service
- Owning schema: `booking`
- Created: 2026-05-15
- Implementation status: proposed

## Problem

Booking creation must not accept requests when the provider cannot service the requested time.

## Goals

- Reject booking creation when the provider has no active availability window for the requested local time.
- Reject booking creation on provider days off.
- Reject overlapping active bookings for the same provider.
- Keep the availability decision inside Booking Service and its owned `booking` schema.
- Return a stable `409 provider_unavailable` error through the gateway.

## Non-Goals

- Provider-facing availability management APIs.
- Travel-time buffers between bookings.
- Recurring exceptions beyond `provider_days_off`.
- Payment, notifications, and calendar integrations.

## Availability Rules

- Timezone: availability windows are evaluated in `Asia/Manila`.
- Requested duration: `hoursRequired`, defaulting to `1`.
- A booking must fit fully inside one active `booking.provider_availability_windows` row.
- A matching `booking.provider_days_off` row blocks the whole local date.
- Active booking statuses that block overlap are `pending`, `confirmed`, and `in_progress`.
- `completed`, `cancelled`, and `rejected` bookings do not block new booking creation.
- The create RPC takes a provider-scoped advisory transaction lock before checking and inserting.

## API Contract

No new public route is added by this guard. Provider-facing schedule management is defined in [Provider Availability Management](provider-availability.md).

- Public route: `POST /v1/bookings`
- Gateway handler: `api-gateway -> booking-service`
- Internal route: `POST /internal/bookings`
- Auth: customer context required
- New conflict response:

```json
{
  "error": {
    "code": "provider_unavailable",
    "message": "Provider is unavailable for the requested time.",
    "details": {}
  }
}
```

## Data Ownership

- Owning schema: `booking`.
- Tables read:
  - `booking.provider_availability_windows`
  - `booking.provider_days_off`
  - `booking.bookings`
- Tables written:
  - `booking.bookings`
  - `booking.booking_timeline_events`
- Migration type: replace `servease_create_booking` RPC and add smoke-only availability seed/cleanup RPC helpers.

## Failure Scenarios

- Boundary failure: requested start/end is outside the active provider window.
- Data integrity failure: requested date is blocked by a provider day off.
- Race/concurrency failure: overlapping active bookings are rejected, with provider-scoped advisory locking around check plus insert.

## Testing Plan

- Unit tests:
  - Repository maps `provider_unavailable` RPC errors.
  - Gateway client preserves service `provider_unavailable` responses.
- Smoke test:
  - Seed provider availability.
  - Create a booking inside the window.
  - Verify duplicate overlap returns `409 provider_unavailable`.
  - Verify outside-window request returns `409 provider_unavailable`.
  - Complete and clean up the smoke booking.

## Verification Commands

```sh
cd backend
npm run build
npm run lint
npm run test
npm run smoke:booking
npm audit --omit=dev
```
