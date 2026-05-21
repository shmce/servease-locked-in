# Internal Service Contracts

Last verified from code: 2026-05-20.

This document is the exact internal HTTP route inventory for the NestJS service controllers under `backend/apps/*-service/src`. Public clients must not call these routes. The API Gateway and sibling services call them over HTTP through environment-defined service URLs.

## Boundary Rules

- Internal routes are service-to-service contracts only.
- Route paths under `/internal/...` are not public API Gateway contracts.
- Every service owns its request/response DTOs locally; do not import DTOs across service boundaries.
- Use HTTP clients and environment variables for service calls. Do not add event buses, shared databases, or direct cross-service table access.
- Every service also exposes `GET /health/live` and `GET /health/ready`.

## Service Summary

| Service | Port | Responsibility |
| --- | ---: | --- |
| `admin-service` | 8511 | Admin orchestration facade for audit logs, bookings, catalog, payments, providers, reports, integrations, disputes, support, broadcasts, and users. |
| `auth-service` | 8501 | Registration, password reset/change, current user identity, sessions, two-factor state, and shared auth helpers. |
| `availability-service` | 8505 | Provider weekly availability, full-day blocks, and partial-day time-off blocks. |
| `booking-service` | 8504 | Booking lifecycle, tracking, attachments, disputes, service updates, admin booking operations, and admin disputes. |
| `catalog-service` | 8503 | Catalog browse, provider profiles, provider applications, portfolio, provider services, and admin catalog/provider moderation. |
| `messaging-service` | 8506 | Booking conversations and messages. |
| `notification-service` | 8509 | Notification inbox, push device registration, shared email, and shared SMS helpers. |
| `payment-service` | 8507 | Payments, checkout sessions, shared payment-provider resources, payout methods, payouts, admin payment operations, and pricing engine data. |
| `review-service` | 8508 | Public reviews, provider replies, review flags, and admin review moderation reads. |
| `support-service` | 8510 | User support tickets, replies, and admin support queue operations. |
| `user-service` | 8502 | Customer profile, preferences, referrals, shared geo helpers, and admin user reads/status changes. |

## Exact Route Inventory

### admin-service

Port: `8511`.

DTO source: Use admin feature-local `*.types.ts` files under `backend/apps/admin-service/src/features/*`.

