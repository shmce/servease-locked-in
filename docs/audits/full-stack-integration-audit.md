# ServEase 5-Folder Integration Audit

_Updated: 2026-05-17 (afternoon) — adds the admin-503 sweep + mobile sessions wiring._

Folders audited: `admin`, `backend`, `FE_Web(Provider)`, `Landing Page`, `mobile`.

This document lists, per folder:

- **Broken / disconnected** — uses mock data or local state where the backend already exists.
- **Placeholder / stub** — visually present but doesn't function end-to-end (501 stubs, "Coming Soon" panels, mock images, orphan vertical pages).
- **Integration gaps** — features one folder produces that another folder can't see.

The remediation list at the end summarises what needs to land for the five folders to act as one product.

---

## 1. `backend` (NestJS monorepo)

### Endpoints returning 501 (stub by design)

| Path | Where | Effect |
| --- | --- | --- |
| `POST /v1/me/two-factor/enable` | `current-user.controller.ts:120` | 2FA enable is a stub; admin Profile/Security UI accepts the failure. |
| `POST /v1/me/two-factor/disable` | `current-user.controller.ts:138` | 2FA disable stub — same. |
| ~~`GET /v1/me/sessions`~~ | `current-user.controller.ts` | **Wired this session.** Returns one session built from `auth.users.last_sign_in_at` via `servease_list_user_sessions` RPC. Admin Security + mobile Settings now show real data. |
| ~~`PATCH /v1/admin/integrations/:provider/credentials`~~ | `admin-integration.controller.ts` | **Wired this session.** Persists to `admin.integrations` via `servease_admin_update_integration_credentials`. |
| ~~`POST /v1/admin/integrations/:provider/test`~~ | `admin-integration.controller.ts` | **Wired this session.** Records the test outcome to `admin.integrations` via `servease_admin_record_integration_test`. |
| `GET /v1/admin/reports/revenue.pdf` | `admin-report.controller.ts:32` | PDF revenue export is a stub. |
| ~~`GET /v1/admin/reports/revenue.csv`~~ | `admin-report.controller.ts` | **Wired this session.** Streams payment rows. |
| ~~`GET /v1/admin/reports/users.csv`~~ | `admin-report.controller.ts` | **Wired this session.** Streams user rows. |
| ~~`GET /v1/admin/reports/financial.csv`~~ | `admin-report.controller.ts` | **Wired this session.** Streams payments + payouts + refunds. |
| `POST /v1/admin/reports/:type` | `admin-report.controller.ts:72` | Generate-report stub. |
| `POST /v1/admin/reports/:type/schedules` | `admin-report.controller.ts:83` | Scheduled-report stub. |

### Bugs found and fixed in the 2026-05-17 503 sweep

These were 503/500 errors hitting the admin UI before this session. All resolved:

| Path | Symptom | Root cause | Fix |
| --- | --- | --- | --- |
| `GET /v1/admin/payments/payouts`, `failures`, `refunds`, `commission-rules`, `settlements`, `promotions` | 503 "Admin service is unavailable" | NestJS route order: `@Get(':paymentId')` declared **before** static prefixes in both `api-gateway/admin/admin-payment.controller.ts` and `admin-service/features/payments/admin-payment.controller.ts` and `payment-service/features/payments/payment-admin.controller.ts`. So `/payouts` was matching `:paymentId="payouts"` and triggering `servease_admin_get_payment` with a non-UUID arg. | Moved every static prefix route ahead of the `:paymentId` catch-alls in all three controllers. |
| `GET /v1/admin/bookings/summary` | 503 "Admin booking workflow failed" | RPC `servease_admin_bookings_summary` referenced `bookings` without a schema; lived under `booking` schema. | Pinned `set search_path = public, booking` and qualified `booking.bookings`. |
| `GET /v1/admin/catalog/categories` | 503 "catalog_service_unavailable" | Catalog repo called `servease_admin_list_catalog_categories` RPC that was never created. | Added the RPC (`20260517_add_admin_list_catalog_categories_rpc.sql`). |
| `GET /v1/admin/reviews` | 503 "review_dependency_unavailable" | Review repo did `client.schema('trust_and_reputation').from('reviews')`, but PostgREST does not expose that schema. | Replaced with `servease_admin_list_reviews` + `servease_admin_set_review_flagged` RPCs. |
| `GET /v1/admin/integrations` | 503 "Admin integrations service is unavailable" | Same PostgREST schema exposure issue — `admin` schema is not whitelisted. | Replaced direct table access with `servease_admin_list_integrations` + `servease_admin_update_integration_credentials` + `servease_admin_record_integration_test` RPCs. |
| `GET /v1/me/sessions` | 503 "profile_dependency_unavailable" | Repository RETURNS-TABLE column types didn't match — `auth.users.email` is `character varying`, not `text`. | Cast `u.email::text` and `u.id::text` in `servease_list_user_sessions`. |
| `GET /v1/admin/reports/bookings.csv` | 503 "Booking report export failed" | Export passes `limit: 1000` but booking-service capped admin list at `200`. | Raised admin booking list cap to 1000. |

