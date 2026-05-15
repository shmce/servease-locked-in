# Feature Spec: Booking Lifecycle

## Status

- Owner: backend
- Created: 2026-05-15
- Implementation status: implemented

## Problem

Customers need to create service booking requests and move bookings through a clear server-owned status lifecycle.
Customers and providers also need durable booking evidence: uploaded media, provider work updates, and timeline history that can be reloaded by the mobile app.

## Goals

- Expose authenticated gateway routes for booking creation and status transitions.
- Store bookings in the live `booking.bookings` table through service-role-only RPC functions.
- Keep the gateway database-free.
- Enforce allowed status transitions server-side.
- Return stable camelCase DTOs.
- Persist booking media metadata, provider service updates, and timeline events.
- Enforce booking visibility before reads and status transitions.

## Non-Goals

- Payment capture.
- Provider notifications.
- Native push notifications.
- Payment capture.

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
- Visibility: gateway first verifies the caller can see the booking as customer or assigned provider.

Allowed transitions:

- `pending -> confirmed`
- `pending -> rejected`
- `pending -> cancelled`
- `confirmed -> in_progress`
- `confirmed -> cancelled`
- `in_progress -> completed`
- `in_progress -> cancelled`

### List Visible Bookings

- Method: `GET`
- Public route: `/v1/bookings`
- Internal route: `GET /internal/bookings`
- Auth: required
- Query: `scope=provider` returns assigned provider bookings; no scope returns customer bookings.

### Booking Detail

- Method: `GET`
- Public route: `/v1/bookings/:bookingId`
- Internal route: `GET /internal/bookings/:bookingId`
- Auth: required
- Unauthorized visible-booking lookup returns `booking_not_found`.

### Booking Attachments

- Method: `POST`
- Public route: `/v1/bookings/:bookingId/attachments`
- Internal route: `POST /internal/bookings/:bookingId/attachments`
- Auth: required
- Allowed `mediaKind`: `booking_reference`, `provider_progress`
- Body fields: `fileUrl`, `fileName`, `mimeType`, `storagePath`, `fileSize`, `caption`, `mediaKind`

### Provider Service Updates

- Method: `GET`
- Public route: `/v1/bookings/:bookingId/service-updates`
- Internal route: `GET /internal/bookings/:bookingId/service-updates`
- Auth: required
- Visibility: booking customer and assigned provider only.

- Method: `POST`
- Public route: `/v1/bookings/:bookingId/service-updates`
- Internal route: `POST /internal/bookings/:bookingId/service-updates`
- Auth: provider profile required
- Allowed `updateType`: `checklist`, `progress`, `completion`
- Body fields: `updateType`, `message`, `checklist`, `attachmentId`
- Provider ownership is enforced by `booking.provider_id`.

### Booking Timeline

- Method: `GET`
- Public route: `/v1/bookings/:bookingId/timeline`
- Internal route: `GET /internal/bookings/:bookingId/timeline`
- Auth: required
- Visibility: booking customer and assigned provider only.
- Events are ordered oldest first and sourced from `booking.booking_timeline_events`.

## Data Ownership

- Owning schema: `booking`.
- Tables:
  - `booking.bookings`
  - `booking.booking_attachments`
  - `booking.booking_service_updates`
  - `booking.booking_timeline_events`
  - `booking.bookings_cancellations`
- Gateway owns no booking database access.
- Booking Service owns all booking-schema reads/writes through service-role-only RPCs.

## Security And Authorization

- Gateway requires `Authorization: Bearer <access-token>`.
- Gateway resolves the caller user ID and provider profile, then forwards only visibility IDs to Booking Service over HTTP.
- Gateway verifies booking visibility before status transitions.
- Service update writes require a provider profile and are checked against the booking provider ID.
- Other customer/provider reads return no service-update or timeline rows; booking detail returns `booking_not_found`.
- Booking Service performs writes through service-role-only RPC functions.
- RPC execution is revoked from `public`, `anon`, and `authenticated`, then granted to `service_role`.

## Testing Plan

- Unit tests:
  - Booking repository maps RPC rows to DTOs.
  - Booking repository maps attachment, service update, and timeline rows to DTOs.
  - Status transition validator allows and rejects expected transitions.
  - Gateway service forwards customer/provider visibility IDs.
- Smoke test:
  - Seed required user/catalog inputs through RPC helpers.
  - Create a booking through gateway.
  - Confirm and start/complete status through gateway as assigned provider.
  - Verify unrelated customers cannot read or transition the booking.
  - Verify customers cannot create provider service updates.
  - Verify service updates and timeline rows are visible to the booking parties only.
  - Clean up temporary booking data.

## Acceptance Criteria

- `POST /v1/bookings` creates a `pending` booking.
- `PATCH /v1/bookings/:id/status` enforces allowed transitions.
- `PATCH /v1/bookings/:id/status` rejects callers who cannot see the booking.
- Invalid transitions return a stable conflict error.
- Provider service updates persist and reload for the customer and assigned provider.
- Booking timeline events persist and reload for the customer and assigned provider.
- Full backend checks, `smoke:booking`, and `smoke:extended` pass.

## Verification Commands

```sh
cd backend
npm run build
npm run lint
npm run test
npm run smoke:booking
npm audit --omit=dev
```
