# Mobile UX refresh — 2026-05-17

> Targeted refactor to surface recent backend additions on the customer and
> provider sides of the React Native mobile app without breaking existing
> flows. Focused on UI/UX clarity — no major restructure of the App.tsx
> monolith.

## Findings

Audit of `mobile/App.tsx` vs `mobile/services/serveaseApi.ts` (70 API
functions) and the route manifest revealed three categories of gaps:

1. **Newly-added backend fields not shown anywhere.**
   - `serviceDescription`, `customerNotes`, `hoursRequired`, `pricingMode`
     all flow into `BookingSummary` (after the 2026-05-17 booking-detail
     migration) but neither the customer nor the provider booking detail
     screens rendered them. Both fell back to title/address/total only.
2. **Dead route — declared but unreachable.**
   - `customerNotifications` was a real route with a real renderer
     (`renderCustomerNotifications`) but no UI entry-point. The customer
     bell on the home hero went to the `more` tab, and the More menu had
     no Notifications row.
   - Providers had no notifications entry at all (no bell, no route).
3. **Stale microcopy.**
   - `renderBookingReview` referred to the customer's notes as "Add-ons"
     and hardcoded "No promo applied" even when a promo was being
     validated.
   - `renderManageBooking` only exposed Cancel + Report Issue, missing
     the obvious "Message Provider" and conditional "Track / View
     Payment" actions.
   - The `View Profile >` link on the customer booking detail and review
     pages was a plain `Text` with no `onPress`.

## Changes

### `mobile/src/domain/booking.ts`

- Imported `BookingPricingMode` from the API types.
- New helpers + tests:
  - `formatBookingDuration(hours)` → e.g. `2 hours`, `1 hr 30 min`,
    `30 min`, `Not specified`.
  - `pricingModeLabel(mode)` → `Flat rate`, `Hourly rate`, `Standard rate`.

### `mobile/src/domain/booking.test.ts`

- Two new test cases covering the new helpers (10/10 booking domain
  tests pass; 40/40 mobile tests overall pass).

### `mobile/App.tsx`

- Customer booking detail (`renderCustomerBookingDetail`): new "Service
  details" card showing description, special instructions, estimated
  duration, and pricing. `View Profile >` link is now a real navigation.
- Provider booking detail (`renderProviderBookingDetail`): extended
  "Service Details" card with the same four rows so providers can see
  what the customer asked for.
- Booking review (`renderBookingReview`): replaced misleading
  "Add-ons"/"Number of service providers" rows with a real
  "Special instructions" section; "Promo code" row now reflects the
  active `promotionValidation` state.
- Customer notification access: the home-screen bell now navigates
  directly to `customerNotifications` (was `more`).
- Manage booking (`renderManageBooking`): adds Message Provider, Track,
  View Payment, and a status-gated Cancel option (Cancel only shown for
  pending/confirmed).
- Provider home hero: new bell button (`providerNotifications` route)
  with unread-dot badge, restructured into a hero row.
- New shared notifications renderer (`renderNotificationsScreen(role)`)
  with role-aware "back" target so both customer and provider use the
  same component without coupling.

### `mobile/src/navigation/types.ts`

- Added `providerNotifications` to the detail-screen union.

### `mobile/src/screens/CustomerMoreScreen.tsx`

- Added Notifications row to the More menu.
- Optional `unreadNotificationCount` prop renders a red pill badge next
  to the Notifications row when unread.

## Verification

- `npx tsc --noEmit` — clean.
- `npm test` (tsx --test on services + domain + screen test files) —
  **40/40 pass** including two new booking-domain assertions.

## Parity update (2026-05-17, evening)

Following a cross-frontend audit (Landing Page, FE_Web(Provider), backend),
two more capabilities present elsewhere were missing on mobile:

### 1. Provider performance insights

FE_Web(Provider) ships a `ProviderPerformanceInsightsPage`. The mobile app
already fetched `providerDashboard.performance` (acceptance rate,
completion rate, response time) but only used it for one metric card on
the home screen.

- New route `providerInsights` (`mobile/src/navigation/types.ts`).
- New `renderProviderInsights()` in App.tsx with three sections:
  performance metrics, booking activity (uses local `bookings` array for
  totals/cancellations/repeat customers), and contextual growth tips.
- Reachable from provider home Quick Actions and the More tab.

### 2. Granular notification preferences

Backend `/v1/me/preferences` returns
`notificationPreferences: Record<string, unknown>`. Both Landing Page
and FE_Web(Provider) expose this field. Mobile's `UserPreferenceSummary`
type omitted it, so per-category toggles were impossible.

- Added `notificationPreferences` to mobile `UserPreferenceSummary` and
  `UpdateUserPreferencesRequest`.
- Added helpers `getNotificationCategoryEnabled` and
  `toggleNotificationCategory` in App.tsx.
- Customer settings notification section now has four toggles: booking
  updates, payment alerts, messages, promotions. Defaults to `true` if
  the backend hasn't seen a setting yet.

### Verification

- `npx tsc --noEmit` — clean.
- `npm test` — **40/40 pass**.

## Out of scope (followups noted)

- Replies on individual reviews are still not surfaced because
  `ReviewSummary` does not include the provider's response. Backend
  enhancement candidate.
- App.tsx is still a 7900+ line monolith. Splitting into per-screen
  files is a larger refactor that should be planned separately to
  preserve the substantial shared state in the root component.
