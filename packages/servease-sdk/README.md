# @implementsprint/servease-sdk

Typed ServEase public API contracts and fetch-based client helpers for tribes that need to call ServEase through the API Gateway or an APICenter-routed base URL.

## Install

Configure GitHub Packages for the `@implementsprint` scope:

```ini
@implementsprint:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Then install:

```sh
npm install @implementsprint/servease-sdk
```

The consuming repository needs package read access and a token with `packages: read` in CI.

## What This Shares

This package shares ServEase service capabilities through the public API Gateway/APICenter contract.

```text
Other tribe
  -> @implementsprint/servease-sdk
  -> ServEase API Gateway or APICenter route
  -> ServEase internal services
```

Other tribes get typed access to approved `/v1/...` routes. They do not get direct access to ServEase internal service ports, internal `/internal/...` routes, Supabase credentials, or database tables.

## Usage

```ts
import { createServEaseClient } from '@implementsprint/servease-sdk';

const servease = createServEaseClient({
  baseUrl: process.env.SERVEASE_API_URL,
  accessToken: userAccessToken,
});

const providers = await servease.catalog.listProviders({
  serviceId: 'service-1',
  city: 'Manila',
});
```

Per-request auth and idempotency keys are supported for side-effect routes:

```ts
await servease.bookings.create(
  {
    serviceId: 'service-1',
    providerId: 'provider-1',
    scheduledAt: '2026-05-20T09:00:00.000Z',
    serviceAddress: {
      line1: '123 Street',
      city: 'Manila',
      latitude: 14.5995,
      longitude: 120.9842,
    },
  },
  {
    accessToken: userAccessToken,
    idempotencyKey: 'booking-create-001',
  },
);
```

## API Surface

- `catalog.listCategories()`
- `catalog.listServices(params?)`
- `catalog.listProviders(params?)`
- `bookings.create(input, options?)`
- `bookings.list(params?)`
- `bookings.get(bookingId)`
- `bookings.updateStatus(bookingId, input, options?)`
- `availability.getProviderAvailability(providerId?)`
- `availability.replaceWindows(input)`
- `availability.addDayOff(input)`
- `availability.removeDayOff(offDate)`

The SDK only calls public `/v1/...` ServEase routes. It does not contain Supabase clients, service-role keys, internal service URLs, or direct database code.

## Publishing

The package is configured for GitHub Packages:

```json
{
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

Publishing CI should grant:

```yaml
permissions:
  contents: read
  packages: write
```

Use `NODE_AUTH_TOKEN` or `GITHUB_TOKEN` for the publish step.

## Verification

```sh
npm run typecheck
npm test
npm run build
npm pack --dry-run
```
