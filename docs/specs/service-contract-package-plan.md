# Service Contract And Package Plan

## Status

- Owner: backend
- Created: 2026-05-19
- Decision status: selected baseline
- Implementation status: contract docs, API Center manifest, and backend deployable manifest are present

## Purpose

This document decides the service contracts and packaging path for ServEase so the backend can be shared, deployed, and reasoned about consistently.

The current backend architecture is HTTP-only. Mobile, provider web, admin, and landing page code call the API Gateway. The API Gateway calls internal services over HTTP using environment-defined service URLs. Internal services do not call each other's databases.

## Decisions

### External Boundary

Expose ServEase through the API Gateway only.

```text
External client or platform
  -> API Gateway
  -> internal ServEase service over HTTP
```

Do not expose `auth-service`, `booking-service`, `payment-service`, or other internal service ports as public contracts for other tribes.

### Internal Boundary

Keep service-to-service communication as HTTP only.

```text
API Gateway :5001
  -> Auth Service :8501
  -> User Service :8502
  -> Catalog Service :8503
  -> Booking Service :8504
  -> Availability Service :8505
  -> Messaging Service :8506
  -> Payment Service :8507
  -> Review Service :8508
  -> Notification Service :8509
  -> Support Service :8510
  -> Admin Service :8511
```

Each internal contract must name the owning service, method, route, authentication context, request shape, response shape, errors, and idempotency behavior where side effects are possible.

### Kafka And Databricks

Do not add Kafka, RabbitMQ, event buses, Databricks jobs, or AWS data pipelines to this backend as part of this contract work.

If the platform later requires Kafka or Databricks, create a separate platform integration spec first. That spec must define the API Center route or SDK method, topic names, payload versions, retry semantics, ownership, and failure handling. ServEase services should not connect directly to Kafka brokers or Databricks from business logic.

## Service Contract Map

| Priority | Public Contract | Owning Service | Internal Contract | Purpose |
| --- | --- | --- | --- | --- |
| P0 | `GET /health/live`, `GET /health/ready` | gateway and every service | service-local health routes | Deployment and readiness checks |
| P0 | `POST /v1/auth/register` | auth-service | `POST /internal/auth/registrations` plus profile creation routes | Customer/provider/admin account creation |
| P0 | `POST /v1/auth/password-reset` | auth-service | `POST /internal/auth/password-reset` | Password recovery |
| P0 | `POST /v1/auth/otp/generate`, `POST /v1/auth/otp/verify`, `GET /v1/auth/otp/:otpId/status`, `/v1/auth/google/...` | auth-service | `/internal/auth/shared/...` | OTP and Google shared auth flow |
| P0 | `GET /v1/me`, `PATCH /v1/me`, `PATCH /v1/me/password`, `DELETE /v1/me`, `GET /v1/me/sessions`, `/v1/me/two-factor/...` | auth-service and user-service | `/internal/users/:userId`, `/internal/auth/password-change`, `/internal/users/:userId/two-factor/...` | Current user account/profile/session/security |
| P0 | `GET /v1/me/preferences`, `PUT /v1/me/preferences`, `GET /v1/referrals`, `/v1/geo/...` | user-service | `/internal/users/:userId/preferences`, `/internal/users/:userId/referral-summary`, `/internal/shared-geo/...` | User preferences, referrals, and shared geo helpers |
| P0 | `GET /v1/catalog/categories` | catalog-service | `GET /internal/catalog/categories` | Browse categories |
| P0 | `GET /v1/catalog/services` | catalog-service | `GET /internal/catalog/services` | Browse service types |
| P0 | `GET /v1/catalog/providers` | catalog-service | `GET /internal/catalog/providers` | Browse providers for booking |
| P0 | `POST /v1/bookings` | booking-service | `POST /internal/bookings` | Create a booking |
| P0 | `GET /v1/bookings`, `GET /v1/bookings/:bookingId` | booking-service | `GET /internal/bookings`, `GET /internal/bookings/:bookingId` | List and inspect visible bookings |
| P0 | `PATCH /v1/bookings/:bookingId/status` | booking-service | `PATCH /internal/bookings/:bookingId/status` | Booking lifecycle transition |
| P1 | `GET /v1/provider/availability`, `GET /v1/provider/availability/:providerId`, `PUT /v1/provider/availability/windows`, `POST /v1/provider/availability/days-off`, `DELETE /v1/provider/availability/days-off/:offDate` | availability-service | `/internal/providers/:providerId/availability` | Provider windows and days off |
| P1 | `POST /v1/bookings/:bookingId/service-updates`, `GET /v1/bookings/:bookingId/service-updates` | booking-service | matching `/internal/bookings/...` routes | Provider work updates |
| P1 | `GET /v1/bookings/:bookingId/timeline` | booking-service | `GET /internal/bookings/:bookingId/timeline` | Booking event history |
| P1 | `GET /v1/conversations`, `POST /v1/conversations`, `GET /v1/conversations/:conversationId/messages`, `POST /v1/conversations/:conversationId/messages` | messaging-service | `/internal/conversations` | Customer/provider conversations |
| P1 | `GET /v1/notifications`, `PATCH /v1/notifications/:notificationId/read`, `POST /v1/notifications/devices`, `DELETE /v1/notifications/devices/:token` | notification-service | `/internal/notifications` | Notification inbox and device registration |
| P1 | `/v1/payments/...` | payment-service | `/internal/payments/...` | Checkout, methods, payouts, webhooks |
| P1 | `/v1/reviews` | review-service | `/internal/reviews` | Reviews, replies, flags |
| P2 | `GET /v1/support/tickets`, `POST /v1/support/tickets`, `GET /v1/support/tickets/:ticketId`, `GET /v1/support/tickets/:ticketId/replies`, `POST /v1/support/tickets/:ticketId/replies` | support-service | `/internal/support/tickets` | Support cases |
| P2 | `/v1/admin/...` | admin-service plus domain services | `/internal/admin/...` | Admin operations, reports, moderation |

