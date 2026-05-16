# ServEase 5-Folder Integration Audit

_Generated: 2026-05-17 — analysis only, no code changes._

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
| `GET /v1/me/sessions` | `current-user.controller.ts` | Returns empty array; admin Security has no live session data. |
| `PATCH /v1/admin/integrations/:provider/credentials` | `admin-integration.controller.ts:28` | Stripe / Twilio / Resend credential storage doesn't persist. |
| `POST /v1/admin/integrations/:provider/test` | `admin-integration.controller.ts:39` | "Test integration" buttons return 501 even when wired. |
| `GET /v1/admin/reports/revenue.pdf` | `admin-report.controller.ts:32` | PDF revenue export is a stub. |
| `POST /v1/admin/reports/:type` | `admin-report.controller.ts:72` | Generate-report stub. |
| `POST /v1/admin/reports/:type/schedules` | `admin-report.controller.ts:83` | Scheduled-report stub. |

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
| `app/pages/Dashboard.tsx` | `useData()` for `payoutRequests`, `disputes`, `dashboardStats` | `listAdminPayouts`, `listAdminDisputes`, `getAdminBookingsSummary` all exist. Dashboard mixes both today. |
| `contexts/DataContext.tsx` | Entire mock store (customers, bookings, payoutRequests, refunds, audit logs) | Only `Customers.tsx` was migrated; **Dashboard still reads mock**. |
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
| `ServiceProviderDetails.tsx` | Documents tab uses `DOCUMENT_TYPES` mock array and `DEFAULT_PROVIDER` fallback. Real provider applications already have document download endpoints — the live tab needs to be wired. |
| `ServiceAreas.tsx` | "Interactive Map Coming Soon" panel — no geo backend exists. |
| `Analytics.tsx`, `ReportsInsights.tsx`, `RevenueReports.tsx`, `reports/*.tsx` | Use mock chart data; backend reports are 501 stubs. |
| `Profile.tsx` | Falls back to `admin@servease.ph` hard-coded email when no profile. |
| `Security.tsx` | Lists integrations and 2FA toggles that all hit 501 backends. |
| `AddNewAdmin.tsx` | Now submits to the gateway-backed admin user creation flow. Invitation email and RBAC templates are still not implemented. |
| `PlatformSettingsPages.tsx` ➜ `Integrations` | Reads/writes integration credentials → 501. |
| `PlatformSettingsPages.tsx` ➜ `NotificationSettings` | Saves to preference metadata only, never used by any service. |

### Endpoints called by admin that need missing backend pieces

- `BackendSupportMatrix.tsx` already enumerates these. The audit doc and the matrix agree on the same set.

---

## 3. `FE_Web(Provider)` — Provider web app

Service module `serveaseProviderApi.ts` exposes a near-complete API surface, but several components ignore it and use local mock state.

### Components that don't talk to the backend at all

| Component | Mock backing | Live API exists |
| --- | --- | --- |
| `PortfolioManagementPage.tsx` | Now loads the current provider portfolio from `/v1/provider/profile` and uses gateway add/delete endpoints. Remaining local-only behavior: ordering and replacing existing media URLs. | Add `PUT /v1/catalog/provider/portfolio/order` and a media replacement/upload flow if ordering and replacement are required on web. |
| `MessagesPage.tsx` | Loads gateway conversations/messages, polls for updates, sends text messages when a provider token exists, and honors `conversationId` deep links. Image attachments remain local preview only. | Add booking/customer display enrichment and a real attachment upload contract for message media. |
| `EditProfilePage.tsx` | Saves business name, bio/description, service area, and years of experience through `PATCH /v1/me`, then refreshes local context from the gateway response. Social links, photos, licenses, and certifications remain local-only fields. | Add explicit provider social/profile-media/license contracts before persisting those optional fields. |
| `ProviderProfilePage.tsx` | Renders the provider profile context, which is hydrated from `/v1/provider/profile` on app load and updated by Edit Profile for the backend-backed fields. Cover/profile photos and languages still use local fallback/context values. | Add profile media and language contracts if those should be cross-device. |
| `ProviderHelpCenterPage.tsx` | Now lists provider support tickets, creates new tickets, and reads/posts ticket replies through `/v1/support/tickets`. Static FAQ remains as help content. | Attachments and status changes stay with support/admin contracts. |
| `BlockTimePage.tsx` | Uses `ProviderDataContext.addBlockedDates`, which writes each selected date through `/v1/provider/availability/days-off`. Recurring controls are visual-only. | Add a recurring unavailability backend contract before enabling recurring blocks. |
| `CalendarPage.tsx` | Local mock events; doesn't load bookings on the day | `listProviderBookings` exists and unused. |
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