| Method | Path | Feature | Source |
| --- | --- | --- | --- |
| GET | `/internal/admin/audit-logs` | audit | `backend/apps/admin-service/src/features/audit/admin-audit.controller.ts` |
| POST | `/internal/admin/audit-logs` | audit | `backend/apps/admin-service/src/features/audit/admin-audit.controller.ts` |
| GET | `/internal/admin/bookings/operations/alerts` | bookings | `backend/apps/admin-service/src/features/bookings/admin-booking.controller.ts` |
| GET | `/internal/admin/bookings/summary` | bookings | `backend/apps/admin-service/src/features/bookings/admin-booking.controller.ts` |
| GET | `/internal/admin/bookings` | bookings | `backend/apps/admin-service/src/features/bookings/admin-booking.controller.ts` |
| GET | `/internal/admin/bookings/:bookingId` | bookings | `backend/apps/admin-service/src/features/bookings/admin-booking.controller.ts` |
| POST | `/internal/admin/bookings/:bookingId/cancel` | bookings | `backend/apps/admin-service/src/features/bookings/admin-booking.controller.ts` |
| GET | `/internal/admin/bookings/:bookingId/messages` | bookings | `backend/apps/admin-service/src/features/bookings/admin-booking.controller.ts` |
| POST | `/internal/admin/bookings/:bookingId/messages` | bookings | `backend/apps/admin-service/src/features/bookings/admin-booking.controller.ts` |
| POST | `/internal/admin/bookings/:bookingId/escalate` | bookings | `backend/apps/admin-service/src/features/bookings/admin-booking.controller.ts` |
| GET | `/internal/admin/broadcasts` | broadcasts | `backend/apps/admin-service/src/features/broadcasts/admin-broadcast.controller.ts` |
| POST | `/internal/admin/broadcasts` | broadcasts | `backend/apps/admin-service/src/features/broadcasts/admin-broadcast.controller.ts` |
| GET | `/internal/admin/catalog/categories` | catalog | `backend/apps/admin-service/src/features/catalog/admin-catalog.controller.ts` |
| POST | `/internal/admin/catalog/categories` | catalog | `backend/apps/admin-service/src/features/catalog/admin-catalog.controller.ts` |
| PATCH | `/internal/admin/catalog/categories/:categoryId` | catalog | `backend/apps/admin-service/src/features/catalog/admin-catalog.controller.ts` |
| DELETE | `/internal/admin/catalog/categories/:categoryId` | catalog | `backend/apps/admin-service/src/features/catalog/admin-catalog.controller.ts` |
| GET | `/internal/admin/catalog/services` | catalog | `backend/apps/admin-service/src/features/catalog/admin-catalog.controller.ts` |
| POST | `/internal/admin/catalog/services` | catalog | `backend/apps/admin-service/src/features/catalog/admin-catalog.controller.ts` |
| PATCH | `/internal/admin/catalog/services/:serviceId` | catalog | `backend/apps/admin-service/src/features/catalog/admin-catalog.controller.ts` |
| DELETE | `/internal/admin/catalog/services/:serviceId` | catalog | `backend/apps/admin-service/src/features/catalog/admin-catalog.controller.ts` |
| GET | `/internal/admin/catalog/providers` | catalog | `backend/apps/admin-service/src/features/catalog/admin-catalog.controller.ts` |
| GET | `/internal/admin/catalog/providers/:providerId` | catalog | `backend/apps/admin-service/src/features/catalog/admin-catalog.controller.ts` |
| PATCH | `/internal/admin/catalog/providers/:providerId/status` | catalog | `backend/apps/admin-service/src/features/catalog/admin-catalog.controller.ts` |
| GET | `/internal/admin/disputes` | disputes | `backend/apps/admin-service/src/features/disputes/admin-dispute.controller.ts` |
| GET | `/internal/admin/disputes/:disputeId` | disputes | `backend/apps/admin-service/src/features/disputes/admin-dispute.controller.ts` |
| POST | `/internal/admin/disputes/:disputeId/resolve` | disputes | `backend/apps/admin-service/src/features/disputes/admin-dispute.controller.ts` |
| GET | `/health/live` | health | `backend/apps/admin-service/src/features/health/health.controller.ts` |
| GET | `/health/ready` | health | `backend/apps/admin-service/src/features/health/health.controller.ts` |
| GET | `/internal/admin/integrations` | integrations | `backend/apps/admin-service/src/features/integrations/admin-integration.controller.ts` |
| PATCH | `/internal/admin/integrations/:provider/credentials` | integrations | `backend/apps/admin-service/src/features/integrations/admin-integration.controller.ts` |
| POST | `/internal/admin/integrations/:provider/test` | integrations | `backend/apps/admin-service/src/features/integrations/admin-integration.controller.ts` |
| GET | `/internal/admin/payments` | payments | `backend/apps/admin-service/src/features/payments/admin-payment.controller.ts` |
| GET | `/internal/admin/payments/payouts` | payments | `backend/apps/admin-service/src/features/payments/admin-payment.controller.ts` |
| PATCH | `/internal/admin/payments/payouts/:payoutId/status` | payments | `backend/apps/admin-service/src/features/payments/admin-payment.controller.ts` |
| GET | `/internal/admin/payments/payouts/:payoutId/events` | payments | `backend/apps/admin-service/src/features/payments/admin-payment.controller.ts` |
| POST | `/internal/admin/payments/payouts/:payoutId/events` | payments | `backend/apps/admin-service/src/features/payments/admin-payment.controller.ts` |
| GET | `/internal/admin/payments/refunds` | payments | `backend/apps/admin-service/src/features/payments/admin-payment.controller.ts` |
| POST | `/internal/admin/payments/refunds/:refundId/approve` | payments | `backend/apps/admin-service/src/features/payments/admin-payment.controller.ts` |
| POST | `/internal/admin/payments/refunds/:refundId/reject` | payments | `backend/apps/admin-service/src/features/payments/admin-payment.controller.ts` |
| GET | `/internal/admin/payments/commission-rules` | payments | `backend/apps/admin-service/src/features/payments/admin-payment.controller.ts` |
| PATCH | `/internal/admin/payments/commission-rules/:ruleId` | payments | `backend/apps/admin-service/src/features/payments/admin-payment.controller.ts` |
| POST | `/internal/admin/payments/:paymentId/failure` | payments | `backend/apps/admin-service/src/features/payments/admin-payment.controller.ts` |
| POST | `/internal/admin/payments/:paymentId/retry` | payments | `backend/apps/admin-service/src/features/payments/admin-payment.controller.ts` |
| POST | `/internal/admin/payments/:paymentId/apicenter-sync` | payments | `backend/apps/admin-service/src/features/payments/admin-payment.controller.ts` |
| GET | `/internal/admin/payments/:paymentId` | payments | `backend/apps/admin-service/src/features/payments/admin-payment.controller.ts` |
| PATCH | `/internal/admin/payments/:paymentId/status` | payments | `backend/apps/admin-service/src/features/payments/admin-payment.controller.ts` |
| GET | `/internal/admin/pricing/rules` | payments | `backend/apps/admin-service/src/features/payments/admin-pricing.controller.ts` |
| PUT | `/internal/admin/pricing/rules` | payments | `backend/apps/admin-service/src/features/payments/admin-pricing.controller.ts` |
| GET | `/internal/admin/pricing/fuel-index` | payments | `backend/apps/admin-service/src/features/payments/admin-pricing.controller.ts` |
| POST | `/internal/admin/pricing/fuel-index` | payments | `backend/apps/admin-service/src/features/payments/admin-pricing.controller.ts` |
| GET | `/internal/admin/pricing/quote-audits` | payments | `backend/apps/admin-service/src/features/payments/admin-pricing.controller.ts` |
| GET | `/internal/admin/promotions` | payments | `backend/apps/admin-service/src/features/payments/admin-promotion.controller.ts` |
| POST | `/internal/admin/promotions` | payments | `backend/apps/admin-service/src/features/payments/admin-promotion.controller.ts` |
| PATCH | `/internal/admin/promotions/:promotionId` | payments | `backend/apps/admin-service/src/features/payments/admin-promotion.controller.ts` |
| DELETE | `/internal/admin/promotions/:promotionId` | payments | `backend/apps/admin-service/src/features/payments/admin-promotion.controller.ts` |
| GET | `/internal/admin/provider-applications` | provider-applications | `backend/apps/admin-service/src/features/provider-applications/admin-provider-application.controller.ts` |
| GET | `/internal/admin/provider-applications/:applicationId` | provider-applications | `backend/apps/admin-service/src/features/provider-applications/admin-provider-application.controller.ts` |
| GET | `/internal/admin/provider-applications/:applicationId/documents/:documentId` | provider-applications | `backend/apps/admin-service/src/features/provider-applications/admin-provider-application.controller.ts` |
| GET | `/internal/admin/provider-applications/:applicationId/review` | provider-applications | `backend/apps/admin-service/src/features/provider-applications/admin-provider-application.controller.ts` |
| PUT | `/internal/admin/provider-applications/:applicationId/review` | provider-applications | `backend/apps/admin-service/src/features/provider-applications/admin-provider-application.controller.ts` |
| POST | `/internal/admin/provider-applications/:applicationId/review/notes` | provider-applications | `backend/apps/admin-service/src/features/provider-applications/admin-provider-application.controller.ts` |
| POST | `/internal/admin/provider-applications/:applicationId/approve` | provider-applications | `backend/apps/admin-service/src/features/provider-applications/admin-provider-application.controller.ts` |
| POST | `/internal/admin/provider-applications/:applicationId/reject` | provider-applications | `backend/apps/admin-service/src/features/provider-applications/admin-provider-application.controller.ts` |
| GET | `/internal/admin/reports/schedules` | reports | `backend/apps/admin-service/src/features/reports/admin-report.controller.ts` |
| POST | `/internal/admin/reports/schedules` | reports | `backend/apps/admin-service/src/features/reports/admin-report.controller.ts` |
| POST | `/internal/admin/reports/schedules/deliver-due` | reports | `backend/apps/admin-service/src/features/reports/admin-report.controller.ts` |
| GET | `/internal/admin/support/tickets` | support | `backend/apps/admin-service/src/features/support/admin-support.controller.ts` |
| GET | `/internal/admin/support/tickets/:ticketId` | support | `backend/apps/admin-service/src/features/support/admin-support.controller.ts` |
| PATCH | `/internal/admin/support/tickets/:ticketId/status` | support | `backend/apps/admin-service/src/features/support/admin-support.controller.ts` |
| POST | `/internal/admin/users` | users | `backend/apps/admin-service/src/features/users/admin-users.controller.ts` |
| GET | `/internal/admin/users/summary` | users | `backend/apps/admin-service/src/features/users/admin-users.controller.ts` |
| GET | `/internal/admin/users` | users | `backend/apps/admin-service/src/features/users/admin-users.controller.ts` |
| PATCH | `/internal/admin/users/:userId/status` | users | `backend/apps/admin-service/src/features/users/admin-users.controller.ts` |
| PATCH | `/internal/admin/users/:userId/access` | users | `backend/apps/admin-service/src/features/users/admin-users.controller.ts` |
| DELETE | `/internal/admin/users/:userId` | users | `backend/apps/admin-service/src/features/users/admin-users.controller.ts` |

