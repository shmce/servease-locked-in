# ServEase Call Flows

Last verified from code: 2026-05-20.

This document summarizes the active request flows across the ServEase app surfaces,
API Gateway, HTTP services, and service-owned Supabase schemas. Editable diagram
sources live in [`docs/diagrams/source`](diagrams/source), and generated exports
live in [`docs/diagrams/exports`](diagrams/exports).

## Flow Rules

- Public clients call only the API Gateway on port `5001`.
- Public JSON routes are under `/v1`; service routes are under `/internal`.
- Services communicate over HTTP only. There is no Kafka, RabbitMQ, event bus, or
  direct cross-service database access.
- The gateway validates public auth, forwards user context, normalizes errors,
  and touches Supabase Storage only for upload workflows.
- Each service reads and writes only its owned schema objects.

## Login And Profile Load

Primary diagram: [`10-login-profile-sequence.mmd`](diagrams/source/10-login-profile-sequence.mmd).

| Step | Caller | Contract | Owner | Result |
| ---: | --- | --- | --- | --- |
| 1 | Mobile/Web | Supabase auth token request | Supabase Auth | Access token |
| 2 | Client | `GET /v1/me` | API Gateway | Authenticated current-user request |
| 3 | Gateway | `GET /internal/users/:userId` | Auth Service | User role and account context |
| 4 | Gateway | `GET /internal/users/:userId/customer-profile` | User Service | Customer profile fields |
| 5 | Gateway | `GET /internal/providers/by-user/:userId` | Catalog Service | Provider profile snapshot if present |
| 6 | Gateway | Response envelope `{ data: CurrentUserProfile }` | API Gateway | Client routes to customer, provider, or admin experience |

