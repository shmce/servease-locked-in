# Feature Spec: Mobile Customer Booking Flow

## Status

- Owner: mobile
- Created: 2026-05-15
- Implementation status: proposed

## Problem

Customers need a mobile screen that uses the existing gateway catalog and booking APIs to browse services, pick a provider, submit a booking request, and review their bookings.

## Goals

- Create the initial Expo React Native app under `mobile/`.
- Browse catalog categories, services, and provider listings through the API Gateway.
- Create a booking through `POST /v1/bookings`.
- List customer bookings through `GET /v1/bookings`.
- Keep all mobile API calls pointed at the gateway.
- Provide clear loading, empty, error, and success states.

## Non-Goals

- Native auth flow.
- Provider booking management UI.
- Payments, chat, reviews, notifications, and attachments.
- Offline persistence.

## Auth Assumption

The backend currently authenticates gateway routes with a bearer token, but mobile auth is not implemented. This slice includes an access-token input so authenticated booking routes can be exercised without creating a separate auth flow.

## UX

- First screen is the working booking flow, not a landing page.
- Public catalog loads on launch.
- Customer selects a category, service, and provider.
- Customer enters address, scheduled date/time, duration, and notes.
- Successful booking creation refreshes the bookings list.
- Booking list shows current status and scheduled time.

## API Client

- `mobile/services/serveaseApi.ts` owns gateway calls.
- Base URL comes from `EXPO_PUBLIC_API_BASE_URL`, defaulting to `http://localhost:5001`.
- Authenticated calls require a pasted bearer token.
- Public catalog calls do not require a token.

## Testing Plan

- API client unit tests:
  - Catalog endpoints call the gateway routes.
  - Booking creation sends the bearer token and body.
  - API errors produce useful messages.
- Static checks:
  - `npm run typecheck`
  - `npm test`

## Verification Commands

```sh
cd mobile
npm run typecheck
npm test
npm run web
```