### auth-service

Port: `8501`.

DTO source: Use feature-local `*.types.ts` files under `backend/apps/auth-service/src/features/*`; auth-service also integrates with Supabase Auth.

| Method | Path | Feature | Source |
| --- | --- | --- | --- |
| POST | `/internal/auth/admin-users` | admin-users | `backend/apps/auth-service/src/features/admin-users/admin-user.controller.ts` |
| GET | `/health/live` | health | `backend/apps/auth-service/src/features/health/health.controller.ts` |
| GET | `/health/ready` | health | `backend/apps/auth-service/src/features/health/health.controller.ts` |
| GET | `/internal/users/:userId` | internal-user | `backend/apps/auth-service/src/features/internal-user/internal-user.controller.ts` |
| GET | `/internal/users/:userId/sessions` | internal-user | `backend/apps/auth-service/src/features/internal-user/internal-user.controller.ts` |
| PATCH | `/internal/users/:userId` | internal-user | `backend/apps/auth-service/src/features/internal-user/internal-user.controller.ts` |
| DELETE | `/internal/users/:userId/account` | internal-user | `backend/apps/auth-service/src/features/internal-user/internal-user.controller.ts` |
| POST | `/internal/users/:userId/two-factor/enable` | internal-user | `backend/apps/auth-service/src/features/internal-user/internal-user.controller.ts` |
| POST | `/internal/users/:userId/two-factor/verify` | internal-user | `backend/apps/auth-service/src/features/internal-user/internal-user.controller.ts` |
| POST | `/internal/users/:userId/two-factor/disable` | internal-user | `backend/apps/auth-service/src/features/internal-user/internal-user.controller.ts` |
| POST | `/internal/auth/password-change` | password-change | `backend/apps/auth-service/src/features/password-change/password-change.controller.ts` |
| POST | `/internal/auth/password-reset` | password-reset | `backend/apps/auth-service/src/features/password-reset/password-reset.controller.ts` |
| POST | `/internal/auth/registrations` | registration | `backend/apps/auth-service/src/features/registration/registration.controller.ts` |
| DELETE | `/internal/auth/registrations/:userId` | registration | `backend/apps/auth-service/src/features/registration/registration.controller.ts` |
| POST | `/internal/auth/shared/otp/generate` | shared-auth | `backend/apps/auth-service/src/features/shared-auth/shared-auth.controller.ts` |
| POST | `/internal/auth/shared/otp/verify` | shared-auth | `backend/apps/auth-service/src/features/shared-auth/shared-auth.controller.ts` |
| GET | `/internal/auth/shared/otp/:otpId/status` | shared-auth | `backend/apps/auth-service/src/features/shared-auth/shared-auth.controller.ts` |
| POST | `/internal/auth/shared/google/authorize` | shared-auth | `backend/apps/auth-service/src/features/shared-auth/shared-auth.controller.ts` |
| POST | `/internal/auth/shared/google/token` | shared-auth | `backend/apps/auth-service/src/features/shared-auth/shared-auth.controller.ts` |
| POST | `/internal/auth/shared/google/token/refresh` | shared-auth | `backend/apps/auth-service/src/features/shared-auth/shared-auth.controller.ts` |
| POST | `/internal/auth/shared/google/logout` | shared-auth | `backend/apps/auth-service/src/features/shared-auth/shared-auth.controller.ts` |