Related contracts: [`docs/api-contracts.md#v1me`](api-contracts.md#v1me), [`docs/specs/auth-profile.md`](specs/auth-profile.md).

## Catalog Browse

Primary diagram: [`11-catalog-browse-sequence.mmd`](diagrams/source/11-catalog-browse-sequence.mmd).

| Step | Caller | Contract | Owner | Result |
| ---: | --- | --- | --- | --- |
| 1 | Client | `GET /v1/catalog/categories` | Gateway -> Catalog Service | Category list |
| 2 | Client | `GET /v1/catalog/services?categoryId=...` | Gateway -> Catalog Service | Service list |
| 3 | Client | `GET /v1/catalog/providers?serviceId=...` | Gateway -> Catalog Service | Provider listings |
| 4 | Client | `GET /v1/catalog/providers/:providerId/portfolio` | Gateway -> Catalog Service | Provider media |
| 5 | Client | `GET /v1/reviews?providerId=...` | Gateway -> Review Service | Public review summaries |

Related contracts: [`docs/api-contracts.md#v1catalog`](api-contracts.md#v1catalog), [`docs/specs/catalog.md`](specs/catalog.md).

## Provider Availability Management

Primary diagrams: [`09-provider-job-activity.mmd`](diagrams/source/09-provider-job-activity.mmd), [`12-booking-creation-sequence.mmd`](diagrams/source/12-booking-creation-sequence.mmd).

| Step | Caller | Contract | Owner | Result |
| ---: | --- | --- | --- | --- |
| 1 | Provider client | `GET /v1/provider/availability` | Gateway -> Availability Service | Current schedule |
| 2 | Provider client | `PUT /v1/provider/availability/windows` | Gateway -> Availability Service | Replaced weekly windows |
| 3 | Provider client | `POST /v1/provider/availability/days-off` | Gateway -> Availability Service | Added full-day block |
| 4 | Provider client | `DELETE /v1/provider/availability/days-off/:offDate` | Gateway -> Availability Service | Removed full-day block |
| 5 | Provider client | `POST /v1/provider/availability/time-off` | Gateway -> Availability Service | Added partial-day block |
| 6 | Provider client | `DELETE /v1/provider/availability/time-off/:id` | Gateway -> Availability Service | Removed partial-day block |
| 7 | Customer client | `GET /v1/provider/availability/:providerId` | Gateway -> Availability Service | Public availability with `windows`, `daysOff`, and `timeOffWindows` |

Time-off writes reject windows less than two days from today with `422 time_off_too_soon` and active-booking overlaps with `409 time_off_conflicts_booking`.

Related contracts: [`docs/api-contracts.md#provider-availability-and-pricing`](api-contracts.md#provider-availability-and-pricing), [`docs/specs/provider-availability-time-blocking.md`](specs/provider-availability-time-blocking.md).

## Booking Creation

Primary diagram: [`12-booking-creation-sequence.mmd`](diagrams/source/12-booking-creation-sequence.mmd).

| Step | Caller | Contract | Owner | Result |
| ---: | --- | --- | --- | --- |
| 1 | Customer client | `POST /v1/bookings` | API Gateway | Authenticated booking request |
| 2 | Gateway | `POST /internal/bookings` | Booking Service | Booking lifecycle starts |
| 3 | Booking Service | Catalog lookup over HTTP | Catalog Service | Provider and service data |
| 4 | Booking Service | Availability validation over HTTP | Availability Service | Weekly windows, days off, time off, and booking conflicts checked |
| 5 | Booking Service | Service-owned writes | Booking schema | Booking and timeline event saved |
| 6 | Gateway | Response envelope `{ data: BookingSummary }` | API Gateway | Client shows pending booking |

Related contracts: [`docs/api-contracts.md#v1bookings`](api-contracts.md#v1bookings), [`docs/specs/booking.md`](specs/booking.md).

## Booking Status And Tracking

Primary diagrams: [`07-booking-state-machine.mmd`](diagrams/source/07-booking-state-machine.mmd), [`13-provider-status-update-sequence.mmd`](diagrams/source/13-provider-status-update-sequence.mmd).

| Step | Caller | Contract | Owner | Result |
| ---: | --- | --- | --- | --- |
| 1 | Customer/provider client | `GET /v1/bookings?scope=customer|provider` | Gateway -> Booking Service | Role-scoped booking list |
| 2 | Client | `GET /v1/bookings/:bookingId` | Gateway -> Booking Service | Booking detail |
| 3 | Provider/client | `PATCH /v1/bookings/:bookingId/status` | Gateway -> Booking Service | Valid state transition |
| 4 | Provider client | `PATCH /v1/bookings/:bookingId/tracking/location` | Gateway -> Booking Service | Live location snapshot |
| 5 | Client | `GET /v1/bookings/:bookingId/tracking` | Gateway -> Booking Service | Latest tracking snapshot |
| 6 | Client | `GET /v1/bookings/:bookingId/tracking/stream` | Gateway -> Booking Service | SSE tracking events |
| 7 | Gateway/service | `POST /internal/notifications` | Notification Service | Status notification queued |

Related contracts: [`docs/api-contracts.md#v1bookings`](api-contracts.md#v1bookings), [`docs/specs/booking-read.md`](specs/booking-read.md).

## Payment Checkout And Payouts

Primary diagram: [`15-payment-reservation-sequence.mmd`](diagrams/source/15-payment-reservation-sequence.mmd).

| Step | Caller | Contract | Owner | Result |
| ---: | --- | --- | --- | --- |
| 1 | Customer client | `POST /v1/payments/checkout-sessions` | Gateway -> Payment Service | APICenter checkout session |
| 2 | Client | `GET /v1/payments/checkout-sessions/:checkoutId/status` | Gateway -> Payment Service | Checkout/payment status |
| 3 | APICenter | `POST /v1/payments/webhooks/apicenter` | Gateway -> Payment Service | Webhook reconciliation |
| 4 | Customer client | `GET/PUT/DELETE /v1/payments/methods...` | Gateway -> Payment Service | Customer method management |
| 5 | Provider client | `GET/PUT /v1/payments/payout-methods` | Gateway -> Payment Service | Payout method management |
| 6 | Provider client | `POST /v1/payments/payouts` | Gateway -> Payment Service | Payout request |
| 7 | Admin client | `/v1/admin/payments...`, `/v1/admin/refunds...`, `/v1/admin/settlements...` | Gateway -> Admin/Payment services | Payment operations |

Checkout sessions and payout requests support `Idempotency-Key`.

Related contracts: [`docs/api-contracts.md#payments`](api-contracts.md#payments), [`docs/specs/payments.md`](specs/payments.md), [`docs/runbooks/apicenter-payment-webhook.md`](runbooks/apicenter-payment-webhook.md).

## Messaging

Primary diagram: [`14-messaging-sequence.mmd`](diagrams/source/14-messaging-sequence.mmd).

| Step | Caller | Contract | Owner | Result |
| ---: | --- | --- | --- | --- |
| 1 | Client | `GET /v1/conversations` | Gateway -> Messaging Service | Conversation list |
| 2 | Client | `POST /v1/conversations` | Gateway -> Messaging Service | Get or create booking conversation |
| 3 | Client | `GET /v1/conversations/:conversationId/messages` | Gateway -> Messaging Service | Message history |
| 4 | Client | `POST /v1/conversations/:conversationId/messages` | Gateway -> Messaging Service | Message inserted |
| 5 | Gateway/service | `POST /internal/notifications` | Notification Service | Recipient notification queued |

Related contracts: [`docs/api-contracts.md#messaging-reviews-support-notifications-geo-referrals-uploads`](api-contracts.md#messaging-reviews-support-notifications-geo-referrals-uploads), [`docs/specs/messaging.md`](specs/messaging.md).

## Reviews

Primary diagram: [`16-review-submission-sequence.mmd`](diagrams/source/16-review-submission-sequence.mmd).

| Step | Caller | Contract | Owner | Result |
| ---: | --- | --- | --- | --- |
| 1 | Customer client | `POST /v1/reviews` | Gateway -> Review Service | Review request |
| 2 | Review Service | Booking verification over HTTP | Booking Service | Completed booking and participant validation |
| 3 | Review Service | Service-owned writes | Trust and reputation schema | Review saved |
| 4 | Review Service | Provider rating update over HTTP | Catalog Service | Provider rating summary updated |
| 5 | Provider client | `POST /v1/reviews/:reviewId/reply` | Gateway -> Review Service | Provider response saved |
| 6 | Client/admin | `POST /v1/reviews/:reviewId/flag`, `PATCH /v1/admin/reviews/:reviewId/flag` | Gateway -> Review Service | Moderation flag updated |

Related contracts: [`docs/specs/reviews.md`](specs/reviews.md).

## Support And Admin Operations

Primary diagram: [`17-support-ticket-sequence.mmd`](diagrams/source/17-support-ticket-sequence.mmd).

| Step | Caller | Contract | Owner | Result |
| ---: | --- | --- | --- | --- |
| 1 | Client | `GET /v1/support/tickets` | Gateway -> Support Service | User ticket list |
| 2 | Client | `POST /v1/support/tickets` | Gateway -> Support Service | Ticket created |
| 3 | Client | `GET /v1/support/tickets/:ticketId/replies` | Gateway -> Support Service | Ticket conversation |
| 4 | Client | `POST /v1/support/tickets/:ticketId/replies` | Gateway -> Support Service | Reply added |
| 5 | Admin client | `GET /v1/admin/support/tickets` | Gateway -> Admin Service -> Support Service | Admin queue |
| 6 | Admin client | `PATCH /v1/admin/support/tickets/:ticketId/status` | Gateway -> Admin Service -> Support Service | Ticket status updated |
| 7 | Admin client | `PATCH /v1/admin/support/tickets/:ticketId/assignee` | Gateway -> Admin Service -> Support Service | Assignee updated |

Related contracts: [`docs/specs/support.md`](specs/support.md), [`docs/specs/admin-support.md`](specs/admin-support.md).

## Notifications, Preferences, Geo, Referrals, And Uploads

| Flow | Public contract | Internal owner |
| --- | --- | --- |
| Notification inbox | `GET /v1/notifications`, `PATCH /v1/notifications/:notificationId/read` | Notification Service |
| Push device registration | `POST /v1/notifications/devices`, `DELETE /v1/notifications/devices/:token` | Notification Service |
| User preferences | `GET /v1/me/preferences`, `PUT /v1/me/preferences` | User Service |
| Geocoding and directions | `POST /v1/geo/geocode`, `POST /v1/geo/reverse-geocode`, `POST /v1/geo/geofence/check`, `POST /v1/geo/directions` | User Service shared geo |
| Referrals | `GET /v1/referrals` | User Service |
| Uploads | `POST /v1/uploads` multipart form | API Gateway with Supabase Storage |

Related contracts: [`docs/api-contracts.md`](api-contracts.md), [`docs/media-upload-spec.md`](media-upload-spec.md), [`docs/specs/notifications.md`](specs/notifications.md), [`docs/specs/openrouteservice-directions.md`](specs/openrouteservice-directions.md).

