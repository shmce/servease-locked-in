# Feature Spec: Booking List And Detail

## Status

- Owner: backend
- Created: 2026-05-15
- Implementation status: proposed

## Problem

Customers and providers need to retrieve bookings created by the booking lifecycle flow. Booking creation and status transitions exist, but there is no read API for booking lists or booking details.

## Goals

- Expose authenticated gateway routes for booking list and detail reads.
- Keep the gateway database-free.
- Use Booking Service as the owner of booking reads.
- Return only bookings visible to the authenticated customer or provider.
- Preserve stable `booking_not_found` responses for missing or hidden bookings.

## Non-Goals

- Pagination beyond a conservative first-page limit.
- Search and filtering by date/status.
- Provider dashboard aggregation.
- Payment, messaging, or review joins.

## API Contracts

### List Bookings

- Public route: `GET /v1/bookings?scope=customer|provider`
- Internal route: `GET /internal/bookings?customerId=<uuid>&providerId=<uuid>`
- Auth: required
- Default scope: `customer`

Rules:

- `scope=customer` lists bookings where `customer_id` is the authenticated user ID.
- `scope=provider` resolves the authenticated user's provider profile through Catalog Service and lists bookings where `provider_id` is that provider profile ID.
- `scope=provider` without a provider profile returns `403 provider_profile_required`.

### Get Booking Detail

- Public route: `GET /v1/bookings/:bookingId`
- Internal route: `GET /internal/bookings/:bookingId?customerId=<uuid>&providerId=<uuid>`
- Auth: required

Rules:

- Detail is visible when the authenticated user is the booking customer or owns the provider profile assigned to the booking.
- Missing or hidden bookings return `404 booking_not_found`.

## Data Ownership

- Owning schema: `booking`.
- Tables read:
  - `booking.bookings`
- Migration type: service-role-only read RPC functions.
- Gateway resolves provider profile through Catalog Service HTTP and never queries Supabase tables.

## Errors

- `401 auth_required`
- `401 invalid_auth_token`
- `403 provider_profile_required`
- `404 booking_not_found`
- `400 invalid_booking_request`
- `503 booking_dependency_unavailable`

## Testing Plan

- Unit tests:
  - Booking repository maps list rows and hidden detail misses.
  - Gateway service forwards list/detail visibility IDs.
  - Gateway client maps `booking_not_found`.
- Smoke test:
  - Create a booking through the gateway.
  - Fetch customer booking list through the gateway.
  - Fetch booking detail through the gateway.
  - Run existing transition and cleanup checks.

## Verification Commands

```sh
cd backend
npm run build
npm run lint
npm run test
npm run smoke:booking
npm audit --omit=dev
```