### availability-service

Port: `8505`.

DTO source: Use `provider-availability.types.ts`; schedules include `windows`, `daysOff`, and `timeOffWindows`.

| Method | Path | Feature | Source |
| --- | --- | --- | --- |
| GET | `/health/live` | health | `backend/apps/availability-service/src/features/health/health.controller.ts` |
| GET | `/health/ready` | health | `backend/apps/availability-service/src/features/health/health.controller.ts` |
| GET | `/internal/providers/:providerId/availability` | provider-availability | `backend/apps/availability-service/src/features/provider-availability/provider-availability.controller.ts` |
| PUT | `/internal/providers/:providerId/availability/windows` | provider-availability | `backend/apps/availability-service/src/features/provider-availability/provider-availability.controller.ts` |
| POST | `/internal/providers/:providerId/availability/days-off` | provider-availability | `backend/apps/availability-service/src/features/provider-availability/provider-availability.controller.ts` |
| DELETE | `/internal/providers/:providerId/availability/days-off/:offDate` | provider-availability | `backend/apps/availability-service/src/features/provider-availability/provider-availability.controller.ts` |
| POST | `/internal/providers/:providerId/availability/time-off` | provider-availability | `backend/apps/availability-service/src/features/provider-availability/provider-availability.controller.ts` |
| DELETE | `/internal/providers/:providerId/availability/time-off/:id` | provider-availability | `backend/apps/availability-service/src/features/provider-availability/provider-availability.controller.ts` |

### booking-service

Port: `8504`.

DTO source: Use `booking-lifecycle.types.ts`, admin booking/dispute type files, and service-local error classes.

| Method | Path | Feature | Source |
| --- | --- | --- | --- |
| GET | `/internal/admin/bookings/operations/alerts` | admin-bookings | `backend/apps/booking-service/src/features/admin-bookings/admin-booking.controller.ts` |
| GET | `/internal/admin/bookings/summary` | admin-bookings | `backend/apps/booking-service/src/features/admin-bookings/admin-booking.controller.ts` |
| GET | `/internal/admin/bookings` | admin-bookings | `backend/apps/booking-service/src/features/admin-bookings/admin-booking.controller.ts` |
| GET | `/internal/admin/bookings/:bookingId` | admin-bookings | `backend/apps/booking-service/src/features/admin-bookings/admin-booking.controller.ts` |
| POST | `/internal/admin/bookings/:bookingId/cancel` | admin-bookings | `backend/apps/booking-service/src/features/admin-bookings/admin-booking.controller.ts` |
| GET | `/internal/admin/bookings/:bookingId/messages` | admin-bookings | `backend/apps/booking-service/src/features/admin-bookings/admin-booking.controller.ts` |
| POST | `/internal/admin/bookings/:bookingId/messages` | admin-bookings | `backend/apps/booking-service/src/features/admin-bookings/admin-booking.controller.ts` |
| POST | `/internal/admin/bookings/:bookingId/escalate` | admin-bookings | `backend/apps/booking-service/src/features/admin-bookings/admin-booking.controller.ts` |
| GET | `/internal/admin/disputes` | admin-disputes | `backend/apps/booking-service/src/features/admin-disputes/admin-dispute.controller.ts` |
| GET | `/internal/admin/disputes/:disputeId` | admin-disputes | `backend/apps/booking-service/src/features/admin-disputes/admin-dispute.controller.ts` |
| POST | `/internal/admin/disputes/:disputeId/resolve` | admin-disputes | `backend/apps/booking-service/src/features/admin-disputes/admin-dispute.controller.ts` |
| POST | `/internal/bookings` | booking-lifecycle | `backend/apps/booking-service/src/features/booking-lifecycle/booking-lifecycle.controller.ts` |
| GET | `/internal/bookings` | booking-lifecycle | `backend/apps/booking-service/src/features/booking-lifecycle/booking-lifecycle.controller.ts` |
| GET | `/internal/bookings/:bookingId/tracking` | booking-lifecycle | `backend/apps/booking-service/src/features/booking-lifecycle/booking-lifecycle.controller.ts` |
| PATCH | `/internal/bookings/:bookingId/tracking/location` | booking-lifecycle | `backend/apps/booking-service/src/features/booking-lifecycle/booking-lifecycle.controller.ts` |
| GET | `/internal/bookings/:bookingId` | booking-lifecycle | `backend/apps/booking-service/src/features/booking-lifecycle/booking-lifecycle.controller.ts` |
| PATCH | `/internal/bookings/:bookingId/status` | booking-lifecycle | `backend/apps/booking-service/src/features/booking-lifecycle/booking-lifecycle.controller.ts` |
| POST | `/internal/bookings/:bookingId/attachments` | booking-lifecycle | `backend/apps/booking-service/src/features/booking-lifecycle/booking-lifecycle.controller.ts` |
| DELETE | `/internal/bookings/:bookingId/attachments/:attachmentId` | booking-lifecycle | `backend/apps/booking-service/src/features/booking-lifecycle/booking-lifecycle.controller.ts` |
| POST | `/internal/bookings/:bookingId/disputes` | booking-lifecycle | `backend/apps/booking-service/src/features/booking-lifecycle/booking-lifecycle.controller.ts` |
| GET | `/internal/bookings/:bookingId/service-updates` | booking-lifecycle | `backend/apps/booking-service/src/features/booking-lifecycle/booking-lifecycle.controller.ts` |
| GET | `/internal/bookings/:bookingId/timeline` | booking-lifecycle | `backend/apps/booking-service/src/features/booking-lifecycle/booking-lifecycle.controller.ts` |
| POST | `/internal/bookings/:bookingId/service-updates` | booking-lifecycle | `backend/apps/booking-service/src/features/booking-lifecycle/booking-lifecycle.controller.ts` |
| GET | `/health/live` | health | `backend/apps/booking-service/src/features/health/health.controller.ts` |
| GET | `/health/ready` | health | `backend/apps/booking-service/src/features/health/health.controller.ts` |

