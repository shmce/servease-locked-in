# Feature Spec: Catalog Browsing

## Status

- Owner: backend
- Created: 2026-05-15
- Implementation status: proposed

## Problem

Customers need to browse active service categories, services, and provider service listings before they can create a booking.

## Goals

- Expose public gateway routes for catalog browsing.
- Keep mobile clients talking only to the API Gateway.
- Use the live `provider_catalog` schema through service-role-only RPC functions.
- Return stable camelCase DTOs from the gateway.
- Support optional filtering by `categoryId` and `serviceId`.

## Non-Goals

- Search ranking.
- Geo-distance filtering.
- Provider onboarding or document verification.
- Booking creation.
- Admin catalog management.

## Users And Roles

- Customer: browses categories, services, and provider listings.
- Provider: later manages their own listings; not part of this slice.
- Admin: later manages service catalog; not part of this slice.
- System: gateway calls Catalog Service over HTTP.

## User Experience

The mobile app can render a marketplace home from `GET /v1/catalog/categories`, drill into services with `GET /v1/catalog/services?categoryId=...`, and show provider offerings with `GET /v1/catalog/providers?serviceId=...`.

Required states:

- Loading: show stable list skeletons.
- Empty: show an empty category, service, or provider list with a next action.
- Success: show active records only.
- Validation error: malformed UUID filters return `400 invalid_catalog_filter`.
- Network error: mobile can retry without clearing browsing state.
- Permission error: none; initial browsing routes are public.

## Architecture

- Owning service: Catalog Service.
- Gateway responsibility: expose `/v1/catalog/*`, validate query shape, call Catalog Service over HTTP, normalize errors.
- Mobile responsibility: call gateway only.
- External dependencies: Supabase service-role RPC functions inside Catalog Service.

## Data Ownership

- Owning schema: `provider_catalog`.
- Tables:
  - `provider_catalog.service_categories`
  - `provider_catalog.services`
  - `provider_catalog.provider_services`
  - `provider_catalog.provider_profiles`
- Migration required: RPC functions only; no table creation.

## API Contracts

### List Categories

- Method: `GET`
- Public route: `/v1/catalog/categories`
- Internal route: `/internal/catalog/categories`
- Auth: none

#### Response

```json
{
  "data": [
    {
      "id": "9b6ed52b-8a97-4b89-b6a8-364c65f8736b",
      "name": "Home Cleaning",
      "description": "Cleaning services",
      "icon": "sparkles"
    }
  ]
}
```

### List Services

- Method: `GET`
- Public route: `/v1/catalog/services?categoryId=<uuid>`
- Internal route: `/internal/catalog/services?categoryId=<uuid>`
- Auth: none

### List Provider Listings

- Method: `GET`
- Public route: `/v1/catalog/providers?serviceId=<uuid>`
- Internal route: `/internal/catalog/providers?serviceId=<uuid>`
- Auth: none

## Business Rules

- Only active categories are returned.
- Only active services are returned.
- Only active provider listings are returned.
- Provider listings include approved active provider profile summaries when available.
- Missing filters return all active records for that route.

## Security And Authorization

- Public browse routes do not require authentication.
- Catalog Service reads data through service-role-only RPC functions.
- RPC execution is revoked from `public`, `anon`, and `authenticated`, then granted to `service_role`.
- Public responses do not expose provider home coordinates, documents, or private profile fields.

## Testing Plan

- Unit tests:
  - RPC repositories map snake_case rows to camelCase DTOs.
  - Gateway client forwards filters.
  - Controllers wrap responses in `{ data }`.
- Contract tests:
  - Public gateway routes return expected response shape.
  - Invalid UUID filters return `400 invalid_catalog_filter`.
- Smoke test:
  - Seed temporary catalog rows, start Catalog Service and gateway, call all three public routes, then clean up.

## Acceptance Criteria

- `GET /v1/catalog/categories` returns active categories.
- `GET /v1/catalog/services` returns active services and supports `categoryId`.
- `GET /v1/catalog/providers` returns active provider listings and supports `serviceId`.
- Gateway does not access Supabase directly.
- Relevant backend checks and `smoke:catalog` pass.

## Verification Commands

```sh
cd backend
npm run build
npm run lint
npm run test
npm run smoke:catalog
npm audit --omit=dev
```
