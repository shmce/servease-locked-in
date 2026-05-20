# App Surface Contracts

Last verified from code: 2026-05-20.

This document maps each client surface to the Gateway routes it consumes. It is
based on the current API client files, route handlers, and SDK client code. It
does not replace [API Contracts](api-contracts.md); it explains which app uses
which contract.

## Boundary Rules

- App surfaces call the API Gateway on `/v1/...`, never service ports `8501` through `8511`.
- Browser and mobile clients may use Supabase public auth endpoints for sign-in.
- Browser and mobile clients must not include Supabase service-role keys.
- Server-side Next.js proxy routes may forward to the Gateway with `SERVEASE_API_BASE_URL`.
- Shared TypeScript types should come from the public SDK or the app-local API client, not from backend service DTOs.

## Surface Summary

| Surface | Primary source | Gateway base configuration | Notes |
| --- | --- | --- | --- |
| Mobile Expo app | `mobile/services/serveaseApi.ts` | `EXPO_PUBLIC_API_BASE_URL` / gateway config helpers | Broadest first-party client coverage; includes customer and provider flows. |
| Public SDK | `packages/servease-sdk/src/client.ts` | `createServEaseClient({ baseUrl })` | Public typed package for external consumers; unwraps `{ data }`. |
| Admin dashboard | `admin/src/services/serveaseAdminApi.ts` | admin API base URL helper | Admin operations plus shared current-user/catalog/provider-availability reads. |
| Landing Page | `Landing Page/src/app/api/*`, `Landing Page/src/app/lib/*` | `SERVEASE_API_BASE_URL`, `NEXT_PUBLIC_API_BASE_URL` | Uses server-side proxy routes for account, booking, payments, support, notifications, and customer flows. |
| Provider Web | `FE_Web(Provider)/src/shared/models/apiService.ts` | `NEXT_PUBLIC_API_BASE_URL` | Provider dashboard live client; `FE_Web(Provider)/BACKEND_ADJUSTMENTS.md` records remaining richer backend needs. |

## Mobile Expo App

Source: `mobile/services/serveaseApi.ts`.

| Area | Gateway contracts used |
| --- | --- |
| Catalog and portfolio | `GET /v1/catalog/categories`, `GET /v1/catalog/services`, `GET /v1/catalog/providers`, `GET /v1/catalog/providers/:providerId/portfolio`, `POST /v1/catalog/provider/portfolio`, `PUT /v1/catalog/provider/portfolio/:mediaId`, `DELETE /v1/catalog/provider/portfolio/:mediaId`, `PUT /v1/catalog/provider/portfolio/order` |
| Auth and profile | `POST /v1/auth/register`, `POST /v1/auth/password-reset`, `POST /v1/auth/otp/generate`, `POST /v1/auth/otp/verify`, `POST /v1/auth/google/authorize`, `POST /v1/auth/google/token`, `GET /v1/auth/provider-application/me`, `GET/PATCH/DELETE /v1/me`, `PATCH /v1/me/password`, `GET /v1/me/sessions`, `POST /v1/me/two-factor/*`, `GET/PUT /v1/me/preferences` |
| Booking and tracking | `GET/POST /v1/bookings`, `GET /v1/bookings?scope=provider`, `GET /v1/bookings/:bookingId`, `PATCH /v1/bookings/:bookingId/status`, `GET /v1/bookings/:bookingId/tracking`, `GET /v1/bookings/:bookingId/tracking/stream`, `PATCH /v1/bookings/:bookingId/tracking/location`, `POST/DELETE /v1/bookings/:bookingId/attachments`, `POST /v1/bookings/:bookingId/disputes`, `GET/POST /v1/bookings/:bookingId/service-updates`, `GET /v1/bookings/:bookingId/timeline` |
| Pricing, geo, payments | `POST /v1/pricing/quotes`, `POST /v1/geo/geocode`, `POST /v1/geo/reverse-geocode`, `POST /v1/geo/geofence/check`, `POST /v1/geo/directions`, `GET/POST /v1/payments`, `POST /v1/payments/checkout-sessions`, `GET /v1/payments/checkout-sessions/:checkoutId/status`, `POST /v1/payments/promotions/validate`, `GET/PUT/DELETE /v1/payments/methods`, `GET /v1/payments/payout-account`, `GET/PUT /v1/payments/payout-methods`, `GET/POST /v1/payments/payouts` |
| Messaging and support | `GET/POST /v1/conversations`, `GET/POST /v1/conversations/:conversationId/messages`, `GET/POST /v1/support/tickets`, `GET /v1/support/tickets/:ticketId`, `GET/POST /v1/support/tickets/:ticketId/replies` |
| Reviews, notifications, referrals, uploads | `GET/POST /v1/reviews`, `POST /v1/reviews/:reviewId/reply`, `POST /v1/reviews/:reviewId/flag`, `GET /v1/notifications`, `PATCH /v1/notifications/:notificationId/read`, `POST/DELETE /v1/notifications/devices`, `GET /v1/referrals`, `POST /v1/uploads` |
| Provider operations | `GET /v1/provider/profile`, `GET /v1/provider/dashboard`, `GET/PUT /v1/provider/services`, `GET /v1/provider/availability`, `GET /v1/provider/availability/:providerId`, `PUT /v1/provider/availability/windows`, `POST/DELETE /v1/provider/availability/days-off`, `POST/DELETE /v1/provider/availability/time-off` |