### catalog-service

Port: `8503`.

DTO source: Use feature-local `*.types.ts` files under `backend/apps/catalog-service/src/features/*`.

| Method | Path | Feature | Source |
| --- | --- | --- | --- |
| GET | `/internal/admin/catalog/categories` | admin-catalog | `backend/apps/catalog-service/src/features/admin-catalog/admin-catalog.controller.ts` |
| POST | `/internal/admin/catalog/categories` | admin-catalog | `backend/apps/catalog-service/src/features/admin-catalog/admin-catalog.controller.ts` |
| PATCH | `/internal/admin/catalog/categories/:categoryId` | admin-catalog | `backend/apps/catalog-service/src/features/admin-catalog/admin-catalog.controller.ts` |
| DELETE | `/internal/admin/catalog/categories/:categoryId` | admin-catalog | `backend/apps/catalog-service/src/features/admin-catalog/admin-catalog.controller.ts` |
| GET | `/internal/admin/catalog/services` | admin-catalog | `backend/apps/catalog-service/src/features/admin-catalog/admin-catalog.controller.ts` |
| POST | `/internal/admin/catalog/services` | admin-catalog | `backend/apps/catalog-service/src/features/admin-catalog/admin-catalog.controller.ts` |
| PATCH | `/internal/admin/catalog/services/:serviceId` | admin-catalog | `backend/apps/catalog-service/src/features/admin-catalog/admin-catalog.controller.ts` |
| DELETE | `/internal/admin/catalog/services/:serviceId` | admin-catalog | `backend/apps/catalog-service/src/features/admin-catalog/admin-catalog.controller.ts` |
| GET | `/internal/admin/catalog/providers` | admin-catalog | `backend/apps/catalog-service/src/features/admin-catalog/admin-catalog.controller.ts` |
| GET | `/internal/admin/catalog/providers/:providerId` | admin-catalog | `backend/apps/catalog-service/src/features/admin-catalog/admin-catalog.controller.ts` |
| PATCH | `/internal/admin/catalog/providers/:providerId/status` | admin-catalog | `backend/apps/catalog-service/src/features/admin-catalog/admin-catalog.controller.ts` |
| GET | `/internal/catalog/categories` | catalog-browse | `backend/apps/catalog-service/src/features/catalog-browse/catalog-browse.controller.ts` |
| GET | `/internal/catalog/services` | catalog-browse | `backend/apps/catalog-service/src/features/catalog-browse/catalog-browse.controller.ts` |
| GET | `/internal/catalog/providers` | catalog-browse | `backend/apps/catalog-service/src/features/catalog-browse/catalog-browse.controller.ts` |
| GET | `/health/live` | health | `backend/apps/catalog-service/src/features/health/health.controller.ts` |
| GET | `/health/ready` | health | `backend/apps/catalog-service/src/features/health/health.controller.ts` |
| GET | `/internal/providers/by-user/:userId` | provider-profile | `backend/apps/catalog-service/src/features/provider-profile/provider-profile.controller.ts` |
| POST | `/internal/providers` | provider-profile | `backend/apps/catalog-service/src/features/provider-profile/provider-profile.controller.ts` |
| PATCH | `/internal/providers/by-user/:userId` | provider-profile | `backend/apps/catalog-service/src/features/provider-profile/provider-profile.controller.ts` |
| GET | `/internal/providers/applications` | provider-profile | `backend/apps/catalog-service/src/features/provider-profile/provider-profile.controller.ts` |
| GET | `/internal/providers/applications/:applicationId` | provider-profile | `backend/apps/catalog-service/src/features/provider-profile/provider-profile.controller.ts` |
| GET | `/internal/providers/applications/by-user/:userId` | provider-profile | `backend/apps/catalog-service/src/features/provider-profile/provider-profile.controller.ts` |
| GET | `/internal/providers/applications/:applicationId/documents/:documentId` | provider-profile | `backend/apps/catalog-service/src/features/provider-profile/provider-profile.controller.ts` |
| POST | `/internal/providers/applications/documents` | provider-profile | `backend/apps/catalog-service/src/features/provider-profile/provider-profile.controller.ts` |
| GET | `/internal/providers/applications/:applicationId/review` | provider-profile | `backend/apps/catalog-service/src/features/provider-profile/provider-profile.controller.ts` |
| PUT | `/internal/providers/applications/:applicationId/review` | provider-profile | `backend/apps/catalog-service/src/features/provider-profile/provider-profile.controller.ts` |
| POST | `/internal/providers/applications/:applicationId/review/notes` | provider-profile | `backend/apps/catalog-service/src/features/provider-profile/provider-profile.controller.ts` |
| POST | `/internal/providers/applications/:applicationId/decision` | provider-profile | `backend/apps/catalog-service/src/features/provider-profile/provider-profile.controller.ts` |
| GET | `/internal/providers/:providerId/portfolio` | provider-profile | `backend/apps/catalog-service/src/features/provider-profile/provider-profile.controller.ts` |
| POST | `/internal/providers/portfolio` | provider-profile | `backend/apps/catalog-service/src/features/provider-profile/provider-profile.controller.ts` |
| DELETE | `/internal/providers/portfolio/:mediaId` | provider-profile | `backend/apps/catalog-service/src/features/provider-profile/provider-profile.controller.ts` |
| PUT | `/internal/providers/portfolio/order` | provider-profile | `backend/apps/catalog-service/src/features/provider-profile/provider-profile.controller.ts` |
| PUT | `/internal/providers/portfolio/:mediaId` | provider-profile | `backend/apps/catalog-service/src/features/provider-profile/provider-profile.controller.ts` |
| GET | `/internal/providers/by-user/:userId/services` | provider-profile | `backend/apps/catalog-service/src/features/provider-profile/provider-profile.controller.ts` |
| PUT | `/internal/providers/by-user/:userId/services` | provider-profile | `backend/apps/catalog-service/src/features/provider-profile/provider-profile.controller.ts` |

