# Admin Booking Operations

## Scope

Admin booking operations let the admin portal monitor bookings and perform high-risk interventions without bypassing service boundaries.

Booking Service owns booking reads, cancellations, and escalation records. Admin Service exposes internal operations by calling Booking Service over HTTP. API Gateway authenticates the admin and forwards requests to Admin Service.

## API Contracts

Public gateway endpoints:

- `GET /v1/admin/bookings`
  - Requires active admin bearer token.
  - Query params: `status`, `query`, `limit`.
  - Returns newest-first booking summaries across the platform.
- `GET /v1/admin/bookings/:bookingId`
  - Requires active admin bearer token.
- `POST /v1/admin/bookings/:bookingId/cancel`
  - Requires active admin bearer token.
  - Body: `{ reason: string, explanation?: string | null }`
  - Allowed only for `pending`, `confirmed`, and `in_progress` bookings.
- `POST /v1/admin/bookings/:bookingId/escalate`
  - Requires active admin bearer token.
  - Body: `{ reason: string, priority?: "low" | "medium" | "high" | "critical" }`

Internal Admin Service endpoints mirror these under `/internal/admin/bookings`.
Booking Service owns internal endpoints under `/internal/admin/bookings`.

## Data Shape

Admin booking summaries include the existing booking fields plus:

- `createdAt`
- `updatedAt`
- `cancelReason`
- `cancelExplanation`
- `cancelledAt`
- `escalationCount`
- `latestEscalationPriority`
- `latestEscalationReason`
- `latestEscalatedAt`

## Failure States

- Invalid filter/status/body: `400 invalid_admin_request`
- Non-admin token: `403 admin_required`
- Missing booking: `404 booking_not_found`
- Invalid cancellation transition: `409 invalid_booking_transition`
- Downstream service failure: `503 admin_dependency_unavailable`

## Acceptance Criteria

- Admin can list and inspect platform bookings from live backend data.
- Admin cancellation changes the booking through Booking Service, not direct DB access from Gateway/Admin Service.
- Admin escalation creates a Booking Service-owned escalation record.
- Admin cancellation and escalation create audit log rows.
- Admin All Bookings and Ongoing Services screens use gateway data instead of static booking arrays.
