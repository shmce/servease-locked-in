# Feature Spec: Provider Availability Management

## Status

- Owner: backend
- Owning service: Availability Service
- Owning schema: `booking`
- Created: 2026-05-15
- Implementation status: implemented

## Problem

Providers need a gateway-backed API to manage weekly availability windows and days off. Booking creation already enforces these records, but there is no provider-facing way to maintain them.

## Goals

- Expose authenticated provider routes through the API Gateway.
- Resolve the authenticated user's provider profile through Catalog Service.
- Store schedule data in Availability Service using service-role-only RPC functions.
- Keep Booking Service's transactional availability guard unchanged.
- Return stable camelCase DTOs and error envelopes.

## Non-Goals

- Mobile UI.
- Travel-time buffers.
- Rich customer calendar search or slot recommendation.
- Recurring exception rules beyond full days off.
- Admin override flows.

## API Contracts

### Get My Availability

- Public route: `GET /v1/provider/availability`
- Internal route: `GET /internal/providers/:providerId/availability`
- Auth: provider profile required

### Get Provider Availability

- Public route: `GET /v1/provider/availability/:providerId`
- Internal route: `GET /internal/providers/:providerId/availability`
- Auth: none

Returns one provider's published availability schedule for customer booking flows.

### Replace Weekly Windows

- Public route: `PUT /v1/provider/availability/windows`
- Internal route: `PUT /internal/providers/:providerId/availability/windows`
- Auth: provider profile required

Request:

```json
{
  "windows": [
    {
      "dayOfWeek": "monday",
      "startTime": "09:00",
      "endTime": "17:00",
      "isActive": true
    }
  ]
}
```

### Add Day Off

- Public route: `POST /v1/provider/availability/days-off`
- Internal route: `POST /internal/providers/:providerId/availability/days-off`
- Auth: provider profile required

Request:

```json
{
  "offDate": "2026-05-20",
  "reason": "Personal day"
}
```

### Remove Day Off

- Public route: `DELETE /v1/provider/availability/days-off/:offDate`
- Internal route: `DELETE /internal/providers/:providerId/availability/days-off/:offDate`
- Auth: provider profile required

## Data Ownership

- Availability Service manages:
  - `booking.provider_availability_windows`
  - `booking.provider_days_off`
- Booking Service reads the same records during transactional booking creation.
- Gateway does not access the database.

## Validation

- `dayOfWeek` must be one of `monday` through `sunday`.
- `startTime` and `endTime` must be `HH:mm`.
- `startTime` must be earlier than `endTime`.
- `offDate` must be an ISO date string.

## Errors

- `401 auth_required`
- `401 invalid_auth_token`
- `403 provider_profile_required`
- `400 invalid_availability_request`
- `503 availability_dependency_unavailable`

## Testing Plan

- Unit tests:
  - Availability repository calls RPCs and maps schedule data.
  - Availability service rejects invalid windows.
  - Gateway service forwards provider profile IDs.
  - Gateway client preserves invalid request errors.
- Smoke test:
  - Seed a provider auth user and provider profile.
  - Replace weekly windows through the gateway.
  - Add and remove a day off through the gateway.
  - Verify cleanup returns tables to 0 rows.

## Verification Commands

```sh
cd backend
npm run build
npm run lint
npm run test
npm run smoke:availability
npm audit --omit=dev
```