### Routes wired but never consumed by any frontend

| Path | Notes |
| --- | --- |
| `GET /v1/admin/audit-logs/export` | Backend exposes export, admin frontend has no Export button on Audit Trail. |
| `POST /v1/admin/broadcasts` | Already wired from `Broadcasts.tsx`, but neither customer mobile nor Landing surfaces the broadcast it produces — there is no read path for "platform announcements". |

### Backend things that work but have no contract for richer needs

- **Settlement approval** is implemented as "set payout status to processing" — the Finance matrix flags this as "needs real settlement service contract".
- **Failed payments** are derived from `refunded`/`cancelled` payments only. There is no `failure_reason`, `gateway_code`, `retry_count`, or `dispute_link` column.
- **Two-factor** has no TOTP/SMS backend at all.
- **Admin sessions** has no auth-session tracking table.

---

## 2. `admin`

### Mock data still in use

| File | Mock used | Live equivalent that exists |
| --- | --- | --- |
| `app/pages/Dashboard.tsx` | Core booking status counts, pending payouts, disputes, users, payments, support, catalog, and provider-listing metrics now use gateway data. Remaining fallback/mock inputs are customer/provider chart details from `useData()`. | Replace the remaining chart fallbacks once live per-category provider and customer growth trend endpoints exist. |
| `contexts/DataContext.tsx` | Entire mock store (customers, bookings, payoutRequests, refunds, audit logs) | Customers and Dashboard core metrics now have gateway-backed replacements; remove this store after the remaining pages are migrated. |
| `services/dataStore.ts` | Mock data file (~600 lines) | Should be deleted after Dashboard migration. |
| `imports/pasted_text/dashboard-overview.tsx` | Imported design dump, not used at runtime | Safe to remove. |

### Sidebar pages that are visual stubs

These pages exist as files but are not in the sidebar and not in `routes.tsx`:

- `MarketplaceSellers.tsx`
- `RestaurantSellers.tsx`
- `GrocerySellers.tsx`
- `PharmacySellers.tsx`
- `HospitalDoctors.tsx`
- `TaxiVendors.tsx`
- `Franchises.tsx`
- `Logistics.tsx`

These are old vertical templates from the Figma source. They are orphan files — either delete or repurpose.

### Pages that render mock UI elements

| Page | What's mock |
| --- | --- |
| `ServiceProviderDetails.tsx` | Documents tab now resolves provider application documents through the gateway and uses signed preview/download URLs. It still falls back to `DOCUMENT_TYPES`/`DEFAULT_PROVIDER` when no application match exists for legacy mock IDs. |
| `ServiceAreas.tsx` | "Interactive Map Coming Soon" panel — no geo backend exists. |
| `Analytics.tsx`, `ReportsInsights.tsx`, `RevenueReports.tsx`, `reports/*.tsx` | CSV exports for bookings, revenue, users, and financial reports are gateway-backed. Chart datasets still rely on page-local mock series, and PDF/scheduled report actions remain backend stubs. |
| `Profile.tsx` | Admin identity now hydrates from `GET /v1/me` for name, email, and phone; 2FA/login-history UI remains partially static. |
| `Security.tsx` | Active Sessions now reads `/v1/me/sessions`; password change is wired; 2FA is the remaining 501 stub. |
| `AddNewAdmin.tsx` | Now submits to the gateway-backed admin user creation flow. Invitation email and RBAC templates are still not implemented. |
| `PlatformSettingsPages.tsx` ➜ `Integrations` | Reads/toggles/tests/updates credentials through `/v1/admin/integrations` (wired this session). |
| `PlatformSettingsPages.tsx` ➜ `NotificationSettings` | Saves to preference metadata only, never used by any service. |

### Endpoints called by admin that need missing backend pieces

- `BackendSupportMatrix.tsx` already enumerates these. The audit doc and the matrix agree on the same set.

---

## 3. `FE_Web(Provider)` — Provider web app