### messaging-service

Port: `8506`.

DTO source: Use `conversation.types.ts`.

| Method | Path | Feature | Source |
| --- | --- | --- | --- |
| GET | `/internal/conversations` | conversations | `backend/apps/messaging-service/src/features/conversations/conversation.controller.ts` |
| POST | `/internal/conversations` | conversations | `backend/apps/messaging-service/src/features/conversations/conversation.controller.ts` |
| GET | `/internal/conversations/:conversationId` | conversations | `backend/apps/messaging-service/src/features/conversations/conversation.controller.ts` |
| GET | `/internal/conversations/:conversationId/messages` | conversations | `backend/apps/messaging-service/src/features/conversations/conversation.controller.ts` |
| POST | `/internal/conversations/:conversationId/messages` | conversations | `backend/apps/messaging-service/src/features/conversations/conversation.controller.ts` |
| GET | `/health/live` | health | `backend/apps/messaging-service/src/features/health/health.controller.ts` |
| GET | `/health/ready` | health | `backend/apps/messaging-service/src/features/health/health.controller.ts` |

### notification-service

Port: `8509`.

DTO source: Use notification and shared-messaging type files under `backend/apps/notification-service/src/features/*`.

| Method | Path | Feature | Source |
| --- | --- | --- | --- |
| GET | `/health/live` | health | `backend/apps/notification-service/src/features/health/health.controller.ts` |
| GET | `/health/ready` | health | `backend/apps/notification-service/src/features/health/health.controller.ts` |
| GET | `/internal/notifications` | notifications | `backend/apps/notification-service/src/features/notifications/notification.controller.ts` |
| POST | `/internal/notifications` | notifications | `backend/apps/notification-service/src/features/notifications/notification.controller.ts` |
| PATCH | `/internal/notifications/:notificationId/read` | notifications | `backend/apps/notification-service/src/features/notifications/notification.controller.ts` |
| POST | `/internal/notifications/devices` | notifications | `backend/apps/notification-service/src/features/notifications/notification.controller.ts` |
| DELETE | `/internal/notifications/devices/:token` | notifications | `backend/apps/notification-service/src/features/notifications/notification.controller.ts` |
| POST | `/internal/shared-messaging/email/send` | shared-messaging | `backend/apps/notification-service/src/features/shared-messaging/shared-messaging.controller.ts` |
| GET | `/internal/shared-messaging/email/status/:messageId` | shared-messaging | `backend/apps/notification-service/src/features/shared-messaging/shared-messaging.controller.ts` |
| POST | `/internal/shared-messaging/sms/send` | shared-messaging | `backend/apps/notification-service/src/features/shared-messaging/shared-messaging.controller.ts` |
| GET | `/internal/shared-messaging/sms/status/:messageId` | shared-messaging | `backend/apps/notification-service/src/features/shared-messaging/shared-messaging.controller.ts` |

### payment-service

Port: `8507`.

DTO source: Use payment and pricing-engine type files under `backend/apps/payment-service/src/features/*`.

