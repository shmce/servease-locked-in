# Full-Stack Audit — 2026-05-17

> Re-audit of every surface (mobile, admin, FE_Web(Provider), Landing Page, backend) to inventory what is wired, what is partial, and what is missing. **Mobile receives top priority** per the current goal.

This document supersedes the older `mobile-admin-audit.md` for gap tracking. The companion machine-readable matrix lives in `admin/src/app/config/backendSupportMatrix.ts`.

## Method

1. Enumerated `/v1/...` paths called by each frontend's service module:
   - mobile: `mobile/services/serveaseApi.ts` (61 exported API functions)
   - landing: `Landing Page/src/app/lib/*` + `Landing Page/src/app/api/*`
   - provider-web: `FE_Web(Provider)/src/services/serveaseProviderApi.ts`
   - admin: `admin/src/services/serveaseAdminApi.ts`
2. Enumerated `@Controller` + `@Get/@Post/@Patch/@Put/@Delete` routes under `backend/apps/api-gateway/src/features/**/*.controller.ts`.
3. Cross-walked frontend writes ↔ admin moderation surfaces and admin reads ↔ backend writers.
4. Spot-grepped each frontend for `notifyBackendRequired(...)`, `TODO`, `FIXME`, and mock-data shapes to catch UI stubs.

## Top-line health

| Surface | Wired | Partial | Missing |
|---|---|---|---|
| Mobile | 23 feature areas | 0 | 5 (see § Mobile gaps) |
| Landing | 12 | 0 | 2 |
| FE_Web (Provider) | 18 | 0 | 3 |
| Admin | 22 wired in matrix | 3 partial | 0 missing |
| Backend | 100+ routes, all consumed | 2 stub routes (501) | 4 contracts not yet drafted |

---

## Mobile — gap inventory (top priority)

Mobile already covers every customer-facing and provider-facing primary workflow. Five gaps remain:

### M1. Provider application status check (HIGH)
- **What's missing:** Mobile providers who registered but are awaiting admin approval cannot see their application status, decision reason, or "more info requested" messages.
- **Backend:** `GET /v1/auth/provider-application/me` already exists and is used by Landing Page.
- **Mobile work:** add `getMyProviderApplication()` to `serveaseApi.ts`; render a banner / dedicated screen for `pending` / `more_info_requested` states on provider sign-in.
- **Cross-cutting:** drives a better "rejected — here's why" experience.

### M2. Provider portfolio reorder & caption edit (MEDIUM)
- **What's missing:** Mobile only calls `POST /v1/catalog/provider/portfolio`, `GET …`, and `DELETE …/:mediaId`. The reorder endpoint (`PUT /v1/catalog/provider/portfolio/order`) and per-item edit (`PUT /v1/catalog/provider/portfolio/:mediaId` for caption changes) are already in backend + provider-web but mobile providers can't reorder or rename their portfolio.
- **Mobile work:** add `reorderProviderPortfolio(ids)` and `updateProviderPortfolioMedia(mediaId, { caption })` wrappers; wire to the Provider Portfolio screen.

### M3. Booking attachment lifecycle gaps (MEDIUM)
- **What's missing:** Mobile uploads attachments (`POST /v1/bookings/:id/attachments`) but no delete-attachment endpoint exists on the backend, and the mobile UI also has no remove control. Customers who upload the wrong photo cannot recover.
- **Backend work:** add `DELETE /v1/bookings/:bookingId/attachments/:attachmentId` (owner-only, soft-delete preferred so admin can still see evidence) + Supabase RPC.
- **Mobile + provider-web work:** call the new endpoint from the attachment list.

### M4. Customer-side dispute initiation (MEDIUM)
- **What's missing:** Customers cannot formally raise a dispute. Today they create a generic support ticket; admin sees disputes in a separate `booking.disputes` table that has no public write path.
- **Backend work:** add `POST /v1/bookings/:bookingId/disputes` (returns dispute id; uses `raised_by = current user`) and surface in `/v1/admin/disputes` listing. Provider-side counterpart: `POST /v1/bookings/:bookingId/disputes` from provider role.
- **Mobile + provider-web work:** add a "Raise dispute" action in booking detail with reason picker.