Service module `serveaseProviderApi.ts` exposes a near-complete API surface, but several components ignore it and use local mock state.

### Components with remaining backend integration gaps

| Component | Mock backing | Live API exists |
| --- | --- | --- |
| `PortfolioManagementPage.tsx` | Now loads the current provider portfolio from `/v1/provider/profile` and uses gateway add/delete/reorder/replace endpoints. Existing media replacement uploads through `/v1/uploads` with `provider_portfolio`, then saves the new media metadata through catalog. | Optional richer multi-image/before-after metadata would need an expanded portfolio contract. |
| `MessagesPage.tsx` | Loads gateway conversations/messages, enriches threads from provider bookings, polls for updates, sends text and uploaded image attachments when a provider token exists, and honors `conversationId` deep links. | Consider Landing customer messaging if website customers need chat outside mobile. |
| `EditProfilePage.tsx` | Saves business name, bio/description, service area, and years of experience through `PATCH /v1/me`; the gateway, catalog service, and Supabase RPC now share the same update contract for those fields. Social links, photos, licenses, and certifications remain local-only fields. | Add explicit provider social/profile-media/license contracts before persisting those optional fields. |
| `ProviderProfilePage.tsx` | Renders the provider profile context, which is hydrated from `/v1/provider/profile` on app load and updated by Edit Profile for the backend-backed fields. Cover/profile photos and languages still use local fallback/context values. | Add profile media and language contracts if those should be cross-device. |
| `ProviderHelpCenterPage.tsx` | Now lists provider support tickets, creates new tickets, and reads/posts ticket replies through `/v1/support/tickets`. Static FAQ remains as help content. | Attachments and status changes stay with support/admin contracts. |
| `BlockTimePage.tsx` | Uses `ProviderDataContext.addBlockedDates`, which writes each selected date through `/v1/provider/availability/days-off`. Recurring controls are visual-only. | Add a recurring unavailability backend contract before enabling recurring blocks. |
| `CalendarPage.tsx` | Loads provider bookings through `listProviderBookings`, groups them by Manila calendar day, and uses live totals for month/week/day views. | Personal events remain UI-only because no personal-calendar backend exists. |
| `SetAvailabilityPage.tsx` | Uses `ProviderDataContext.saveAvailability` which **does** call the backend, but reads `defaultAvailability` mock on first render until the API replies. |
| `LoginPage.tsx` | Calls Supabase directly + `getCurrentUser` (live) | `ProviderAuthContext` rejects non-provider roles, missing provider profiles, and inactive accounts before storing the provider session. |

### Mock data still seeded in `ProviderDataContext.tsx`

```text
blockedDates       hard-coded "2026-03-25", "2026-03-26"
portfolioItems     hard-coded fallback until `/v1/provider/profile` loads; `PortfolioManagementPage` refreshes from backend directly
services           hard-coded 3 items
profile            hard-coded business name, bio, cover/profile photo URLs (unsplash)
availability       defaultAvailability constant
```

Only `availability` and partial `profile` data ever get overwritten by API responses. The rest is shown to the user as if real.

### Provider features missing entirely

- **Notifications bell** — `Layout.tsx` now polls `/v1/notifications`, marks items read, and routes booking/ticket/review/message/payment metadata to the relevant provider page. Help center, messages, bookings, reviews, and earnings consume query metadata so the provider lands on or highlights the exact relevant item when present.
- **Review moderation UI** — `ProviderReviewsPage.tsx` lists reviews, replies, and reports reviews through the gateway-backed flag endpoint.
- **In-progress service actions** — `BookingDetailsPage.tsx` can start/complete service status and now lists/posts booking service updates.
- **Booking progress uploads** — provider web can upload progress photos through `/v1/uploads` with `provider_progress`, attach them to the booking, and link them to a service update. Completion-specific photo UX remains mobile-only.
- **Cancel reasons and report-issue forms** — `CancelBookingPage.tsx` is wired, but `ReportIssuePage` equivalent doesn't exist.

---

## 4. `Landing Page` — Public marketing + customer flows (Next.js)

### What's wired