| Method | Path | Feature | Source |
| --- | --- | --- | --- |
| GET | `/health/live` | health | `backend/apps/payment-service/src/features/health/health.controller.ts` |
| GET | `/health/ready` | health | `backend/apps/payment-service/src/features/health/health.controller.ts` |
| GET | `/internal/admin/payments` | payments | `backend/apps/payment-service/src/features/payments/payment-admin.controller.ts` |
| GET | `/internal/admin/payments/:paymentId` | payments | `backend/apps/payment-service/src/features/payments/payment-admin.controller.ts` |
| GET | `/internal/admin/payments/promotions` | payments | `backend/apps/payment-service/src/features/payments/payment-admin.controller.ts` |
| POST | `/internal/admin/payments/promotions` | payments | `backend/apps/payment-service/src/features/payments/payment-admin.controller.ts` |
| PATCH | `/internal/admin/payments/promotions/:promotionId` | payments | `backend/apps/payment-service/src/features/payments/payment-admin.controller.ts` |
| DELETE | `/internal/admin/payments/promotions/:promotionId` | payments | `backend/apps/payment-service/src/features/payments/payment-admin.controller.ts` |
| GET | `/internal/admin/payments/payouts` | payments | `backend/apps/payment-service/src/features/payments/payment-admin.controller.ts` |
| PATCH | `/internal/admin/payments/payouts/:payoutId/status` | payments | `backend/apps/payment-service/src/features/payments/payment-admin.controller.ts` |
| GET | `/internal/admin/payments/payouts/:payoutId/events` | payments | `backend/apps/payment-service/src/features/payments/payment-admin.controller.ts` |
| POST | `/internal/admin/payments/payouts/:payoutId/events` | payments | `backend/apps/payment-service/src/features/payments/payment-admin.controller.ts` |
| GET | `/internal/admin/payments/refunds` | payments | `backend/apps/payment-service/src/features/payments/payment-admin.controller.ts` |
| POST | `/internal/admin/payments/refunds/:refundId/approve` | payments | `backend/apps/payment-service/src/features/payments/payment-admin.controller.ts` |
| POST | `/internal/admin/payments/refunds/:refundId/reject` | payments | `backend/apps/payment-service/src/features/payments/payment-admin.controller.ts` |
| GET | `/internal/admin/payments/commission-rules` | payments | `backend/apps/payment-service/src/features/payments/payment-admin.controller.ts` |
| PATCH | `/internal/admin/payments/commission-rules/:ruleId` | payments | `backend/apps/payment-service/src/features/payments/payment-admin.controller.ts` |
| POST | `/internal/admin/payments/:paymentId/failure` | payments | `backend/apps/payment-service/src/features/payments/payment-admin.controller.ts` |
| POST | `/internal/admin/payments/:paymentId/retry` | payments | `backend/apps/payment-service/src/features/payments/payment-admin.controller.ts` |
| POST | `/internal/admin/payments/:paymentId/apicenter-sync` | payments | `backend/apps/payment-service/src/features/payments/payment-admin.controller.ts` |
| GET | `/internal/admin/payments/:paymentId` | payments | `backend/apps/payment-service/src/features/payments/payment-admin.controller.ts` |
| PATCH | `/internal/admin/payments/:paymentId/status` | payments | `backend/apps/payment-service/src/features/payments/payment-admin.controller.ts` |
| GET | `/internal/payments` | payments | `backend/apps/payment-service/src/features/payments/payment.controller.ts` |
| POST | `/internal/payments` | payments | `backend/apps/payment-service/src/features/payments/payment.controller.ts` |
| POST | `/internal/payments/promotions/validate` | payments | `backend/apps/payment-service/src/features/payments/payment.controller.ts` |
| POST | `/internal/payments/checkout-sessions` | payments | `backend/apps/payment-service/src/features/payments/payment.controller.ts` |
| GET | `/internal/payments/checkout-sessions/:checkoutId/status` | payments | `backend/apps/payment-service/src/features/payments/payment.controller.ts` |
| POST | `/internal/payments/checkout-sessions/webhook` | payments | `backend/apps/payment-service/src/features/payments/payment.controller.ts` |
| POST | `/internal/payments/shared-refunds` | payments | `backend/apps/payment-service/src/features/payments/payment.controller.ts` |
| POST | `/internal/payments/shared-customers` | payments | `backend/apps/payment-service/src/features/payments/payment.controller.ts` |
| POST | `/internal/payments/shared-products` | payments | `backend/apps/payment-service/src/features/payments/payment.controller.ts` |
| POST | `/internal/payments/shared-prices` | payments | `backend/apps/payment-service/src/features/payments/payment.controller.ts` |
| POST | `/internal/payments/shared-subscriptions` | payments | `backend/apps/payment-service/src/features/payments/payment.controller.ts` |
| GET | `/internal/payments/shared-subscriptions/:subscriptionId` | payments | `backend/apps/payment-service/src/features/payments/payment.controller.ts` |
| GET | `/internal/payments/shared-subscriptions/:subscriptionId/invoices` | payments | `backend/apps/payment-service/src/features/payments/payment.controller.ts` |
| GET | `/internal/payments/payout-account` | payments | `backend/apps/payment-service/src/features/payments/payment.controller.ts` |
| GET | `/internal/payments/payout-methods` | payments | `backend/apps/payment-service/src/features/payments/payment.controller.ts` |
| PUT | `/internal/payments/payout-methods` | payments | `backend/apps/payment-service/src/features/payments/payment.controller.ts` |
| GET | `/internal/payments/customer-methods` | payments | `backend/apps/payment-service/src/features/payments/payment.controller.ts` |
| PUT | `/internal/payments/customer-methods` | payments | `backend/apps/payment-service/src/features/payments/payment.controller.ts` |
| DELETE | `/internal/payments/customer-methods/:methodId` | payments | `backend/apps/payment-service/src/features/payments/payment.controller.ts` |
| GET | `/internal/payments/payouts` | payments | `backend/apps/payment-service/src/features/payments/payment.controller.ts` |
| POST | `/internal/payments/payouts` | payments | `backend/apps/payment-service/src/features/payments/payment.controller.ts` |
| POST | `/internal/pricing/quotes` | pricing-engine | `backend/apps/payment-service/src/features/pricing-engine/pricing-engine.controller.ts` |
| GET | `/internal/pricing/quotes/:quoteId/validation` | pricing-engine | `backend/apps/payment-service/src/features/pricing-engine/pricing-engine.controller.ts` |
| GET | `/internal/pricing/admin/rules` | pricing-engine | `backend/apps/payment-service/src/features/pricing-engine/pricing-engine.controller.ts` |
| PUT | `/internal/pricing/admin/rules` | pricing-engine | `backend/apps/payment-service/src/features/pricing-engine/pricing-engine.controller.ts` |
| GET | `/internal/pricing/admin/fuel-index` | pricing-engine | `backend/apps/payment-service/src/features/pricing-engine/pricing-engine.controller.ts` |
| POST | `/internal/pricing/admin/fuel-index` | pricing-engine | `backend/apps/payment-service/src/features/pricing-engine/pricing-engine.controller.ts` |
| GET | `/internal/pricing/admin/quote-audits` | pricing-engine | `backend/apps/payment-service/src/features/pricing-engine/pricing-engine.controller.ts` |

### review-service

Port: `8508`.

DTO source: Use `review.types.ts`.