### M5. Account deletion / deactivation (LOW)
- **What's missing:** No `DELETE /v1/me` exists. Auth-service has an internal `deleteUser()` but the gateway never exposes it. GDPR / app-store compliance requires self-service deletion.
- **Backend work:** add `DELETE /v1/me` that cancels active bookings, anonymizes user record (PII clear, keep aggregate metrics), revokes Supabase auth.
- **All frontends:** Mobile / Landing / Provider need a "Delete account" flow with confirmation modal.

---

## Backend — true gaps (vs. orphan endpoints)

### B1. Two-factor authentication (stub today, 501)
- `POST /v1/me/two-factor/enable` and `POST /v1/me/two-factor/disable` return 501.
- **Work:** TOTP secret column on `auth_user_profile`, `otplib` integration, QR provisioning endpoint, verification step. Add `POST /v1/me/two-factor/verify`.
- **Frontend impact:** Admin Security page, Landing Account Security, Mobile More → Security.

### B2. Account deletion (no endpoint)
- See M5.

### B3. Booking attachment delete (no endpoint)
- See M3.

### B4. Customer/provider dispute creation (no public endpoint)
- See M4.

### B5. Promotion broadcast scheduling/targeting (partial, in matrix)
- `POST /v1/admin/broadcasts` is immediate-only. Scheduling, repeat, audience-cohort, and history are not contracted.

### B6. Settlement release history & lifecycle (partial, in matrix)
- Approve/reject already exist; per-settlement audit timeline and bank-reference reconciliation feed are not contracted.

---

## Landing Page — gap inventory

### L1. Account deletion (see M5).
### L2. 2FA configuration UI (waiting on B1).

Otherwise wired: customer registration, provider application + status, profile / password / preferences, bookings list+detail, payment methods, support tickets + replies, reviews, notifications, referrals.

---

## FE_Web (Provider) — gap inventory

### P1. Provider 2FA (waiting on B1).
### P2. Account deletion (waiting on B2 / M5).
### P3. Booking attachment lifecycle (waiting on B3).

Otherwise wired: provider profile + dashboard, services, availability windows + days off, bookings, conversations, payouts (account / methods / requests), reviews + replies, portfolio (incl. reorder + edit), support, notifications, referrals, preferences.

---

## Admin — partial items still open

These mirror `backendSupportMatrix.ts`:

| Screen | Why partial | Effort to close |
|---|---|---|
| Profile and Security | 2FA stubs return 501 | Tracked as **B1** |
| Payouts/Settlements/Commission | Release history + bank-reference timeline | Tracked as **B6** |
| Promotions/Broadcasts | Schedule + audience targeting | Tracked as **B5** |

Previously partial — **closed in this branch:**
- Failed Payments (failure metadata + retry) — see `20260517_add_payment_failure_metadata.sql`.
- Bookings & Ongoing Services (persisted admin thread) — see `20260517_add_admin_booking_messages.sql`.

---

## Cross-frontend invariants (verified)

- Every mobile write path now has either an admin moderation surface or another user-facing tracker. Verified for: bookings, payments, payouts, reviews, support tickets, providers, services, categories, promotions, refunds.
- `/v1/me/preferences` is shared by mobile, landing, provider-web with a single backend contract.
- Status changes via `PATCH /v1/admin/users/:userId/status` propagate to all frontends on next sign-in.
- Failed payments retry transitions payment back to `pending`; mobile `listPayments` and provider-web earnings view will pick that up automatically.

## Recommended sequencing

1. **M1** (provider application status on mobile) — small, customer-impacting today.
2. **M3 + B3** (booking attachment delete) — one backend route + 2 frontends.
3. **M4 + B4** (customer/provider dispute initiation) — moderate backend work, removes the "support ticket as proxy for dispute" workaround.
4. **M2** (mobile portfolio reorder/edit) — small frontend-only.
5. **B1** (real 2FA) — larger, affects 3 frontends; sequence last.
6. **B5 / B6** (promotion scheduling / settlement history) — admin-only, can land alongside (5).
7. **M5 + B2** (account deletion) — small backend, broader compliance work.

## Files of interest

- `admin/src/app/config/backendSupportMatrix.ts` — canonical machine-readable matrix.
- `docs/audits/mobile-admin-audit.md` — previous (narrower) audit, kept for history.
- `backend/database/20260517_*.sql` — migrations from this branch.
- `mobile/services/serveaseApi.ts` — 61 exported functions, last refreshed 2026-05-17.