| Path | Backed by |
| --- | --- |
| `/` home | Public catalog (`/v1/catalog/categories`, `/v1/catalog/services`, `/v1/catalog/providers`) via `lib/catalog.ts`. |
| `/providers/[listingId]` | `lib/provider-detail.ts` → `/v1/catalog/providers`, `/v1/catalog/providers/:id/portfolio`, `/v1/reviews?providerId=`. |
| `/login` | Supabase password sign-in only. |
| `/account` | `/api/me` proxy → `/v1/me`. |
| `/bookings` | `/api/bookings` proxy → `/v1/bookings`. |
| `/bookings/[id]` | `/api/bookings/[id]` + service updates proxy. |
| `/provider-registration/*` | `lib/provider-registration.ts` → `/api/provider-registration` → `/v1/auth/register` with role=provider. |
| Support tickets | `/api/support-tickets` proxy → `/v1/support/tickets`. |

### Missing customer-facing flows

| Flow | Status | Backend exists? |
| --- | --- | --- |
| **Customer signup** | `/register` now submits to `/api/customer-registration`, which proxies `POST /v1/auth/register` with `role=customer`. | Wired. |
| **Password reset** | `/forgot-password` now submits to `/api/password-reset`, which proxies `POST /v1/auth/password-reset`. | Wired. |
| **Profile edit / password change** | AccountPage saves profile fields through `/api/me` and updates passwords through `/api/me/password`, both proxied to the gateway. | Wired. |
| **Booking creation** | `BookingRequestForm.tsx` exists but only POSTs via `/api/bookings` proxy with limited fields (no attachments, no payment method) | Mobile uses richer `CreateBookingRequest` shape. |
| **Payment methods + reserve payment** | Account page manages payment methods through `/api/payments/methods`; booking detail reserves payment through `/api/payments`. | Wired. |
| **Reviews** | Completed booking detail now submits through `/api/reviews` to `POST /v1/reviews`. | Wired. |
| **Notifications** | Account page lists notifications through `/api/notifications` and marks items read through `/api/notifications/:id/read`. | Wired for Landing account. |
| **Conversations / messaging** | Not present | `/v1/conversations` exists. |
| **Booking tracking / live progress** | `BookingDetailPage` shows service updates and a tracking panel from `/api/bookings/:id/tracking`. | Wired. |
| **Referrals** | Account page loads referral code, share path, counts, and rewards through `/api/referrals`. | Wired. |
| **Provider portfolio / availability viewer** | Public provider page shows portfolio media and provider availability from `/v1/catalog/providers/:id/portfolio` + `/v1/provider/availability/:id`. | Wired. |
| **Cancel / report-issue from website** | Booking detail supports customer cancellation through status transitions and issue reporting through `/api/support-tickets` with `booking_issue`. | Wired. |
| **Support ticket replies** | Account support tickets expand into reply threads and post follow-ups through `/api/support-tickets/:id/replies`. | Wired. |

### Mock or placeholder UI

- `FAQPage.tsx`, `ContactPage.tsx`, `PrivacyPolicy.tsx`, `TermsConditions.tsx`, `AboutPage.tsx` — static copy only (acceptable for legal pages, but Contact has no form submission).
- `StoreBadges.tsx` — links to app stores (`https://apps.apple.com/…` / Play Store placeholders) that don't point to real listings.
- `ProviderRegSuccess.tsx` still has static submitted copy, but its status link now lands on `ApplicationApproved.tsx`, which reads `/api/provider-application/status` and displays the signed-in provider's live pending/approved/rejected application state.

---

## 5. `mobile` — Customer + Provider React Native app

This folder is the most complete. Most remaining gaps are integration with the other surfaces, not internal placeholders.

### Internal gaps

- **No native push notifications** — only foreground polling (`setInterval` on notifications/messages/tracking). The `support_reply`, `support_ticket_resolved`, `booking_cancelled_by_admin` payloads are written to the DB but never delivered via APN/FCM.
- **Active session display** — Settings now reads `/v1/me/sessions` and renders the device's signed-in account, including `last_sign_in_at`. Multi-device session listing remains a backend limitation (no `auth_sessions` table).
- **`renderCustomerHelp` cannot post a reply directly from the help-screen panel** — replies UI was added to the inline support card and Landing account, but the dedicated `customerHelp` screen still uses the original create-ticket form layout.
- **Provider portfolio uploader** uploads a single image then attaches via metadata. No multi-image flow or reordering exists on the device.
- **In-progress timer** only ticks while screen `providerServiceInProgress` is mounted; if the user leaves and returns the timer restarts from the booking's recorded start time (which is correct, but visually jumps).
- **Booking attachments uploaded via `pickAndUploadImage`** rely on the Supabase storage bucket; there's no progress indicator and no retry on transient failure.

### Cross-folder integration gaps where mobile produces data