| Method | Path | Feature | Source |
| --- | --- | --- | --- |
| GET | `/health/live` | health | `backend/apps/review-service/src/features/health/health.controller.ts` |
| GET | `/health/ready` | health | `backend/apps/review-service/src/features/health/health.controller.ts` |
| GET | `/internal/reviews` | reviews | `backend/apps/review-service/src/features/reviews/review.controller.ts` |
| POST | `/internal/reviews` | reviews | `backend/apps/review-service/src/features/reviews/review.controller.ts` |
| POST | `/internal/reviews/:reviewId/reply` | reviews | `backend/apps/review-service/src/features/reviews/review.controller.ts` |
| GET | `/internal/reviews/admin` | reviews | `backend/apps/review-service/src/features/reviews/review.controller.ts` |
| PATCH | `/internal/reviews/:reviewId/flagged` | reviews | `backend/apps/review-service/src/features/reviews/review.controller.ts` |
| POST | `/internal/reviews/:reviewId/flag` | reviews | `backend/apps/review-service/src/features/reviews/review.controller.ts` |

### support-service

Port: `8510`.

DTO source: Use ticket type files under `backend/apps/support-service/src/features/tickets`.

| Method | Path | Feature | Source |
| --- | --- | --- | --- |
| GET | `/health/live` | health | `backend/apps/support-service/src/features/health/health.controller.ts` |
| GET | `/health/ready` | health | `backend/apps/support-service/src/features/health/health.controller.ts` |
| GET | `/internal/admin/support/tickets` | tickets | `backend/apps/support-service/src/features/tickets/ticket-admin.controller.ts` |
| GET | `/internal/admin/support/tickets/:ticketId` | tickets | `backend/apps/support-service/src/features/tickets/ticket-admin.controller.ts` |
| PATCH | `/internal/admin/support/tickets/:ticketId/status` | tickets | `backend/apps/support-service/src/features/tickets/ticket-admin.controller.ts` |
| GET | `/internal/admin/support/tickets/:ticketId/replies` | tickets | `backend/apps/support-service/src/features/tickets/ticket-admin.controller.ts` |
| POST | `/internal/admin/support/tickets/:ticketId/replies` | tickets | `backend/apps/support-service/src/features/tickets/ticket-admin.controller.ts` |
| PATCH | `/internal/admin/support/tickets/:ticketId/assignee` | tickets | `backend/apps/support-service/src/features/tickets/ticket-admin.controller.ts` |
| GET | `/internal/support/tickets` | tickets | `backend/apps/support-service/src/features/tickets/ticket.controller.ts` |
| GET | `/internal/support/tickets/:ticketId` | tickets | `backend/apps/support-service/src/features/tickets/ticket.controller.ts` |
| GET | `/internal/support/tickets/:ticketId/replies` | tickets | `backend/apps/support-service/src/features/tickets/ticket.controller.ts` |
| POST | `/internal/support/tickets/:ticketId/replies` | tickets | `backend/apps/support-service/src/features/tickets/ticket.controller.ts` |
| POST | `/internal/support/tickets` | tickets | `backend/apps/support-service/src/features/tickets/ticket.controller.ts` |

### user-service

Port: `8502`.

DTO source: Use feature-local `*.types.ts` files under `backend/apps/user-service/src/features/*`.

| Method | Path | Feature | Source |
| --- | --- | --- | --- |
| GET | `/internal/admin/users/summary` | admin-users | `backend/apps/user-service/src/features/admin-users/admin-user.controller.ts` |
| GET | `/internal/admin/users` | admin-users | `backend/apps/user-service/src/features/admin-users/admin-user.controller.ts` |
| PATCH | `/internal/admin/users/:userId/status` | admin-users | `backend/apps/user-service/src/features/admin-users/admin-user.controller.ts` |
| GET | `/internal/users/:userId/customer-profile` | customer-profile | `backend/apps/user-service/src/features/customer-profile/customer-profile.controller.ts` |
| POST | `/internal/users/:userId/customer-profile` | customer-profile | `backend/apps/user-service/src/features/customer-profile/customer-profile.controller.ts` |
| PATCH | `/internal/users/:userId/customer-profile` | customer-profile | `backend/apps/user-service/src/features/customer-profile/customer-profile.controller.ts` |
| GET | `/health/live` | health | `backend/apps/user-service/src/features/health/health.controller.ts` |
| GET | `/health/ready` | health | `backend/apps/user-service/src/features/health/health.controller.ts` |
| GET | `/internal/users/:userId/preferences` | preferences | `backend/apps/user-service/src/features/preferences/preference.controller.ts` |
| PUT | `/internal/users/:userId/preferences` | preferences | `backend/apps/user-service/src/features/preferences/preference.controller.ts` |
| GET | `/internal/users/:userId/referral-summary` | referrals | `backend/apps/user-service/src/features/referrals/referral.controller.ts` |
| POST | `/internal/shared-geo/geocode` | shared-geo | `backend/apps/user-service/src/features/shared-geo/shared-geo.controller.ts` |
| POST | `/internal/shared-geo/reverse-geocode` | shared-geo | `backend/apps/user-service/src/features/shared-geo/shared-geo.controller.ts` |
| POST | `/internal/shared-geo/geofence/check` | shared-geo | `backend/apps/user-service/src/features/shared-geo/shared-geo.controller.ts` |
| POST | `/internal/shared-geo/directions` | shared-geo | `backend/apps/user-service/src/features/shared-geo/shared-geo.controller.ts` |

## Change Rules

For every new or changed internal service route:

1. Update the owning feature spec before implementation when behavior changes.
2. Keep request and response types in the owning service.
3. Update gateway or service HTTP clients that call the route.
4. Update this inventory and `docs/api-contracts.md` if the public gateway surface changes.
5. Add focused tests for success, authorization/visibility, invalid input, and dependency failure behavior.
