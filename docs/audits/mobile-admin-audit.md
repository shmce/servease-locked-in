# Frontend ↔ Backend ↔ Admin Coverage Audit

_Last refreshed: 2026-05-17_

This audit walks every entity each customer-facing or provider-facing surface
can create or mutate and verifies that:

1. The backend API Gateway exposes a contract for it.
2. The admin app has a path to view / track / moderate it where applicable.

Surfaces covered:

- **mobile** — React Native customer + provider app (`mobile/services/serveaseApi.ts`).
- **landing** — Next.js customer marketing + account site (`Landing Page/src/app/lib/*`, `Landing Page/src/app/api/*`).
- **provider-web** — Next.js provider dashboard (`FE_Web(Provider)/src/services/serveaseProviderApi.ts`).
- **admin** — React/Vite admin console (`admin/src/services/serveaseAdminApi.ts`).

It is the companion to `admin/src/app/config/backendSupportMatrix.ts`, which
tracks the admin-side wiring of each screen.

## Method

1. Listed every `/v1/...` path used in `mobile/services/serveaseApi.ts`.
2. Listed every `/v1/admin/...` path used in `admin/src/services/serveaseAdminApi.ts`.
3. Walked every backend controller under `backend/apps/api-gateway/src/features/admin`.
4. Looked for backend routes that exist but are not consumed by admin (orphan
   routes) and for mobile entities that have no admin counterpart at all
   (blind spots).

## Coverage matrix

| Mobile entity (writer)                      | Backend admin path                          | Admin page                  | Status        |
| ------------------------------------------- | ------------------------------------------- | --------------------------- | ------------- |
| Bookings (POST `/v1/bookings`)              | GET/POST `/v1/admin/bookings*`              | AllBookings, OngoingServices | wired         |
| Payments (POST `/v1/payments`)              | GET/PATCH `/v1/admin/payments*`             | Transactions, FailedPayments | wired         |
| Payouts (POST `/v1/payments/payouts`)       | GET/PATCH `/v1/admin/payments/payouts*`     | PayoutRequests              | wired         |
| Customer support (POST `/v1/support/tickets`) | GET/POST/PATCH `/v1/admin/support/tickets*` | DisputesResolutions         | wired         |
| Provider profile/listing                    | GET/PATCH `/v1/admin/providers*`            | ServiceProviders, Details   | wired         |
| Provider application                        | GET/POST `/v1/admin/provider-applications*` | ProviderApplications        | wired         |
| Reviews + replies + flags                   | GET `/v1/admin/reviews`, PATCH `/v1/admin/reviews/:id/flag` | Reviews                    | wired         |
| Provider portfolio media                    | GET/DELETE `/v1/admin/providers/:providerId/portfolio*` | ServiceProviderDetails → Portfolio | wired         |
| Customer/provider conversation messages     | (none)                                      | (none)                      | BLIND SPOT (intentional?) |
| Notifications                               | (none)                                      | (none)                      | BLIND SPOT    |
| Referral activity                           | (none)                                      | (none)                      | BLIND SPOT (low priority) |
| Provider availability windows / days off    | GET `/v1/provider/availability/:providerId` (read-only) | ServiceProviderDetails → Availability | wired (read-only) |
| User preferences                            | (none, by design)                           | n/a                         | n/a           |

## Findings

### ~~Critical — reviews are invisible to admin~~ — Resolved

Mobile customers create reviews (POST `/v1/reviews`); providers reply
(POST `/v1/reviews/:id/reply`); customers can flag (POST `/v1/reviews/:id/flag`).
The gateway now exposes admin review moderation and the admin web app has a
Reviews page for flagged-first review triage.

**Fix in this PR:**

- Added `admin-review.controller.ts` under api-gateway for list and flag
  moderation.
- Added `Reviews.tsx` page to admin with rating distribution, flagged filter,
  and moderation actions.
- Wired client functions `listAdminReviews` and `setAdminReviewFlagged` in
  `serveaseAdminApi.ts`.
- Added review-service internal admin routes for list and flag updates.

### Medium — orphan admin endpoints

Backend already exposes these but the admin frontend never calls them.

- `POST /v1/admin/broadcasts` now sends immediate notification-backed
  broadcasts from the Broadcasts page; history/scheduling still need contracts.
- `PATCH/POST /v1/admin/integrations/:provider/...` — Security page mentions
  them but `serveaseAdminApi.ts` grep shows no calls.
- `GET /v1/admin/reports/revenue.pdf` is still not used by report pages;
  `bookings.csv` is now wired from Booking Analytics.

These are tracked in `backendSupportMatrix.ts` as "partial" already. Not in
scope for this audit fix — they are admin-only flows, not mobile cross-cuts.

### ~~Medium — provider portfolio is unmoderated~~ — Resolved

Mobile providers upload portfolio images (`POST /v1/catalog/provider/portfolio`).
Now backed by two admin endpoints and a Portfolio tab on
ServiceProviderDetails:

- `GET /v1/admin/providers/:providerId/portfolio` — list everything the
  provider has uploaded.
- `DELETE /v1/admin/providers/:providerId/portfolio/:mediaId` — admin-only
  removal that resolves the owner's userId via `getProvider` and writes an
  audit log entry.

Backend tests: 22 admin controller specs still pass after the change.

### Low — messages, notifications, referrals

Intentionally not surfaced in admin today: customer/provider conversation
content (privacy), per-user notifications (operational only), and referral
counts (already surfaced inside provider/customer profiles).

Recommended later: aggregate metrics on the Dashboard rather than per-record
listings.

