# Identity And Shared Service Contracts

## Status

- Owner: backend
- Owning services: Auth Service, User Service, and Catalog Service
- Owning schemas: `identity_and_user`, `provider_catalog`
- Created: 2026-05-19
- Implementation status: implemented

## Problem

The API Gateway exposes identity, account, preferences, referrals, and shared geo routes that are used across mobile, provider web, landing page, and admin-adjacent flows. These contracts need one place that names the public route, internal service route, owner, auth requirement, and failure envelope.

## Goals

- Keep clients calling only gateway `/v1/...` routes.
- Keep identity and user persistence inside Auth Service and User Service.
- Keep provider profile lookups behind Catalog Service.
- Keep shared geo helpers behind User Service's `/internal/shared-geo/...` routes.
- Make registration and current-user side effects explicit.

## Non-Goals

- Mobile UI behavior; see `mobile-auth-profile.md`.
- Admin user management; use admin-specific specs.
- New authentication providers beyond the existing Supabase/Google/OTP surface.
- Kafka, Databricks, or event-based identity propagation.

## Data Ownership

- Auth Service owns identity user records, password reset/change coordination, sessions, and two-factor state.
- User Service owns customer profiles, preferences, referrals, and shared geo helper responses.
- Catalog Service owns provider profiles and provider application status.
- API Gateway validates public bearer tokens and coordinates HTTP calls only.

## Current User Contracts

### Show Current User

- Public route: `GET /v1/me`
- Internal routes:
  - `GET /internal/users/:userId`
  - `GET /internal/users/:userId/customer-profile`
  - `GET /internal/providers/by-user/:userId`
- Auth: required

### Update Current User

- Public route: `PATCH /v1/me`
- Internal routes:
  - `PATCH /internal/users/:userId`
  - `PATCH /internal/users/:userId/customer-profile`
  - `PATCH /internal/providers/by-user/:userId`
- Auth: required

### Change Password

- Public route: `PATCH /v1/me/password`
- Internal route: `POST /internal/auth/password-change`
- Auth: required

### Delete Account

- Public route: `DELETE /v1/me`
- Internal routes:
  - `GET /internal/users/:userId`
  - `GET /internal/providers/by-user/:userId`
  - `GET /internal/bookings`
  - `PATCH /internal/bookings/:bookingId/status`
  - `DELETE /internal/users/:userId/account`
- Auth: required

### List Sessions

- Public route: `GET /v1/me/sessions`
- Internal route: `GET /internal/users/:userId/sessions`
- Auth: required

### Two-Factor Enable

- Public route: `POST /v1/me/two-factor/enable`
- Internal route: `POST /internal/users/:userId/two-factor/enable`
- Auth: required

### Two-Factor Verify

- Public route: `POST /v1/me/two-factor/verify`
- Internal route: `POST /internal/users/:userId/two-factor/verify`
- Auth: required

### Two-Factor Disable

- Public route: `POST /v1/me/two-factor/disable`
- Internal route: `POST /internal/users/:userId/two-factor/disable`
- Auth: required

## Registration And Shared Auth Contracts

### Register Account

- Public route: `POST /v1/auth/register`
- Internal routes:
  - `POST /internal/auth/registrations`
  - `POST /internal/users/:userId/customer-profile` for customer registrations
  - `POST /internal/providers` for provider registrations
  - `DELETE /internal/auth/registrations/:userId` on profile creation rollback
- Auth: none
- Idempotency: email uniqueness is enforced by Auth Service; duplicate registration returns `registration_conflict`.

### Request Password Reset

- Public route: `POST /v1/auth/password-reset`
- Internal route: `POST /internal/auth/password-reset`
- Auth: none

### Generate OTP

- Public route: `POST /v1/auth/otp/generate`
- Internal route: `POST /internal/auth/shared/otp/generate`
- Auth: none

### Verify OTP