| Mobile creates | Admin sees | Provider web sees | Landing sees |
| --- | --- | --- | --- |
| Booking | yes | yes | yes (in account) |
| Review | yes (wired this session) | yes (list+reply) | yes (read on provider page + author from completed booking detail) |
| Support ticket + reply | yes | n/a | yes |
| Portfolio media | yes (moderation, wired this session) | yes for load/add/delete/reorder/replace | yes (read-only on provider page) |
| Conversation messages | by design, no | yes (gateway text messages, image attachments, booking/customer labels, and polling) | NO |
| Notification | by design, no | yes (bell polling + mark-read + exact metadata routing for tickets/conversations/bookings/reviews/payments) | yes (account list + mark read) |
| Provider availability | yes (read-only, wired this session) | yes (own page only) | yes (public provider page) |
| Provider payout method | n/a | yes | n/a |
| Provider payout request | yes | yes | n/a |
| Customer payment method | n/a | n/a | yes (account methods + booking payment reservation) |
| Referral activity | n/a | n/a | yes (account summary) |

---

## Cross-folder integration gaps — summary

These are the **bridges** that have to be built for "one product" feel.

1. **Customer signup on Landing Page.** Mobile can register, web cannot. A customer who books from the marketplace homepage today has to install the app first.
2. **Customer payments on Landing Page.** Landing now manages payment methods and can reserve payment from booking detail; richer promotion previews remain a possible enhancement.
3. **Reviews authoring on Landing Page.** Completed web bookings can now post reviews through the gateway; duplicate-review messaging still depends on the review service response.
4. **Live notification feed on FE_Web(Provider).** Landing account and provider web now call `/v1/notifications`; provider web routes deep-link metadata to the relevant page, with exact selection for help tickets, conversations, bookings, reviews, and payments.
5. **Conversations on FE_Web(Provider).** Provider web now lists conversations, enriches them from provider bookings, loads messages, sends text and image attachments, polls for updates, and honors `conversationId` notification links.
6. **Portfolio editing on FE_Web(Provider).** Provider web now manages live portfolio media for load/add/delete/reorder/replace through the gateway and catalog service.
7. **Real-time push (APN/FCM) on mobile.** Today the loop closes via polling; remote delivery is missing.
8. **Application approval status on Landing.** Landing now exposes a signed-in provider status view through `/api/provider-application/status`, backed by `GET /v1/auth/provider-application/me`.
9. **Reports / 2FA / sessions / integrations.** Report CSV exports are wired, but PDF/scheduled reports and several account/security contracts still have 501 or partial backend support.

---

## Remediation backlog (in priority order)

### P0 — Blocks "all folders connected"

1. **Customer auth on Landing Page**
   - Current status: `/register` calls `POST /v1/auth/register` with `role: customer` through the Landing API proxy.
   - Current status: `/forgot-password` calls `POST /v1/auth/password-reset` through the Landing API proxy.
   - Current status: `AccountPage` saves profile fields through `PATCH /v1/me` and password changes through `PATCH /v1/me/password`.

2. **Wire `FE_Web(Provider)` Portfolio**
   - Current status: `PortfolioManagementPage.tsx` loads portfolio through the gateway-backed current provider profile and persists add/delete through `/v1/catalog/provider/portfolio`.
   - Current status: reordered portfolio media is saved through `PUT /v1/catalog/provider/portfolio/order`, which updates catalog-owned `sort_order` values.
   - Current status: existing portfolio media can be replaced by uploading through `/v1/uploads` with `provider_portfolio`, then saving through `PUT /v1/catalog/provider/portfolio/:mediaId`.

3. **Wire `FE_Web(Provider)` Messages**
   - Current status: thread list, booking/customer labels, message list, text sending, image attachment upload/send, polling, and `conversationId` notification deep links are gateway-backed when signed in.

4. **Wire `FE_Web(Provider)` Help center & profile**
   - Current status: `ProviderHelpCenterPage` lists/creates tickets and lists/posts replies through the gateway.
   - Current status: `EditProfilePage` saves business name, bio/description, service area, and years of experience through `updateCurrentUserProfile`; the checked-in database migration now matches the catalog-service RPC call.
   - Remaining: persist social links, profile media, languages, licenses, and certifications only after dedicated backend contracts exist.

### P1 — Closes the customer loop on the web

5. **Customer payment methods + reserve payment on Landing**
   - Current status: `AccountPage` lists/adds/removes methods through `/v1/payments/methods`; `BookingDetailPage` reserves payment through `/v1/payments`.