## Public SDK

Source: `packages/servease-sdk/src/client.ts`.

| Area | SDK coverage |
| --- | --- |
| Public browse | Catalog categories, services, providers |
| Booking | Create, list, detail, status update |
| Availability | Provider schedule read/write, days off, and time-off windows |
| Pricing and payment | Quotes, provider guidance, payments, checkout sessions, promotions, customer methods, payout account/methods/payouts |
| Messaging and support | Conversations, messages, tickets, replies |
| Profile and shared utilities | Current user, preferences, geo, referrals, notifications, uploads |
| Reviews | Public provider reviews, review creation, provider replies, flags |

SDK consumers should treat the SDK as the public package boundary. It intentionally does not expose `/internal/...` routes or admin-only contracts.

## Admin Dashboard

Source: `admin/src/services/serveaseAdminApi.ts`.

| Area | Gateway contracts used |
| --- | --- |
| Auth/session/profile | Supabase password token endpoint, `GET/PATCH /v1/me`, `PATCH /v1/me/password`, `GET /v1/me/sessions`, `POST /v1/me/two-factor/*`, `GET/PUT /v1/me/preferences` |
| Payments and finance | `GET/PATCH/POST /v1/admin/payments...`, `GET/PATCH /v1/admin/payments/payouts...`, `GET/POST /v1/admin/settlements...`, `GET/POST /v1/admin/refunds...`, `GET/PATCH /v1/admin/commission-rules`, `GET/POST/PATCH/DELETE /v1/admin/promotions` |
| Operations | `GET/POST /v1/admin/broadcasts`, `GET/PATCH /v1/admin/reviews...`, `GET/POST /v1/admin/disputes...`, `GET/POST /v1/admin/bookings...`, `GET /v1/admin/audit-logs`, `GET /v1/admin/audit-logs/export` |
| Provider applications and providers | `GET/PUT/POST /v1/admin/provider-applications...`, `GET/PATCH /v1/admin/providers...`, `GET/DELETE /v1/admin/providers/:providerId/portfolio...`, `GET /v1/provider/availability/:providerId` |
| Reports, users, catalog, pricing | `GET/POST /v1/admin/reports...`, `GET/POST/PATCH/DELETE /v1/admin/users...`, `GET/POST/PATCH/DELETE /v1/admin/catalog...`, `GET/PUT/POST /v1/admin/pricing...` |
| Shared public reads | `GET /v1/catalog/categories`, `GET /v1/catalog/services`, `GET /v1/catalog/providers` |

Current documentation note: `getAdminProviderAvailability` calls `GET /v1/provider/availability/:providerId`, but the admin-local `AdminAvailabilitySchedule` type currently lists `windows` and `daysOff` only. The Gateway contract also returns `timeOffWindows`.

## Landing Page

Sources:

- `Landing Page/src/app/api/*`
- `Landing Page/src/app/lib/*`
- `Landing Page/src/services/serveaseProviderApi.ts`