## First Contract To Stabilize

Start with `POST /v1/bookings` because it touches the core marketplace boundary.

### Create Booking Contract

- Public route: `POST /v1/bookings`
- Gateway handler: `api-gateway -> booking-service`
- Internal route: `POST /internal/bookings`
- Owner: `booking-service`
- Auth: customer context required
- Idempotency: required before payment-coupled booking creation is enabled; until then, preserve the existing booking spec behavior and avoid duplicate client retries at the mobile layer
- Storage owner: `booking-service` and the `booking` schema

#### Request Shape

```json
{
  "serviceId": "uuid",
  "providerId": "uuid",
  "scheduledAt": "2026-05-20T09:00:00.000Z",
  "serviceAddress": {
    "line1": "123 Street",
    "city": "Manila",
    "latitude": 14.5995,
    "longitude": 120.9842
  },
  "hoursRequired": 1,
  "customerNotes": "Please bring tools"
}
```

#### Response Shape

```json
{
  "data": {
    "bookingId": "uuid",
    "status": "pending",
    "serviceId": "uuid",
    "providerId": "uuid",
    "scheduledAt": "2026-05-20T09:00:00.000Z"
  }
}
```

#### Error Codes

- `400 invalid_booking_request`
- `401 unauthenticated`
- `403 booking_forbidden`
- `409 booking_duplicate`
- `409 provider_unavailable`
- `422 booking_business_rule_failed`
- `503 booking_dependency_unavailable`

#### Service Dependencies

- `catalog-service`: validate service and provider listing when required by the booking slice.
- `availability-service` or booking-owned availability guards: validate provider schedule before insert.
- `notification-service`: notify the provider after booking creation in a later slice.
- `payment-service`: excluded from initial pending booking creation; add only when payment capture is introduced.

## Package Units

Package the backend as service deployables, not as a public npm package.

`backend/package.json` is private, so it should not be published as a shared npm package. Shared npm usage remains limited to platform dependencies such as `@implementsprint/sdk`.

### P0 Package Units

- `servease-api-gateway`
- `servease-auth-service`
- `servease-user-service`
- `servease-catalog-service`
- `servease-booking-service`
- `servease-availability-service`
- `servease-notification-service`

### P1 Package Units

- `servease-payment-service`
- `servease-messaging-service`
- `servease-review-service`

### P2 Package Units

- `servease-support-service`
- `servease-admin-service`

## Deployment Configuration

If this repository is moved to the ImplementSprint central backend pipeline, configure one system entry per deployable backend app.

The checked-in deployment artifacts are:

- `backend/Dockerfile`: reusable NestJS backend image build.
- `backend/deploy/backend-systems.json`: one service package entry per gateway or internal backend service.

The Dockerfile builds the monorepo once and starts the service selected by `SERVICE_MAIN`. Package registries still require a GitHub token with `read:packages` because the backend depends on `@implementsprint/sdk`.

Target shape:

```json
[
  {
    "name": "servease-api-gateway",
    "dir": ".",
    "install_dir": ".",
    "project": "api-gateway",
    "image": "ghcr.io/implementsprint/servease-api-gateway",
    "backend_stack": "nestjs",
    "version_stream": "api-gateway",
    "test_command": "npm run test -- --runInBand",
    "build_command": "npm run build",
    "dockerfile_path": "apps/api-gateway/Dockerfile",
    "k6_script_path": "tests/performance/api-gateway-smoke.js"
  },
  {
    "name": "servease-booking-service",
    "dir": ".",
    "install_dir": ".",
    "project": "booking-service",
    "image": "ghcr.io/implementsprint/servease-booking-service",
    "backend_stack": "nestjs",
    "version_stream": "booking-service",
    "test_command": "npm run test -- --runInBand",
    "build_command": "npm run build",
    "dockerfile_path": "apps/booking-service/Dockerfile",
    "k6_script_path": "tests/performance/booking-service-smoke.js"
  }
]
```

The committed `backend/deploy/backend-systems.json` includes all current backend apps.

## External Registration Target

