# ServEase Backend

NestJS HTTP microservices backend for ServEase.

## Apps

| App | Port | Responsibility |
| --- | ---: | --- |
| `apps/api-gateway` | 5001 | Public API, auth boundary, request routing, uploads |
| `apps/auth-service` | 8501 | Registration, password reset/change, internal user context |
| `apps/user-service` | 8502 | Customer/provider/admin user profile data |
| `apps/catalog-service` | 8503 | Catalog browsing, provider profiles, admin catalog |
| `apps/booking-service` | 8504 | Booking lifecycle, admin bookings, disputes |
| `apps/availability-service` | 8505 | Provider availability |
| `apps/messaging-service` | 8506 | Conversations and messages |
| `apps/payment-service` | 8507 | Payments, promotions, payout/refund support |
| `apps/review-service` | 8508 | Reviews and review moderation data |
| `apps/notification-service` | 8509 | Notifications, preferences, push delivery support |
| `apps/support-service` | 8510 | Support tickets |
| `apps/admin-service` | 8511 | Admin operations, reports, integrations |

Shared helpers live in `libs/common`. Database migrations live in `database`.

## Environment

Copy `.env.example` to `.env` and fill in Supabase and optional integration values:

```sh
cp .env.example .env
```

Required local basics:

- `PORT=5001`
- `*_SERVICE_PORT` for each service.
- `*_SERVICE_URL` for gateway-to-service HTTP calls.
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`

Optional APICenter integration probing uses:

- `APICENTER_URL`
- `APICENTER_TRIBE_ID`
- `APICENTER_SERVICE_ID`
- `APICENTER_TRIBE_SECRET`
- `APICENTER_WEBHOOK_SECRET` only when APICenter webhook delivery is registered.

Optional provider navigation directions use:

- `OPENROUTESERVICE_API_KEY`

APICenter-backed shared services are routed through the owning HTTP services:

- auth-service: OTP generation/verification and Google authorization helpers.
- user-service: geocoding, reverse geocoding, and geofence checks.
- notification-service: shared email and SMS delivery.
- payment-service: checkout sessions, status sync, refunds, customers, products, prices, subscriptions, and invoices.

Payment checkout sessions are persisted by payment-service in `payment.apicenter_checkout_sessions`. The gateway supplies booking/customer/provider context over HTTP, and payment-service reconciles APICenter checkout status into the local `payment.payments` row when status is checked. If APICenter provides a webhook secret, `POST /v1/payments/webhooks/apicenter` can also reconcile the payment from webhook delivery.

The webhook path also requires `x-apicenter-webhook-timestamp` as Unix epoch milliseconds within a five-minute replay window. See [APICenter Payment Reconciliation Runbook](../docs/runbooks/apicenter-payment-webhook.md) before registering the webhook with APICenter.

Optional admin report delivery uses:

- `ADMIN_REPORT_DELIVERY_WORKER_ENABLED`
- `ADMIN_REPORT_DELIVERY_INTERVAL_MS`
- `ADMIN_REPORT_DOWNLOAD_BASE_URL`

## GitHub Packages

This workspace depends on `@implementsprint/sdk` from GitHub Packages. Before `npm install`, make sure the active GitHub token has `read:packages` and export it:

```sh
gh auth refresh -h github.com -s read:packages
export GITHUB_TOKEN="$(gh auth token)"
npm install
```

`backend/.npmrc` reads the token from `GITHUB_TOKEN`; do not put a real token in the file.

## Commands

```sh
npm run dev
npm run start:gateway:dev
npm run start:auth
npm run start:user
npm run start:catalog
npm run start:booking
npm run start:availability
npm run start:messaging
npm run start:payment
npm run start:review
npm run start:notification
npm run start:support
npm run start:admin
npm run lint
npm run test
npm run test:cov
npm run build
npm run check:migrations
npm run smoke:apicenter
npm run smoke:apicenter-webhook
npm run smoke:all
npm run verify
```

`npm run smoke:apicenter` authenticates with the official APICenter SDK and verifies the shared-service contracts ServEase depends on without sending email/SMS, creating OTPs, or creating checkouts by default. `npm run smoke:apicenter-webhook` validates the public webhook route locally with a fake APICenter payload and synthetic payment row. `npm run verify` runs lint, Jest, build, production dependency audit, migration drift checks, and backend smoke coverage.

## Demo Data

Seed local/shared demo users and data:

```sh
npm run seed:demo
```

The demo catalog includes ranking examples: Home Cleaning has the highest
catalog-side volume for `Popular`, Repairs has the strongest Bayesian rating
for `Top Rated`, and Specialty Assembly has a single 5.0 review to show how
low sample sizes are dampened.

Demo credentials default to:

| Role | Email | Password |
| --- | --- | --- |
| Customer | `customer.demo@servease.test` | `ServEaseDemo#2026` |
| Provider | `provider.demo@servease.test` | `ServEaseDemo#2026` |
| Admin | `admin.demo@servease.test` | `ServEaseDemo#2026` |

## Rules

- Services communicate through HTTP only.
- The gateway does not access service databases.
- The gateway may access Supabase Storage for upload workflows.
- DTOs stay inside the owning service.
- Shared code is limited to generic helpers such as config, logging, health, and HTTP utilities.
- Migrations must name the owning service and avoid cross-service database ownership.
