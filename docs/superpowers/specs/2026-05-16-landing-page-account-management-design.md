# Landing Page Account Management Design

## Scope

Add frontend-only account management to the Next.js landing page without changing the backend.

## Existing Contracts

The API Gateway exposes:

- `GET /v1/me` for the authenticated profile.
- `PATCH /v1/me` for `fullName`, `contactNumber`, `address`, and `businessName`.
- `GET /v1/support/tickets` for the authenticated user's support ticket history.

All routes require a Supabase bearer token.

## Design

The existing `/api/me` Next route will support `PATCH` and forward profile updates to the gateway. The existing `/api/support-tickets` Next route will support `GET` and forward ticket list requests to the gateway.

The account page will keep the current profile summary and add:

- An edit profile form populated from `/api/me`.
- Role-aware fields: customers can edit address, providers can edit business name.
- Save, cancel, loading, and error/success states.
- A support ticket history section showing recent tickets, status, category, and creation date.

## Boundaries

No backend repository files are edited.
No new backend fields are invented.
If the backend rejects an update, the UI surfaces the gateway error.

## Verification

Run `npm run build`.
Smoke `/account`.
Smoke unauthenticated `PATCH /api/me` and `GET /api/support-tickets`, expecting `401 auth_required`.
Smoke invalid-token requests, expecting the gateway's `401 invalid_auth_token`.