- Public route: `POST /v1/auth/otp/verify`
- Internal route: `POST /internal/auth/shared/otp/verify`
- Auth: none

### Get OTP Status

- Public route: `GET /v1/auth/otp/:otpId/status`
- Internal route: `GET /internal/auth/shared/otp/:otpId/status`
- Auth: none

### Google Authorization URL

- Public route: `POST /v1/auth/google/authorize`
- Internal route: `POST /internal/auth/shared/google/authorize`
- Auth: none

### Google Token Exchange

- Public route: `POST /v1/auth/google/token`
- Internal route: `POST /internal/auth/shared/google/token`
- Auth: none

### Google Token Refresh

- Public route: `POST /v1/auth/google/token/refresh`
- Internal route: `POST /internal/auth/shared/google/token/refresh`
- Auth: none

### Google Logout

- Public route: `POST /v1/auth/google/logout`
- Internal route: `POST /internal/auth/shared/google/logout`
- Auth: none

### Provider Application Status

- Public route: `GET /v1/auth/provider-application/me`
- Internal route: `GET /internal/providers/applications/by-user/:userId`
- Auth: required

## Preferences And Referral Contracts

### Show Preferences

- Public route: `GET /v1/me/preferences`
- Internal route: `GET /internal/users/:userId/preferences`
- Auth: required

### Update Preferences

- Public route: `PUT /v1/me/preferences`
- Internal route: `PUT /internal/users/:userId/preferences`
- Auth: required

### Referral Summary

- Public route: `GET /v1/referrals`
- Internal route: `GET /internal/users/:userId/referral-summary`
- Auth: required

## Shared Geo Contracts

### Geocode

- Public route: `POST /v1/geo/geocode`
- Internal route: `POST /internal/shared-geo/geocode`
- Auth: required

### Reverse Geocode

- Public route: `POST /v1/geo/reverse-geocode`
- Internal route: `POST /internal/shared-geo/reverse-geocode`
- Auth: required

### Geofence Check

- Public route: `POST /v1/geo/geofence/check`
- Internal route: `POST /internal/shared-geo/geofence/check`
- Auth: required

### Directions

- Public route: `POST /v1/geo/directions`
- Internal route: `POST /internal/shared-geo/directions`
- Auth: required

## Error States

- `400 invalid_profile_update_request`
- `400 invalid_password_change_request`
- `400 invalid_two_factor_request`
- `400 invalid_registration_request`
- `400 invalid_password_reset_request`
- `400 invalid_shared_auth_request`
- `400 invalid_user_preferences_request`
- `400 invalid_geo_request`
- `401 auth_required`
- `401 invalid_auth_token`
- `403 account_inactive`
- `404 user_not_found`
- `404 provider_application_not_found`
- `409 registration_conflict`
- `503 profile_dependency_unavailable`
- `503 registration_dependency_unavailable`
- `503 password_reset_dependency_unavailable`
- `503 password_change_dependency_unavailable`
- `503 shared_auth_dependency_unavailable`
- `503 provider_application_dependency_unavailable`
- `503 user_preferences_dependency_unavailable`
- `503 referral_dependency_unavailable`
- `503 geo_dependency_unavailable`

## Acceptance Criteria

- Public clients use only the gateway routes listed in this spec.
- Gateway routes authenticate with Supabase bearer tokens where `Auth: required`.
- Gateway-to-service calls use `AUTH_SERVICE_URL`, `USER_SERVICE_URL`, `CATALOG_SERVICE_URL`, and `BOOKING_SERVICE_URL` as needed.
- Auth Service never returns `password_hash`.
- User Service owns preferences, referrals, customer profile, and shared geo helper contracts.
- Catalog Service owns provider profile and provider application status contracts.
- Account deletion attempts to cancel active visible bookings before deleting the identity account.

## Verification Commands

```sh
cd backend
npm run test
npm run smoke:v1-me
npm run build
```