- **Notifications bell** — `Layout.tsx` now polls `/v1/notifications`, marks items read, and routes booking/ticket/review/message/payment metadata to the relevant provider page. Help center and messages select exact `ticketId` / `conversationId` query targets when present; bookings/reviews/earnings still land at the relevant page.
- **Review reply UI** — `ProviderReviewsPage.tsx` calls `listProviderReviews` + `replyToReview` but doesn't surface a "Flag review" button despite `flagReview` existing.
- **In-progress service actions** — there is no equivalent of the mobile provider's "Start service / Submit completion photo" flow on web.
- **Pre/Progress/Completion photo uploads** — `addProviderPortfolioMedia` exists but no booking-level media uploads are exposed to web.
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
- `ApplicationApproved.tsx` and `ProviderRegSuccess.tsx` — the success page tells the provider to wait for approval but there's no live status check; the user has to manually re-attempt sign-in to discover approval.

---

## 5. `mobile` — Customer + Provider React Native app

This folder is the most complete. Most remaining gaps are integration with the other surfaces, not internal placeholders.

### Internal gaps

- **No native push notifications** — only foreground polling (`setInterval` on notifications/messages/tracking). The `support_reply`, `support_ticket_resolved`, `booking_cancelled_by_admin` payloads are written to the DB but never delivered via APN/FCM.
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
| Portfolio media | yes (moderation, wired this session) | yes for load/add/delete; reorder/replacement still missing | yes (read-only on provider page) |
| Conversation messages | by design, no | **NO — provider web is mocked** | NO |
| Notification | by design, no | **NO — Layout polls but rendering minimal** | yes (account list + mark read) |
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
4. **Live notification feed on FE_Web(Provider).** Landing account and provider web now call `/v1/notifications`; provider web routes deep-link metadata to the relevant page, with exact selection for help tickets and conversations.
5. **Conversations on FE_Web(Provider).** Currently mocked — providers can't actually message customers from the laptop.
6. **Portfolio editing on FE_Web(Provider).** Local-state-only; providers manage real portfolio media on mobile only.
7. **Real-time push (APN/FCM) on mobile.** Today the loop closes via polling; remote delivery is missing.
8. **Application approval status on Landing.** After provider registration, the only way a provider knows their app was approved is by trying to sign in again. A status endpoint + Landing display would close the loop.
9. **Reports / 2FA / sessions / integrations.** Several 501 stubs remain in `backend`; the admin UI is built but those contracts behind the buttons are still empty.

---

## Remediation backlog (in priority order)

### P0 — Blocks "all folders connected"

1. **Customer auth on Landing Page**
   - Current status: `/register` calls `POST /v1/auth/register` with `role: customer` through the Landing API proxy.
   - Current status: `/forgot-password` calls `POST /v1/auth/password-reset` through the Landing API proxy.
   - Current status: `AccountPage` saves profile fields through `PATCH /v1/me` and password changes through `PATCH /v1/me/password`.

2. **Wire `FE_Web(Provider)` Portfolio**
   - Current status: `PortfolioManagementPage.tsx` loads portfolio through the gateway-backed current provider profile and persists add/delete through `/v1/catalog/provider/portfolio`.
   - Remaining: add `PUT /v1/catalog/provider/portfolio/order` for reorder and a storage-backed replacement/upload UI for existing media.

3. **Wire `FE_Web(Provider)` Messages**
   - Current status: thread list, message list, text sending, polling, and `conversationId` notification deep links are gateway-backed when signed in.
   - Remaining: enrich customer/booking labels and support real message attachments.