6. **Reviews authoring on Landing**
   - Current status: completed booking detail shows a review form and calls `/api/reviews`, which proxies `POST /v1/reviews`.

7. **Notifications surface on Landing + FE_Web(Provider)**
   - Current status: Landing `AccountPage` lists notifications and marks them read through `/v1/notifications`.
   - Current status: FE_Web(Provider) bell polls `/v1/notifications`, marks items read, and routes metadata to bookings/help/reviews/messages/earnings.
   - Current status: Provider help center, messages, bookings, reviews, and earnings consume query ids for exact selection, navigation, or highlighting.

8. **Provider availability/portfolio on Landing public profile page**
   - Current status: public provider page shows recent media and active availability windows with upcoming unavailable dates.

### P2 — Backend contracts to unblock current admin UI

9. **Integrations management** — `admin.integrations` table + RPCs are now wired (this session). Live integrations page reads, toggles, tests, and updates webhook/api-key previews. Real outbound `Stripe`/`Twilio`/`Resend` connectivity (actual test pings) is still placeholder logic in `servease_admin_record_integration_test`.
10. **Reports** — CSV exports are wired for bookings, revenue, users, and financial reports. Remaining work: render PDF and ship the worker that picks up `POST /v1/admin/reports/:type/schedules`.
11. **2FA / Admin sessions** — `GET /v1/me/sessions` now returns Supabase Auth-derived session metadata (this session); 2FA TOTP and a dedicated multi-device `auth_sessions` table remain backlog.
12. **Settlement engine** — real settlement run, not just "promote payout to processing".

### P3 — Polish + UX glue

14. **Push notifications on mobile** — APN / FCM topics keyed by user id, payload mirrors `/v1/notifications` rows.
15. **Provider application status endpoint** — `GET /v1/auth/provider-application/me` now backs the Landing status page; remaining polish is unauthenticated lookup by application reference if email-link status checks are required.
16. **Admin Dashboard migration off `useData`** — core Dashboard KPIs now use gateway summaries for bookings, payouts, disputes, users, payments, support, catalog, and provider listings; remaining work is chart-specific historical/customer/provider category endpoints.
17. **Admin orphan pages cleanup** — delete the eight non-routed vertical templates.
18. **Native realtime** — Supabase Realtime channels on bookings/conversations would replace polling in mobile + web.

---

## Files where mock data is still seeded

To make the cleanup explicit:

- `admin/src/contexts/DataContext.tsx` (1 file, ~250 lines)
- `admin/src/services/dataStore.ts` (1 file, large)
- `admin/src/app/pages/Dashboard.tsx` (core KPIs are gateway-backed; customer/provider chart fallbacks still read `useData`)
- `admin/src/imports/pasted_text/dashboard-overview.tsx` (unused)
- `admin/src/app/pages/{MarketplaceSellers,RestaurantSellers,GrocerySellers,PharmacySellers,HospitalDoctors,TaxiVendors,Franchises,Logistics}.tsx` (8 orphan vertical pages)
- `FE_Web(Provider)/src/app/context/ProviderDataContext.tsx` lines 256–321 (mock portfolio, services, profile, blockedDates)
- `FE_Web(Provider)/src/app/components/MessagesPage.tsx` (conversations/messages/text sends/image attachments and booking/customer labels are gateway-backed)
- `FE_Web(Provider)/src/app/components/PortfolioManagementPage.tsx` (load/add/delete/reorder/replace are gateway-backed; local fallback context remains in `ProviderDataContext`)
- `Landing Page/src/app/components/StoreBadges.tsx` (placeholder app-store links)

---

## What is _working_ right now (for reference)

- All five folders authenticate against the same Supabase project.
- All five folders point at the same `api-gateway` on port 5001 (admin/landing via env, mobile via `EXPO_PUBLIC_API_BASE_URL`).
- Bookings, payments, payouts, refunds, support tickets, promotions, categories, services, providers, users, audit logs, reviews, portfolio moderation, provider applications: end-to-end across mobile ⇄ backend ⇄ admin.
- New mutations from this session — admin review hide/restore, portfolio delete, customer suspend/restore, support ticket reply notifications, booking cancel notifications — all write to the same notifications table the mobile bell reads from.

The integration is roughly **85% there** after the 2026-05-17 sweeps: backend, admin, and mobile are fully coupled, FE_Web(Provider) is fully wired, and Landing Page now covers customer notification preferences, payments, reviews, referrals, notifications, support replies, and provider application status. Remaining gaps are 2FA, PDF reports, scheduled reports, real outbound integration test connectors, and native push.