If ServEase must be registered with API Center for other tribes, register only the API Gateway as the public service.

The checked-in registration payload is `tribe-manifest.json`. Replace `baseUrl` with the real deployed gateway URL before registering it.

```json
{
  "serviceId": "servease",
  "name": "ServEase API Gateway",
  "serviceType": "tribe",
  "baseUrl": "https://api.servease.example",
  "requiredScopes": ["tribe:servease:read", "tribe:servease:write"],
  "exposes": [
    "/v1/catalog/categories",
    "/v1/catalog/services",
    "/v1/catalog/providers",
    "/v1/bookings",
    "/v1/bookings/:bookingId"
  ],
  "consumes": ["email", "sms", "geo", "payment"],
  "healthCheck": "/health/ready",
  "version": "1.0.0"
}
```

Do not register internal `/internal/...` routes with API Center.

## Rollout Order

1. Stabilize gateway health and service health checks.
2. Stabilize catalog browse contracts.
3. Stabilize create booking, booking detail, booking list, and booking status contracts.
4. Stabilize provider availability contracts.
5. Add notification contracts for booking creation and status changes.
6. Add payment contracts when pending bookings need checkout or capture.
7. Add messaging, reviews, support, and admin contracts after the core booking flow is stable.
8. Add package/deploy entries only for services with Dockerfiles, smoke scripts, and health checks.
9. Add API Center registration for the gateway only after public route exposure is agreed.
10. Revisit Kafka or Databricks only through a separate platform integration spec.

## Execution Checklist

Use this checklist to move from decisions to implementation without re-opening the architecture.

| Phase | Work Item | Required Files Or Evidence | Completion Gate |
| --- | --- | --- | --- |
| 0 | Confirm the boundary decision | `docs/specs/service-contract-package-plan.md` | API Gateway is the only external ServEase contract |
| 1 | Align existing contract docs | `docs/specs/auth-profile.md`, `docs/specs/identity-shared-service-contracts.md`, `docs/specs/catalog.md`, `docs/specs/booking.md`, `docs/specs/availability.md`, `docs/specs/provider-availability.md`, `docs/specs/notifications.md`, `docs/specs/messaging.md`, `docs/specs/payments.md`, `docs/specs/reviews.md`, `docs/specs/support.md` | Each changed feature spec names public route, internal route, owner, request, response, errors, and verification |
| 2 | Stabilize health contracts | Gateway and service health controllers under `backend/apps/*/src/features/health` | `GET /health/live` and `GET /health/ready` are available for every packaged runtime |
| 3 | Stabilize catalog browse | Gateway catalog controller/client and Catalog Service internal routes | `npm run smoke:catalog` passes before package rollout |
| 4 | Stabilize booking lifecycle | Gateway booking controller/client, Booking Service lifecycle routes, booking spec | `npm run smoke:booking` and booking unit tests pass |
| 5 | Stabilize availability | Gateway availability controller/client and Availability Service routes | `npm run smoke:availability` passes |
| 6 | Stabilize notifications | Gateway notification controller/client and Notification Service routes | Device registration and notification list tests pass |
| 7 | Add package definitions | Service Dockerfiles or equivalent deploy commands plus central-pipeline JSON | Each listed package unit has a build command, health check, image name, and smoke target |
| 8 | Register public exposure | API Center manifest or equivalent registry payload | Only gateway `/v1/...` routes are registered; no `/internal/...` route is exposed |
| 9 | Platform integrations | Separate platform integration spec | Kafka, Databricks, or AWS work exists only behind an approved separate spec |

### Immediate Next Backlog

1. Compare the existing feature specs against this checklist and patch any missing owner, route, response, error, or verification details.
2. Add service Dockerfiles only after the P0 routes are stable and smoke-tested.
3. Create the actual central-pipeline repository variable from `backend/deploy/backend-systems.json`.
4. Register `tribe-manifest.json` only after replacing the placeholder production gateway base URL.
5. Defer Kafka/Databricks until the platform provides a written integration contract.

## Acceptance Criteria

- Every cross-process feature names one public gateway route and one internal service route.
- Every route names one owning service and one data owner.
- Clients call only `/v1/...` gateway routes or approved Next.js proxy routes.
- Internal services remain hidden behind gateway and environment-defined URLs.
- Package units map to deployable services in `backend/deploy/backend-systems.json`, not shared DTO libraries.
- API Center registration is represented by `tribe-manifest.json` and exposes gateway `/v1/...` routes only.
- No Kafka, RabbitMQ, event bus, Databricks, or direct AWS data-pipeline work is introduced by this plan.

## Verification

Documentation-only verification:

```sh
sed -n '1,260p' docs/specs/service-contract-package-plan.md
node -e "JSON.parse(require('fs').readFileSync('tribe-manifest.json', 'utf8'))"
node -e "JSON.parse(require('fs').readFileSync('backend/deploy/backend-systems.json', 'utf8'))"
```

Implementation verification remains feature-specific. For backend contract changes use:

```sh
cd backend
npm run lint
npm run test
npm run build
npm run check:migrations
```