4. **Wire `FE_Web(Provider)` Help center & profile**
   - Current status: `ProviderHelpCenterPage` lists/creates tickets and lists/posts replies through the gateway.
   - Current status: `EditProfilePage` saves business name, bio/description, service area, and years of experience through `updateCurrentUserProfile`.
   - Remaining: persist social links, profile media, languages, licenses, and certifications only after dedicated backend contracts exist.

### P1 — Closes the customer loop on the web

5. **Customer payment methods + reserve payment on Landing**
   - Current status: `AccountPage` lists/adds/removes methods through `/v1/payments/methods`; `BookingDetailPage` reserves payment through `/v1/payments`.

6. **Reviews authoring on Landing**
   - Current status: completed booking detail shows a review form and calls `/api/reviews`, which proxies `POST /v1/reviews`.

7. **Notifications surface on Landing + FE_Web(Provider)**
   - Current status: Landing `AccountPage` lists notifications and marks them read through `/v1/notifications`.
   - Current status: FE_Web(Provider) bell polls `/v1/notifications`, marks items read, and routes metadata to bookings/help/reviews/messages/earnings.
   - Current status: Provider help center and messages auto-select `ticketId` / `conversationId` query targets.
   - Remaining: bookings, reviews, and earnings can optionally auto-select exact ids from the query string.

8. **Provider availability/portfolio on Landing public profile page**
   - Current status: public provider page shows recent media and active availability windows with upcoming unavailable dates.

### P2 — Backend contracts to unblock current admin UI

9. **Integrations management** — settings table + real `Stripe`/`Twilio`/`Resend` test connectors.
10. **Reports** — render CSV and PDF; ship the worker that picks up `POST /v1/admin/reports/:type/schedules`.
11. **2FA / Admin sessions** — TOTP + an `admin_sessions` table.
12. **Settlement engine** — real settlement run, not just "promote payout to processing".

### P3 — Polish + UX glue

14. **Push notifications on mobile** — APN / FCM topics keyed by user id, payload mirrors `/v1/notifications` rows.
15. **Provider application status endpoint** — `GET /v1/auth/provider-application/me` so the Landing success page can show "pending review", "approved", "more info needed".
16. **Admin Dashboard migration off `useData`** — finish the mock-data → live-API switch started for Customers.
17. **Admin orphan pages cleanup** — delete the eight non-routed vertical templates.
18. **Native realtime** — Supabase Realtime channels on bookings/conversations would replace polling in mobile + web.

---

## Files where mock data is still seeded

To make the cleanup explicit:

- `admin/src/contexts/DataContext.tsx` (1 file, ~250 lines)
- `admin/src/services/dataStore.ts` (1 file, large)
- `admin/src/app/pages/Dashboard.tsx` (mixed: real + mock)
- `admin/src/imports/pasted_text/dashboard-overview.tsx` (unused)
- `admin/src/app/pages/{MarketplaceSellers,RestaurantSellers,GrocerySellers,PharmacySellers,HospitalDoctors,TaxiVendors,Franchises,Logistics}.tsx` (8 orphan vertical pages)
- `FE_Web(Provider)/src/app/context/ProviderDataContext.tsx` lines 256–321 (mock portfolio, services, profile, blockedDates)
- `FE_Web(Provider)/src/app/components/MessagesPage.tsx` lines 282–349 (mock conversations array)
- `FE_Web(Provider)/src/app/components/PortfolioManagementPage.tsx` (entire file is local state)
- `Landing Page/src/app/components/StoreBadges.tsx` (placeholder app-store links)

---

## What is _working_ right now (for reference)

- All five folders authenticate against the same Supabase project.
- All five folders point at the same `api-gateway` on port 5001 (admin/landing via env, mobile via `EXPO_PUBLIC_API_BASE_URL`).
- Bookings, payments, payouts, refunds, support tickets, promotions, categories, services, providers, users, audit logs, reviews, portfolio moderation, provider applications: end-to-end across mobile ⇄ backend ⇄ admin.
- New mutations from this session — admin review hide/restore, portfolio delete, customer suspend/restore, support ticket reply notifications, booking cancel notifications — all write to the same notifications table the mobile bell reads from.

The integration is roughly **75% there**: backend + admin + mobile are well-coupled; the two web frontends (Landing Page + FE_Web(Provider)) are the remaining gap.
