# Feature Spec: Auth And Profile

## Status

- Owner: backend
- Owning services: Auth Service, User Service, Catalog Service
- Owning schemas: `identity_and_user`, `provider_catalog`
- Created: 2026-05-15
- Implementation status: implemented

## Problem

The backend needs a first vertical slice that can identify the current user, expose safe profile data, and establish customer/provider/admin role context for later catalog and booking flows.

## Goals

- Expose a public gateway route for the current user profile.
- Validate public bearer tokens through Supabase Auth at the gateway.
- Keep sensitive identity fields out of all public responses.
- Use the existing live Supabase schema baseline.
- Establish service-local DTOs and contract tests for gateway-to-service calls.
- Keep mobile clients talking only to the API Gateway.

## Non-Goals

- Password login and signup flows.
- Login and signup screens.
- Provider document verification.
- Customer address management beyond returning default profile/address data.
- RLS policy changes.

## Users And Roles

- Customer: can fetch their own user and customer profile context.
- Provider: can fetch their own user and provider profile context.
- Admin: can fetch their own user context; admin management flows are separate.
- System: gateway forwards trusted user context to internal services.

## User Experience

The mobile app can call `GET /v1/me` after authentication to decide which navigation shell to show.

Required states:

- Loading: mobile shows role/profile skeleton.
- Empty: authenticated user exists but has no customer/provider profile; app prompts profile completion.
- Success: app receives safe user data and optional role-specific profile.
- Validation error: malformed user context returns a public error envelope.
- Network error: mobile retries without clearing local session state.
- Permission error: suspended or inactive users receive a blocked-account response.

## Architecture

- Owning services: Auth Service for identity context, User Service for customer profile/address context, Catalog Service for provider profile context.
- Gateway responsibility: authenticate public request, call internal services over HTTP, aggregate safe response.
- Mobile responsibility: call gateway only and route by returned `role`.
- External dependencies: Supabase Auth at the gateway and Supabase service-role RPC functions inside owning backend services.

## Data Ownership

- Owning schema: `identity_and_user` for user/customer identity data.
- Provider profile schema: `provider_catalog`, owned by Catalog Service.
- Tables:
  - `identity_and_user.users`
  - `identity_and_user.customer_profiles`
  - `identity_and_user.user_addresses`
  - `provider_catalog.provider_profiles`
- External service references:
  - Provider profile stores `user_id` as an identity user reference.
- Migration required: no initial table creation; use existing live tables.
- RPC required: service-role-only functions are used because custom schemas are not exposed directly through Supabase REST.

## API Contracts

The broader identity, registration, preferences, referrals, and geo route set is tracked in [Identity And Shared Service Contracts](identity-shared-service-contracts.md).

### Public Gateway Route

- Method: `GET`
- Path: `/v1/me`
- Auth: authenticated user
- Idempotency: not required

#### Request Headers

```http
Authorization: Bearer <access-token>
```

#### Response

```json
{
  "data": {
    "user": {
      "id": "9b6ed52b-8a97-4b89-b6a8-364c65f8736b",
      "email": "customer@example.com",
      "fullName": "Customer Name",
      "contactNumber": "+639000000000",
      "role": "customer",
      "status": "active"
    },
    "customerProfile": {
      "id": "d1810af8-6172-4582-b1d8-b292ee37233a",
      "address": "Primary saved address"
    },
    "providerProfile": null
  }
}
```

#### Errors

- `401 auth_required`
- `401 invalid_auth_token`
- `403 account_inactive`
- `404 user_not_found`
- `503 profile_dependency_unavailable`

### Internal Auth Service Route

- Method: `GET`
- Path: `/internal/users/:userId`
- Caller: API Gateway

Returns safe user identity fields only. It must not return `password_hash`.

### Internal User Service Route

- Method: `GET`
- Path: `/internal/users/:userId/customer-profile`
- Caller: API Gateway

Returns customer profile data and default address summary if present.

### Internal Catalog Service Route

- Method: `GET`
- Path: `/internal/providers/by-user/:userId`
- Caller: API Gateway

Returns provider profile data if the current user is a provider.

## Business Rules

- `role` must be one of `customer`, `provider`, or `admin`.
- `status` must be one of `active`, `suspended`, or `inactive`.
- Suspended or inactive users cannot enter customer/provider workflows.
- Provider profile is returned only for users with `provider` or `admin` role.
- Missing customer/provider profile is not an error for `GET /v1/me`; it is represented as `null`.

## Security And Authorization

- The gateway validates `Authorization: Bearer <access-token>` through Supabase Auth and forwards the resolved user ID to internal services.
- Services validate the forwarded user ID shape.
- Public responses never include `password_hash`.
- Public responses never include service-role details, raw database errors, or Supabase connection metadata.
- Internal service routes are not exposed to mobile clients.

## Observability

- Logs: request ID, route, user ID, downstream service result, error code.
- Metrics: gateway latency, downstream service latency, error count by code.
- Audit events: no audit event required for read-only profile fetch.

## Testing Plan

- Unit tests:
  - User response serialization excludes `password_hash`.
  - Role/status validation rejects unknown values.
- Contract tests:
  - Missing bearer token returns `401 auth_required`.
  - Invalid bearer token returns `401 invalid_auth_token`.
  - `GET /v1/me` success response shape.
  - `GET /v1/me` missing user returns `404 user_not_found`.
  - Suspended user returns `403 account_inactive`.
- Workflow tests:
  - Customer receives customer profile and null provider profile.
  - Provider receives provider profile and optional customer profile.
- Mobile tests:
  - API client handles success, unauthenticated, inactive, and missing profile states.
- Supabase checks:
  - Confirm live tables before implementation.
  - Do not apply DDL for the first slice unless schema drift blocks implementation.

## Acceptance Criteria

- `GET /v1/me` exists at the gateway.
- `GET /v1/me` requires a valid Supabase Auth bearer token.
- Gateway calls internal services through HTTP using environment-defined URLs.
- DTOs are service-local.
- `password_hash` is never returned.
- Missing role-specific profile returns `null`, not a server error.
- Relevant backend tests, lint, build, and audit pass.

## Verification Commands

```sh
cd backend
npm run build
npm run lint
npm run test
npm audit --omit=dev
```

## Open Questions

- Whether `identity_and_user.users.password_hash` remains as legacy data or is removed after Supabase Auth is fully authoritative.
