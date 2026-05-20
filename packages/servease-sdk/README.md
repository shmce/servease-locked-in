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
- `pricing.createQuote(input, options?)`
- `pricing.getProviderGuidance(input, options?)`
- `availability.getProviderAvailability(providerId?)`
- `availability.replaceWindows(input)`
- `availability.addDayOff(input)`
- `availability.removeDayOff(offDate)`
- `availability.addTimeOff(input)`
- `availability.removeTimeOff(windowId)`
- `providerApplications.getMine(options?)`
- `payments.list()`
- `payments.create(input, options?)`
- `payments.createCheckoutSession(input, options?)`
- `payments.getCheckoutStatus(checkoutId)`
- `payments.validatePromotion(input)`
- `payments.listCustomerMethods()`
- `payments.upsertCustomerMethod(input)`
- `payments.deleteCustomerMethod(methodId)`
- `payments.getPayoutAccount()`
- `payments.listPayoutMethods()`
- `payments.upsertPayoutMethod(input)`
- `payments.listPayouts()`
- `payments.requestPayout(input, options?)`
- `messaging.list()`
- `messaging.open(input)`
- `messaging.listMessages(conversationId)`
- `messaging.sendMessage(conversationId, input)`
- `reviews.listProviderReviews(providerId)`
- `reviews.create(input)`
- `reviews.reply(reviewId, input)`
- `reviews.flag(reviewId, input?)`
- `support.listTickets()`
- `support.createTicket(input)`
- `support.getTicket(ticketId)`
- `support.listReplies(ticketId)`
- `support.reply(ticketId, input)`
- `notifications.list()`
- `notifications.markRead(notificationId)`
- `notifications.registerDevice(input)`
- `notifications.unregisterDevice(token)`
- `profile.getCurrent()`
- `profile.update(input)`
- `profile.getPreferences()`
- `profile.updatePreferences(input)`
- `geo.geocode(input)`
- `geo.reverseGeocode(input)`
- `geo.directions(input)`
- `referrals.getSummary()`
- `uploads.create(input)`

The pricing methods call ServEase's pricing service through the gateway. They do not export pricing formulas, rule persistence, or audit internals. Provider application status is applicant-facing only; admin OCR review actions stay out of this SDK.

The SDK only calls public `/v1/...` ServEase routes. It does not contain Supabase clients, service-role keys, internal service URLs, direct database code, APICenter raw email/SMS/geo/Kafka wrappers, or OCR execution logic.

## Publishing To GitHub Packages

Before publishing locally, make sure the active GitHub account can write packages for the `ImplementSprint` organization:

```sh
gh auth status
gh auth refresh -h github.com -s write:packages -s read:packages
```

Then publish:

```sh
export GITHUB_TOKEN="$(gh auth token)"
npm install
npm run typecheck
npm test
npm run build
npm pack --dry-run
npm publish
```

For GitHub Actions publishing:

```yaml
name: Publish ServEase SDK

on:
  push:
    tags:
      - "servease-sdk-v*"

permissions:
  contents: read
  packages: write

jobs:
  publish:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: packages/servease-sdk
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          registry-url: https://npm.pkg.github.com
          scope: "@implementsprint"
      - run: npm ci
      - run: npm run typecheck
      - run: npm test
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

After publishing, grant consuming tribe repositories package read access in GitHub Packages. Consumers need:

```yaml
permissions:
  contents: read
  packages: read
```

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
