# Landing Page Auth Session Design

## Goal

Add Supabase browser login to `Landing Page/` and use the existing API Gateway `/v1/me` route to show the authenticated user's backend profile.

## Scope

- Add frontend-only code under `Landing Page/`.
- Add `/login` for email/password Supabase authentication.
- Add `/account` to show the current gateway profile.
- Add a Next.js `/api/me` route that forwards the Supabase bearer token to `GET /v1/me`.
- Update landing navigation with login/account access.
- Do not edit `backend/`.

## Environment

The landing app needs public Supabase browser values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

It also uses:

- `SERVEASE_API_BASE_URL`

The Supabase service-role key remains backend-only.

## Data Flow

1. User enters email and password on `/login`.
2. Browser signs in through Supabase Auth using the publishable key.
3. `/account` reads the active Supabase session.
4. `/account` calls `/api/me` with `Authorization: Bearer <access-token>`.
5. `/api/me` forwards that token to the existing gateway `GET /v1/me`.
6. The account page renders user role, status, customer profile, and provider verification status.

## Error Handling

- Missing Supabase env displays a setup error on `/login`.
- Missing session on `/account` redirects the user to `/login`.
- Gateway profile errors are shown as readable messages.
- Sign-out clears the Supabase session and returns to `/login`.

## Backend Notes

No backend change is required. This depends on the existing gateway auth path and Supabase Auth users created by registration.

## Verification

- `cd "Landing Page" && npm install`
- `cd "Landing Page" && npm run build`
- HTTP smoke `/login` and `/account`.