| Area | Gateway contracts used |
| --- | --- |
| Account and auth proxy routes | `POST /v1/auth/register`, `POST /v1/auth/password-reset`, `GET/PATCH/DELETE /v1/me`, `PATCH /v1/me/password`, `POST /v1/me/two-factor/*`, `GET/PUT /v1/me/preferences`, `GET /v1/auth/provider-application/me` |
| Booking/customer flows | `GET/POST /v1/bookings`, `GET /v1/bookings?scope=provider`, `GET /v1/bookings/:bookingId`, `PATCH /v1/bookings/:bookingId/status`, `GET /v1/bookings/:bookingId/tracking`, `GET/POST /v1/bookings/:bookingId/service-updates` |
| Messaging, support, notifications | `GET/POST /v1/conversations`, `GET/POST /v1/conversations/:conversationId/messages`, `GET/POST /v1/support/tickets`, `GET/POST /v1/support/tickets/:ticketId/replies`, `GET /v1/notifications`, `PATCH /v1/notifications/:notificationId/read` |
| Payments, pricing, referrals, reviews | `GET/POST /v1/payments`, `GET/PUT/DELETE /v1/payments/methods`, `POST /v1/pricing/quotes`, `GET /v1/referrals`, `GET/POST /v1/reviews` |
| Catalog/provider public reads | `GET /v1/catalog/categories`, `GET /v1/catalog/services`, `GET /v1/catalog/providers`, `GET /v1/catalog/providers/:providerId/portfolio`, `GET /v1/provider/availability/:providerId`, `POST /v1/uploads` |
| Provider service client | `GET /v1/provider/profile`, `GET /v1/provider/dashboard`, `GET/PUT /v1/provider/services`, `GET/PUT /v1/provider/availability`, `POST/DELETE /v1/provider/availability/days-off`, `GET/PATCH /v1/bookings...`, `POST /v1/geo/directions` |

Landing Page server route handlers translate Gateway failures into UI-specific error codes such as `booking_gateway_unavailable`, `profile_gateway_unavailable`, and `payment_gateway_unavailable`.

## Provider Web

Source: `FE_Web(Provider)/src/shared/models/apiService.ts`.

| Area | Gateway contracts used |
| --- | --- |
| Auth/profile/account | Supabase password token endpoint, `GET/PATCH/DELETE /v1/me`, `PATCH /v1/me/password`, `POST /v1/me/two-factor/*`, `GET/PUT /v1/me/preferences` |
| Provider dashboard | `GET /v1/provider/profile`, `GET /v1/provider/dashboard`, `GET/PUT /v1/provider/services`, `GET/PUT /v1/provider/availability`, `POST/DELETE /v1/provider/availability/days-off` |
| Booking workflow | `GET /v1/bookings?scope=provider`, `GET /v1/bookings/:bookingId`, `PATCH /v1/bookings/:bookingId/status`, `GET /v1/bookings/:bookingId/tracking`, `POST/DELETE /v1/bookings/:bookingId/attachments`, `POST /v1/bookings/:bookingId/disputes`, `GET/POST /v1/bookings/:bookingId/service-updates` |
| Earnings and payouts | `GET /v1/payments`, `GET /v1/payments/payout-account`, `GET/PUT /v1/payments/payout-methods`, `GET/POST /v1/payments/payouts` |
| Messaging, uploads, notifications | `GET/POST /v1/conversations`, `GET/POST /v1/conversations/:conversationId/messages`, `POST /v1/uploads`, `GET /v1/notifications`, `PATCH /v1/notifications/:notificationId/read` |
| Reviews, portfolio, support, referrals | `GET /v1/reviews?providerId=...`, `POST /v1/reviews/:reviewId/reply`, `POST /v1/reviews/:reviewId/flag`, `POST/PUT/DELETE /v1/catalog/provider/portfolio...`, `GET/POST /v1/support/tickets`, `GET/POST /v1/support/tickets/:ticketId/replies`, `GET /v1/referrals` |

Provider Web has documented follow-up needs in `FE_Web(Provider)/BACKEND_ADJUSTMENTS.md`, including richer provider earnings, payment record fields, message attachments, and recurring availability.

## Change Rules

When a screen, route handler, or SDK method starts using a new Gateway contract:

1. Update the relevant source API client and tests.
2. Update [API Contracts](api-contracts.md) if the Gateway surface changed.
3. Update this app-surface map so consumers know which app depends on the contract.
4. Keep any new app-local types aligned with the public Gateway response shape.
5. Do not import backend service DTOs into app surfaces.

