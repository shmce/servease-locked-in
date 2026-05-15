# Landing Page Provider Booking Design

## Scope

Add provider listing detail pages and an authenticated booking request form to the Next.js landing app without changing the backend.

## Existing Gateway Contracts

- `GET /v1/catalog/providers` returns provider service listings.
- `GET /v1/catalog/services` returns service metadata.
- `GET /v1/catalog/providers/:providerId/portfolio` returns public portfolio media.
- `GET /v1/reviews?providerId=:providerId` returns public provider reviews.
- `POST /v1/bookings` creates an authenticated booking request.

## Design

Provider cards on the homepage link to `/providers/[listingId]`. The detail page fetches catalog listings and resolves the selected listing by listing ID, then loads portfolio and reviews by `providerId`.

The booking form is a client component on the detail page. It uses the Supabase browser session to get a bearer token, then posts to a new Next route at `/api/bookings`. That route validates the minimal payload and forwards to the API Gateway with `SERVEASE_API_BASE_URL`.

## User Flow

1. User selects a provider listing from the homepage.
2. Detail page shows service, provider, price, verification, portfolio, and reviews.
3. User fills address, date/time, estimated hours, payment method, and notes.
4. If not signed in, the form shows a sign-in-required message.
5. If signed in, the booking is created as a pending booking through the gateway.

## Boundaries

No backend files are edited.
No direct Supabase writes are made from the landing app.
The frontend does not invent provider availability checks because the current backend contract does not expose scheduling availability.

## Verification

Run `npm run build`.
Smoke `/providers/[listingId]` with a live listing.
Smoke `POST /api/bookings` without auth and expect `401 auth_required`.
Smoke `POST /api/bookings` with an invalid token and expect the gateway `401 invalid_auth_token`.
