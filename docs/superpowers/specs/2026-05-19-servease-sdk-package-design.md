# ServEase SDK Package Design

## Purpose

Create a tribe-consumable TypeScript package for ServEase public API contracts and safe HTTP client helpers. The package gives other tribes a stable way to call ServEase gateway/APICenter routes without copying DTOs from backend services or reaching into internal service ports.

## Decision

Create `packages/servease-sdk` as a separate publishable package named `@implementsprint/servease-sdk`.

Do not publish `backend/package.json`; the backend remains private and deploys as service runtimes/images. This preserves the existing service-contract decision that package units map to deployable services, while the SDK package only exports public contract types and client helpers.

## Scope

The first SDK version covers the stable public marketplace surface:

- shared response and error envelope types;
- catalog browse contracts;
- booking create, list, detail, and status update contracts;
- provider availability read/write contracts;
- pricing quote and provider guidance contracts as gateway-backed service calls;
- provider application status for the signed-in applicant;
- payment status, checkout session, promotion validation, customer method, payout status, and payout request contracts;
- messaging, review, support, notification, current-user profile, preferences, geo, referral, and upload contracts;
- a small fetch-based client factory for gateway routes.

The first version excludes:

- admin routes;
- payment capture and payouts;
- reports and analytics;
- OCR trigger/review internals and admin provider-application review actions;
- APICenter raw email/SMS/geo/Kafka wrappers;
- Kafka, Databricks, AWS data streaming, or Power BI exports;
- Supabase clients, service-role credentials, internal service clients, or direct database access.

## Package Shape

```text
packages/servease-sdk/
  package.json
  tsconfig.json
  README.md
  src/
    index.ts
    client.ts
    errors.ts
    types/
      availability.ts
      booking.ts
      catalog.ts
      common.ts
      geo.ts
      messaging.ts
      notifications.ts
      payments.ts
      pricing.ts
      profile.ts
      provider-applications.ts
      referrals.ts
      reviews.ts
      support.ts
      uploads.ts
```

The package builds TypeScript source to `dist/` and publishes only `dist/` plus `README.md`.

## Public API

Consumers create a client with a gateway or APICenter-routed ServEase base URL:

```ts
import { createServEaseClient } from '@implementsprint/servease-sdk';

const servease = createServEaseClient({
  baseUrl: process.env.SERVEASE_API_URL,
  accessToken: userToken,
});

const providers = await servease.catalog.listProviders();
```

The client exposes grouped methods:

- `catalog.listCategories()`
- `catalog.listServices(params?)`
- `catalog.listProviders(params?)`
- `bookings.create(input, options?)`
- `bookings.list(params?)`
- `bookings.get(bookingId)`
- `bookings.updateStatus(bookingId, input, options?)`
- `pricing.createQuote(input, options?)`
- `pricing.getProviderGuidance(input, options?)`
- `availability.getProviderAvailability(providerId?)`
- `availability.replaceWindows(input)`
- `availability.addDayOff(input)`
- `availability.removeDayOff(offDate)`
- `providerApplications.getMine(options?)`
- `payments.*` for visible ServEase payment, checkout, promotion, payout, and payment-method workflows
- `messaging.*` for ServEase booking conversations
- `reviews.*` for provider reviews, replies, and flags
- `support.*` for caller-visible support tickets
- `notifications.*` for the caller's notification inbox and device registration
- `profile.*` for current user profile and preferences
- `geo.*` for ServEase gateway-backed geo helpers
- `referrals.getSummary()`
- `uploads.create(input)`

Side-effect methods accept an optional `idempotencyKey` option when the underlying contract requires or benefits from idempotent retries.

## Data Flow

```text
Other tribe backend or client
  -> @implementsprint/servease-sdk
  -> ServEase API Gateway or APICenter route
  -> ServEase internal HTTP services
```

The SDK never calls internal `/internal/...` routes and never calls service ports `8501` through `8511`.

The shared service boundary is the ServEase API Gateway or its APICenter registration. The SDK is only the typed client for that boundary.

Pricing is shared as a service capability through `/v1/pricing/quotes` and `/v1/provider/pricing/guidance`; the package does not contain the pricing formula or rule engine. OCR-backed provider verification is shared only as applicant-facing status. Admin OCR execution and review workflows remain server-side/admin-only.

Geo is shared only as ServEase gateway methods, not as a raw APICenter geo wrapper. Notification methods expose ServEase notification inbox/device workflows, not raw email or SMS sending. Uploads use the gateway upload route and do not expose storage credentials.

## Auth

The SDK accepts a bearer access token either at client creation or per request. It only attaches the token as an `Authorization: Bearer ...` header. Runtime authorization remains owned by the ServEase API Gateway and internal services.

GitHub package authentication is separate:

- publishing uses a token with package write access;
- consuming uses a token with package read access;
- neither token replaces runtime API authentication.

## Errors

The client parses the standard ServEase error envelope:

```json
{
  "error": {
    "code": "booking_unavailable",
    "message": "This provider is not available at the selected time.",
    "details": {}
  }
}
```

Non-2xx responses throw `ServEaseApiError` with:

- `status`;
- `code`;
- `message`;
- `details`;
- `response`.

Network failures throw the platform `fetch` error unchanged unless they occur after an HTTP response is received.

## Publishing

The package is configured for GitHub Packages:

```json
{
  "name": "@implementsprint/servease-sdk",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

The package repository or monorepo root must include a safe `.npmrc`:

```ini
@implementsprint:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

GitHub Actions publishing should use:

- `permissions.contents: read`;
- `permissions.packages: write`;
- `NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}`.

Other tribes need package read access, the same scope mapping, and CI `packages: read`.

## Testing

Package verification must cover:

- TypeScript build emits declarations;
- request URL construction and query string handling;
- authorization and idempotency headers;
- successful `data` envelope parsing;
- error envelope parsing into `ServEaseApiError`;
- package exports from `src/index.ts`.

Use mocked `fetch` tests. Do not require a live ServEase gateway for SDK unit tests.

## Acceptance Criteria

- `packages/servease-sdk` exists and builds with `npm run build`.
- The package is named `@implementsprint/servease-sdk` and is publishable to GitHub Packages.
- The SDK exports public contract types for catalog, booking, availability, pricing, provider applications, and common envelopes.
- The SDK exposes a fetch-based client that only calls `/v1/...` gateway routes.
- The package contains no Supabase service-role usage, no internal service URLs, and no direct database code.
- Tests cover success and error request handling without a live backend.
- Documentation explains local use, publishing, and consuming from another tribe repository.

## Verification Commands

```sh
cd packages/servease-sdk
npm install
npm run typecheck
npm test
npm run build
npm pack --dry-run
```

Repository-level verification should additionally confirm no internal routes are exported by the SDK:

```sh
rg -n "/internal|850[1-9]|851[0-1]|SUPABASE_SERVICE_ROLE" packages/servease-sdk
```
