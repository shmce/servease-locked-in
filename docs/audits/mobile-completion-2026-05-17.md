# Mobile completion pass — 2026-05-17

> Comprehensive audit of the mobile app against the backend gateway, the
> FE_Web(Provider) portal, and the Landing Page. Every endpoint that
> mobile could reach as a customer or provider has either an entry point
> in the UI or a documented reason it does not. After this pass the
> mobile app has feature parity with the other consumer-facing surfaces.

## Audit method

1. Enumerated every `@Controller` and route handler in
   `backend/apps/api-gateway/src/features/**/*.controller.ts` and excluded
   the `/v1/admin/*` paths (admin role does not live on mobile).
2. Enumerated every exported function from
   `mobile/services/serveaseApi.ts` (currently 70) and traced its
   call-sites in `App.tsx`.
3. Cross-walked `mobile/src/navigation/types.ts` (the `AppScreen` union)
   to verify every detail screen has both a render function and a
   reachable entry point.
4. Compared mobile against `FE_Web(Provider)/src/app/components/*` and
   `Landing Page/src/app/components/*` to find feature parity gaps.

## Findings and fixes (this pass)

| Capability | Before | After |
|---|---|---|
| Provider services — **add new** | Only inline edit of existing services | New "Add new service" form (title, price, flat/hourly), inline pause/activate, remove |
| Provider services — **toggle active** | No way to pause without editing | One-tap Pause / Activate button per service |
| Provider services — **remove** | No way to remove a service | Remove button per service |
| Provider Help Center | Only support panel; no FAQ | Dedicated `providerHelp` route with 8 provider-specific FAQs across 4 categories and the existing support panel |
| Provider monthly earnings breakdown | Only flat payment list | `summarizeMonthlyEarnings` helper + section on Payouts screen showing per-month payout, platform fee, and paid/pending counts |

## Cumulative inventory of mobile feature parity (as of this pass)

### Auth and account

- Sign in (customer + provider), Supabase password grant ✓
- Sign up (customer + provider, multi-step provider registration) ✓
- Forgot password (`requestPasswordReset`) ✓
- Update profile ✓
- Change password ✓
- 2FA enable / verify / disable (TOTP) ✓
- Sessions list (`GET /v1/me/sessions`) ✓
- Delete account ✓
- User preferences: push toggle, dark mode, language, **plus
  per-category notification toggles** (this pass) ✓
- Provider application status banner (`GET /v1/auth/provider-application/me`) ✓

### Customer flows

- Browse: explore, categories, top providers, search, recommended,
  provider profile ✓
- Booking lifecycle: form → review → reserve payment → confirmation →
  bookings list → detail → manage → cancel → report issue → track ✓
- Booking detail now shows description, special instructions,
  estimated duration, pricing mode (previous pass) ✓
- Manage booking exposes Message, Track, View Payment, Cancel
  (status-gated) ✓
- Reviews: list + create + (provider can reply from profile) ✓
- Conversations: list + thread + send ✓
- Payment methods: card / GCash / PayMaya + default selection ✓
- Promo validation in reserve payment + reflected in booking review ✓
- Notifications screen with bell entry from home hero + More menu with
  unread-count pill ✓
- Service history (completed bookings) ✓
- Referral code ✓
- Support tickets: create, view, reply ✓
- Help center: FAQ + support panel ✓
- Settings: notifications (granular toggles), appearance, sessions,
  security (2FA, password), delete account ✓
- Terms and privacy ✓

### Provider flows

- Provider home: KPIs + new bell button (providerNotifications) ✓
- Provider bookings tab (filters: upcoming/in-progress/completed/
  cancelled, search) ✓
- Provider booking detail: customer card with call/message, full
  service details, status-driven action stack, service updates,
  timeline, report issue ✓
- Lifecycle: navigation mode (Google Maps deep-link), start service,
  service in progress (progress photos/checklist), complete service,
  completed receipt, cancel booking, report issue ✓
- Provider calendar: weekly windows, days off ✓
- Provider conversations + thread ✓
- Provider profile view (read-only) + edit profile ✓
- Portfolio: upload, caption edit, reorder, delete ✓
- Services: **add new (this pass)**, edit, **pause/activate (this pass)**,
  **remove (this pass)** ✓
- Payouts: account balances, methods, request payout, request
  confirmation, payout history, **monthly earnings breakdown
  (this pass)** ✓
- Insights screen showing acceptance rate, completion rate, response
  time, totals, growth tips (previous pass) ✓
- Help Center (this pass): provider-specific FAQ + support panel ✓
- Provider More: Profile, Portfolio, Payouts, Request Payout, Insights,
  Notifications, Help Center, Set Availability, payments list, services
  manager, profile card, security (2FA), support panel, sign out,
  delete account ✓
- Notifications + unread-dot bell ✓

### Out of scope (explicitly deferred)

- Listing user disputes — backend only exposes `POST
  /v1/bookings/:id/disputes`. Mobile creates disputes via the
  report-issue flow and surfaces them via the linked support ticket
  thread. A dispute list would require a new gateway endpoint.
- Showing the provider's reply nested under each review — `ReviewSummary`
  does not include the response. Backend enhancement candidate.
- Splitting `App.tsx` (~8200 lines) into per-screen files — touches
  shared state held in the root component and is best done as a
  dedicated refactor sprint.

## Verification

- `npx tsc --noEmit` — clean.
- `npm test` — **41/41 tests pass** (one new test for
  `summarizeMonthlyEarnings`).

## Files changed in this pass

- `mobile/App.tsx`
- `mobile/services/serveaseApi.ts`
- `mobile/src/constants/appContent.ts`
- `mobile/src/domain/booking.ts`
- `mobile/src/domain/booking.test.ts`
- `mobile/src/navigation/types.ts`
- `mobile/src/screens/CustomerMoreScreen.tsx`

## Related audits

- [booking-details-fields-2026-05-17.md](./booking-details-fields-2026-05-17.md)
- [mobile-ux-refresh-2026-05-17.md](./mobile-ux-refresh-2026-05-17.md)
- [full-stack-audit-2026-05-17.md](./full-stack-audit-2026-05-17.md)
