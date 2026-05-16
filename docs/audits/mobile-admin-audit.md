# Mobile ↔ Admin Coverage Audit

_Last refreshed: 2026-05-17_

This audit walks every entity the mobile app can create or mutate and verifies
that the admin app has a path to view / track / moderate it. It is the
companion to `admin/src/app/config/backendSupportMatrix.ts`, which already
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