## Trackability summary

After this PR:

- **Bookings, payments, payouts, refunds, support, providers, services,
  categories, promotions, users, audit logs**: every mobile-originating record
  has an admin counterpart.
- **Reviews**: newly tracked end-to-end.
- **Portfolio, messages, notifications, referrals, availability**: documented
  blind spots, owners assigned in `backendSupportMatrix.ts`.

## Landing Page (customer) coverage

The Next.js customer site uses server-side `/api/*` routes that proxy the
gateway under `/v1/*`. Every write below has either an admin moderation surface
or appears in another user-facing tracker (booking detail, account).

| Customer entity (writer)                             | Gateway route                                  | Admin surface                | Status |
| ---------------------------------------------------- | ---------------------------------------------- | ---------------------------- | ------ |
| Customer registration (POST `/api/customer-registration`) | POST `/v1/auth/customers`                       | Users → Customers            | wired  |
| Provider application (POST `/api/provider-registration`)  | POST `/v1/auth/providers`                       | Providers → Applications     | wired  |
| Password reset (POST `/api/password-reset`)          | POST `/v1/auth/password-reset`                  | n/a                          | wired  |
| Profile update (PATCH `/api/me`)                     | PATCH `/v1/me`                                  | Users → Customer detail      | wired  |
| Password change (PATCH `/api/me/password`)           | PATCH `/v1/me/password`                         | n/a                          | wired  |
| **Notification preferences (GET/PUT `/api/me/preferences`)** | GET/PUT `/v1/me/preferences`              | n/a (per-user)               | **newly wired (this PR)** |
| Bookings (POST/GET `/api/bookings*`)                 | POST/GET `/v1/bookings*`                        | Operations → Bookings        | wired  |
| Payment methods (GET/PUT/DELETE `/api/payments/methods*`) | GET/PUT/DELETE `/v1/payments/methods*`     | Finance (aggregate only)     | wired  |
| Support tickets + replies (`/api/support-tickets*`)  | `/v1/support/tickets*`                          | Support                      | wired  |
| Reviews (POST `/api/reviews`)                        | POST `/v1/reviews`                              | Operations → Reviews         | wired  |
| Notifications read (PATCH `/api/notifications/:id/read`) | PATCH `/v1/notifications/:id/read`         | n/a (per-user)               | wired  |
| Referrals (GET `/api/referrals`)                     | GET `/v1/referrals`                             | (per-user, by design)        | wired  |

## FE_Web (Provider) coverage

The provider Next.js dashboard calls the gateway directly with the stored
Supabase access token (no proxy layer).

| Provider entity (writer)                       | Gateway route                                  | Admin surface                          | Status |
| ---------------------------------------------- | ---------------------------------------------- | -------------------------------------- | ------ |
| Sign in / current user                         | Supabase Auth → `GET /v1/me`                    | Users → Providers                      | wired  |
| Provider profile                               | `GET /v1/provider/profile`                      | Providers → ServiceProviderDetails     | wired  |
| Provider dashboard summary                     | `GET /v1/provider/dashboard`                    | n/a (per-provider)                     | wired  |
| Owned services (read / replace)                | `GET/PUT /v1/provider/services`                 | Marketplace → Services                 | wired  |
| Availability windows / days off                | `GET/PUT /v1/provider/availability*`            | Providers → Availability viewer        | wired  |
| Bookings list / detail / status                | `GET/PATCH /v1/bookings*`                       | Operations → Bookings, Ongoing         | wired  |
| Payments / earnings                            | `GET /v1/payments`                              | Finance → Transactions                 | wired  |
| Payout account / methods / requests            | `GET/PUT /v1/payments/payout-account`, `/payout-methods`, `GET/POST /v1/payments/payouts` | Finance → Payouts | wired  |
| Conversations / messages                       | `GET/POST /v1/conversations*`                   | n/a (privacy)                          | wired (display fields thin) |
| Notifications + mark read                      | `GET /v1/notifications`, `PATCH /:id/read`      | n/a (per-user)                         | wired  |
| Reviews list / reply / flag                    | `GET /v1/reviews`, `POST /v1/reviews/:id/reply`, `POST /v1/reviews/:id/flag` | Operations → Reviews | wired  |
| **Notification preferences**                   | `GET/PUT /v1/me/preferences`                    | n/a (per-user)                         | wired  |
| Portfolio media (add / list / delete)          | `POST/GET/DELETE /v1/catalog/provider/portfolio*` | Providers → Portfolio moderation     | wired  |
| Referral summary                               | `GET /v1/referrals`                             | n/a (per-user)                         | wired  |
| Support tickets + replies                      | `/v1/support/tickets*`                          | Support                                | wired  |

## Cross-frontend invariants

- Every write below has at least one read path (user-facing or admin) on
  another surface, so nothing is "fire and forget."
- `/v1/me/preferences` is shared by **mobile, landing, provider-web** — the
  shape (`pushNotificationsEnabled`, `darkModeEnabled`, `language`,
  `notificationPreferences`) is identical, but each frontend may interpret its
  own keys inside `notificationPreferences` (e.g. provider has
  `newBookingRequests`, customer has `bookingReminders`). The backend stays
  schema-agnostic for that field.
- `/v1/me` profile updates from landing and provider-web both surface in admin
  Users; admin status changes via `PATCH /v1/admin/users/:userId/status` are
  honored by both frontends on next sign-in.
- Bookings, payments, payouts, reviews, and support tickets all flow from
  mobile/landing/provider-web → backend → admin moderation surface; the
  write/read symmetry is what makes the platform "trackable."
