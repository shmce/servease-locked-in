# Mobile Auth and Profile

## Problem

The mobile booking workspace can call authenticated gateway routes only when a user manually pastes an access token. Customers need an in-app sign-in path that produces a Supabase access token and loads the gateway profile shape from `GET /v1/me`.

## Goals

- Add email/password sign-in against Supabase Auth.
- Keep the Supabase service role key out of the mobile app.
- Store the signed-in session in React state for this slice.
- Fetch `GET /v1/me` through the API Gateway using the Supabase access token.
- Reuse the same access token for booking creation and booking list reads.
- Show loading, signed-out, signed-in, profile, and error states.

## Non-Goals

- Account registration.
- Password reset.
- Persistent secure session storage.
- Native biometric auth.
- Role-specific navigation shells.

## Configuration

The mobile app reads these public Expo environment values:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_API_BASE_URL`

The Supabase service role key must never be referenced by mobile code.

## Data Flow

1. Customer enters email and password.
2. Mobile posts to Supabase Auth password grant with the publishable key.
3. Supabase returns an access token and user identity summary.
4. Mobile calls `GET /v1/me` on the API Gateway with `Authorization: Bearer <access-token>`.
5. The gateway validates the token and aggregates the safe profile response from backend services.
6. Mobile uses the access token for booking routes until the user signs out.

## API Contracts

### Supabase Password Sign-In

- Method: `POST`
- Path: `<SUPABASE_URL>/auth/v1/token?grant_type=password`
- Headers:
  - `apikey: <publishable-key>`
  - `content-type: application/json`
- Body:

```json
{
  "email": "customer@example.com",
  "password": "password"
}
```

The app stores only the returned access token, refresh token, expiration seconds, token type, and basic Supabase user summary in state.

### Gateway Profile

- Method: `GET`
- Path: `/v1/me`
- Headers:
  - `Authorization: Bearer <access-token>`

The response shape is the existing `CurrentUserProfile` backend contract.

## Acceptance Criteria

- A signed-out customer can enter Supabase email/password credentials and sign in.
- Successful sign-in loads and displays the current user profile from the gateway.
- Booking creation and booking refresh use the signed-in token automatically.
- Signing out clears the session, profile, bookings, and password field.
- Missing Supabase public configuration shows an actionable error before a network call.
- Mobile tests cover auth request shape, auth error handling, and `/v1/me` bearer behavior.
