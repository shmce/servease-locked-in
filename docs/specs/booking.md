# Feature Spec: Booking Lifecycle

## Status

- Owner: backend
- Created: 2026-05-15
- Implementation status: proposed

## Problem

Customers need to create service booking requests and move bookings through a clear server-owned status lifecycle.

## Goals

- Expose authenticated gateway routes for booking creation and status transitions.
- Store bookings in the live `booking.bookings` table through service-role-only RPC functions.
- Keep the gateway database-free.
- Enforce allowed status transitions server-side.
- Return stable camelCase DTOs.

## Non-Goals

- Payment capture.
- Provider calendar conflict detection.
- Provider notifications.
- File attachments.
- Booking list/detail screens.

## Users And Roles

- Customer: creates bookings and can cancel their bookings.
- Provider: can confirm, reject, start, complete, or cancel assigned bookings in later UI flows.
- System: gateway resolves bearer tokens to user IDs and calls Booking Service over HTTP.

## API Contracts

### Create Booking

- Method: `POST`
- Public route: `/v1/bookings`
- Internal route: `POST /internal/bookings`
- Auth: required
- Idempotency: deferred until payment-sensitive creation exists.

Required body fields:

- `providerId`
- `serviceAddress`
- `scheduledAt`

Optional body fields:

- `serviceId`
- `serviceTitle`
- `serviceName`
- `serviceDescription`
- `hoursRequired`
- `serviceAmount`
- `pricingMode`
- `paymentMethod`
- `customerNotes`

### Transition Status

- Method: `PATCH`
- Public route: `/v1/bookings/:bookingId/status`
- Internal route: `PATCH /internal/bookings/:bookingId/status`
- Auth: required

Allowed transitions:

- `pending -> confirmed`
- `pending -> rejected`
- `pending -> cancelled`
- `confirmed -> in_progress`
- `confirmed -> cancelled`
- `in_progress -> completed`
- `in_progress -> cancelled`

## Data Ownership

- Owning schema: `booking`.
- Tables:
  - `booking.bookings`
  - `booking.booking_timeline_events`
  - `booking.bookings_cancellations`
- Migration required: RPC functions only; no table creation.

## Security And Authorization

- Gateway requires `Authorization: Bearer <access-token>`.
- Gateway forwards the resolved user ID to Booking Service over HTTP.
- Booking Service performs writes through service-role-only RPC functions.
- RPC execution is revoked from `public`, `anon`, and `authenticated`, then granted to `service_role`.

## Testing Plan

- Unit tests:
  - Booking repository maps RPC rows to DTOs.
  - Status transition validator allows and rejects expected transitions.
  - Gateway service forwards authenticated user IDs.
- Smoke test:
  - Seed required user/catalog inputs through RPC helpers.
  - Create a booking through gateway.
  - Confirm and start/complete status through gateway.
  - Clean up temporary booking data.

## Acceptance Criteria

- `POST /v1/bookings` creates a `pending` booking.
- `PATCH /v1/bookings/:id/status` enforces allowed transitions.
- Invalid transitions return a stable conflict error.
- Full backend checks and `smoke:booking` pass.

## Verification Commands

```sh
cd backend
npm run build
npm run lint
npm run test
npm run smoke:booking
npm audit --omit=dev
```
