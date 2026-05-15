# Landing Page Booking Detail Design

## Scope

Add booking detail and status actions to the Next.js landing app without changing the backend.

## Existing Gateway Contracts

- `GET /v1/bookings/:bookingId` returns one authenticated booking.
- `PATCH /v1/bookings/:bookingId/status` transitions a booking status.
- `GET /v1/bookings/:bookingId/service-updates` returns authenticated service updates.
- `GET /v1/me` identifies the signed-in user and role profile.

## Design

The landing app will add Next API routes under `/api/bookings/[bookingId]` and `/api/bookings/[bookingId]/service-updates`. These routes require a bearer token and forward requests to the API Gateway using `SERVEASE_API_BASE_URL`.

The account booking list will link each booking to `/bookings/[bookingId]`. The booking detail page will be a client page because the browser owns the Supabase session token. It will load the booking, current profile, and service updates in parallel.

Status actions will be role-aware:

- Customers can cancel pending, confirmed, or in-progress bookings.
- Providers assigned to the booking can confirm/reject pending bookings, start confirmed bookings, complete in-progress bookings, or cancel active bookings.

## Boundaries

No backend files are edited.
The frontend only shows actions that the current gateway lifecycle already supports.
Failed transitions surface the gateway error instead of trying to reinterpret backend rules.

## Verification

Run `npm run build`.
Smoke `/bookings/:bookingId`.
Smoke `GET /api/bookings/:bookingId`, `PATCH /api/bookings/:bookingId/status`, and `GET /api/bookings/:bookingId/service-updates` without auth and with invalid auth.
