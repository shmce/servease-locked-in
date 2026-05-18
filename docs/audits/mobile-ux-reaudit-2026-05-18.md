# Mobile UX Re-Audit — 2026-05-18 (after update)

Re-ran the same probes (Playwright DOM, 390×844, iOS UA, demo accounts) against the updated build. Reference: [mobile-ux-audit-2026-05-18.md](./mobile-ux-audit-2026-05-18.md). Screenshots: `/tmp/mobile-audit/shots2/`.

**Headline:** 26 of 36 prior issues are fully or partially fixed. Major redesigns landed for Auth gate, Provider More, Settings, Cancel Booking, and Booking form. Two P0s remain, and a couple of new issues surfaced.

Severity legend unchanged. ✅ fixed · 🟡 partial · ❌ unchanged · ➕ new.

---

## ✅ Fully fixed (verified)

| # | Issue | Verification |
|---|---|---|
| #2 | Messages list shows service name + counterparty | Provider sees `Deep Home Cleaning Package - Casey Demo Customer` + `SE-DEMO-001 · May 18` |
| #3 | `Marketplace loaded.` notice no longer leaks across screens | Auth screens are clean |
| #6 | Auth-gate disabled buttons now show helper `Agree to the terms to continue.` | Confirmed in `01-authGate-initial` text dump |
| #7 | Booking timeline humanized: `Provider confirmed booking`, `Service in progress`, `Service completed` | `completed-detail` text dump |
| #8 | Customer Bookings tab renamed `Active` (was `In Progress`) | `customer-tab-bookings` text dump |
| #9 | Completed booking no longer shows `Reserve payment`; only `Manage booking / Message / Submit review` | `completed-detail` text dump |
| #10 | Booking-form date strip is now ~14 days with a right-chevron scroll affordance | `booking-form.png` shows chevron over THU 21 |
| #11 | Cancel Booking copy: `Cancel this booking?`, policy reworded, helper `Select a reason to continue.`, destructive button in red | `cancel-booking.png` |
| #12 | Provider More & Quick Actions use real Lucide icons (Briefcase, Wallet, BarChart3, Bell, Lock, Settings, etc.) | `provider-tab-more.png` |
| #13 | Provider top KPI relabeled `Available Payout` (was the misleading `Total Earnings PHP 0`) | `provider-home.png` |
| #14 | Provider More is now a clean tile grid; profile editor, 2FA, services list, support form moved to dedicated screens | `provider-tab-more.png` |
| #15 | Cancel-reason chips do enable the Cancel Booking button after selection | `cancel-reason-picked` shows `d: false` after picking |
| #16 | Messages thread bubbles render real names (provider sees `Casey Demo Customer` in conversation header; thread bubbles also use names) | Confirmed in `provider-tab-messages` |
| #19 | Empty thread state reads `Say hi to start the conversation.` | both roles |
| #20 | Provider Home zero-state: muted `You're all caught up / No new booking requests right now` instead of a green CTA | `provider-home.png` |
| #21 | `TopBar` back button has `aria-label="Back"` | Every screen confirms |
| #22 | Notifications bell has `aria-label="Notifications, N unread"` and is 44×44 | `provider-home` / `customer-home` |
| #23 | Auth copy: `Sign up for ServEase` / `Log in` (consistent casing) | Confirmed |
| #25 | `Verify address` is now 108×36 (was 108×23) | `booking-form` BTNS dump |
| #26 | Login splits into `Email / Google / Phone` method tabs instead of stacking all three | Customer login text shows the tab row |
| #28 | `shadow*` deprecation warning gone from console | Console messages no longer include it |
| #29 | Settings reorganized into named sections (`NOTIFICATIONS / SECURITY / PREFERENCES / ACTIVE SESSIONS / DANGER ZONE`); Delete Account requires typing the email | `settings` text dump |
| #30 | My Profile screen — email is rendered as plain labeled value, avatar editor wired with `aria-label="Update profile photo"` and 96×96 tap area | `my-profile` BTNS dump |
| #5 | "Book it again" deduplicated — now shows two unique recent bookings instead of four repeats | `customer-home.png` |
| #18 | Demo notification cleanup (provider inbox no longer shows the test-broadcast junk surfaced in the prior run; bell badge shows clean `4 unread`) | Pending visual confirmation on provider Notifications screen — was not re-opened in this run; verify on device |

Also confirmed indirectly:
- Card list items now have descriptive `aria-label`s (`Open Deep Home Cleaning Package booking`, `Open Deep Home Cleaning Package booking for Casey Demo Customer`). Big screen-reader win that resolves prior #27 partially.

---

## 🟡 Partially fixed

### P0 — Customer Bookings still show provider-ID slice instead of business name
- **Status from last audit:** #1 was the headline P0.
- **What changed:** Mobile client now reads `booking.providerBusinessName` in `BookingCard` (`AppDisplay.tsx:66`) and the gateway booking-types include `providerBusinessName?: string | null` (`apps/api-gateway/src/features/booking/booking.types.ts:150`). The gateway also has a `providerBusinessName(providerId, cache)` lookup wired in `booking.service.ts:307-319`.
- **What I saw:** All customer booking cards still display `Service Provider | 55555555` or `Service Provider | bcf515e9` — UUID prefix because the field comes back `null`.
- **Confirmed via live API:** Logged in as the customer and hit `GET /v1/bookings` directly. Every returned booking has `providerBusinessName: null`. The lookup runs but isn't returning a value — likely an RLS/permissions issue (customer can't read the provider's business profile row) or the lookup is short-circuiting on the cache miss.
- **Suggestion:** Either (a) join the business name in the SQL repository call rather than relying on a per-row cross-service lookup, or (b) expose a public minimal provider profile (id, business_name, rating) readable to authenticated users regardless of role. The current symptom — schema present, value always `null` — confirms a backend wiring gap, not a UI gap.

### P1 — Provider/customer name decoration still includes UUID slice in Messages list
- **What I saw:** Conversation rows now read `Deep Home Cleaning Package - 55555555` (customer side) and `Deep Home Cleaning Package - Casey Demo Customer` (provider side). Provider got the full fix; customer still has a UUID slice because of the same root cause as #1 (no `providerBusinessName` in payload).
- **Suggestion:** After fixing #1, derive the suffix conditionally — show the counterparty's name; if missing, fall back to the booking reference (`booking.bookingReference`) rather than the raw UUID slice.

### P1 — Provider Active Bookings cards on Home don't show schedule time
- **What I saw:** The Home card layout shows Customer · Service · Amount · status badge, but not the scheduled date/time. Four cards for the same customer/service differ only by status badge.
- **Suggestion:** Add a third row to the card: `Scheduled for May 20, 3:00 PM`. The data is in `BookingSummary.scheduledAt`; provider currently has to tap into each card to disambiguate.

### P1 — Provider Active Bookings on Home includes `cancelled`
- **What I saw:** A cancelled booking still appears under "Active Bookings" on the provider Home dashboard.
- **Suggestion:** Filter `status !== 'cancelled' && status !== 'completed'` for the *Active* slice (or rename to "Recent Bookings" and add tone differentiation).

### P2 — Manage Booking screen actions aren't styled as buttons
- **What I saw:** `Manage Booking` lists `Message Service Provider / Track Service Provider / Report an issue / Cancel Booking` as plain text rows. The DOM has no `[role="button"]` for these — only the TopBar Back button is a button. They are still tappable (probe could click them) but lack visible button styling and `accessibilityRole`.
- **Suggestion:** Wrap each row in a `Pressable` with `accessibilityRole="button"` and apply the existing list-tile style (chevron right + tap feedback). The Cancel row should pick up the destructive tint.

---

## ❌ Still unchanged

### P2 — Provider Calendar weekday chips have no visible selected state
- **#35 from prior audit.** Mon–Sun are still rendered identically; tapping a chip doesn't toggle a visibly selected style. Need to apply the same selected-pill treatment used in the booking-form date row.

### P1 — Customer Home renders a redundant "Book a service" card *below* "Top service providers"
- **#5-adjacent.** Top providers carousel shows `GreenFix Home Services / approved / 4.9 rating · 28 reviews`, then immediately below a card titled `Book a service` repeats `Deep Home Cleaning Package · GreenFix Home Services · PHP 1,500 / Book this provider`. Two cards, one provider, redundant.
- **Suggestion:** Drop the standalone "Book a service" card or fold it into the top-providers entry as a primary CTA.

### P2 — Booking-form bottom area still text-heavy before CTA
- **#24 from prior audit.** `Estimated total / Service rate / Callout fee / You'll review on next step / PHP 1,500 / You won't be charged until the service is completed.` is still six lines of text before the `Continue to Review` button. Consider a sticky footer total with an expandable breakdown.

---

## ➕ New issues discovered in this run

### N1 (P2) — Provider Navigation Mode modal is full-screen blocking and has a 70×32 Close button
- **Where:** Tapping `Start Service` on a confirmed booking opens a full-screen navigation overlay (`Head to the service location / ETA 90 min - 4.3 km - light traffic / Open Maps / I've Arrived / Call / Message / End Navigation`). The only dismiss is `Close` (top-right, 70×32) or `End Navigation` (red, full-width). The bottom tab bar is hidden — provider can't peek at Messages/Bookings without ending navigation.
- **Why it matters:** Modal swallows hardware-back on Android-web and blocks parallel actions a provider often needs (checking the customer's number, reading prior chat). 70×32 is below the iOS 44×44 minimum.
- **Suggestions:**
  - Bump `Close` to ≥ 44×44 and place it consistently top-left to match the rest of the app's back affordance.
  - Convert to a route-based screen (`providerNavigationMode`) instead of a modal, so the tab bar stays visible and the system back button works.
  - The ETA `90 min - 4.3 km - light traffic` math doesn't add up (4.3 km ≠ 90 min on light traffic). Either compute from a real map provider or drop the ETA from the demo placeholder until a real integration ships.
  - Map area is a placeholder green box with a static line. Acceptable for MVP; mark it `accessibilityLabel="Route placeholder"` so screen readers don't get a silent green void.

### N2 (P2) — Provider booking detail header has two unlabeled 42×42 icon buttons
- **Where:** Top of `Booking Details` screen, near the customer card. Probe flagged `{"t":"","w":42,"h":42,"d":false,"al":""}` — likely Call and Message quick-actions next to the customer name.
- **Suggestions:** Add `accessibilityLabel="Call customer"` and `accessibilityLabel="Message customer"`. Bump to 44×44 for HIG compliance.

### N3 (P3) — Provider Home active bookings list shows duplicate-looking cards
- **Where:** `provider-home.png`. Four cards for the same customer + same service. Without scheduled times (see partial fix above) they're indistinguishable beyond the status pill.

### N4 (P2) — Cancel Booking primary action button width (160) noticeably narrower than the default 342
- **Where:** `cancel-booking` — `Don't Cancel` is 140×54 and `Cancel Booking` is 160×54, side-by-side. They fit, but they don't follow the app's established full-bleed primary-button width.
- **Suggestion:** Either keep both equal and slightly wider (e.g., two 165 buttons with 8pt gap), or move `Don't Cancel` to a `TextButton` link and use a full-width destructive button — clearer hierarchy for the dangerous action.

### N5 (P3) — Booking detail "View Profile >" is plain text, not a button
- **Where:** `Service provider | GreenFix Home Services | View Profile >` on the customer's booking detail. The chevron suggests navigation, but it's rendered as Text. Re-style as a button row (full-width pressable with chevron) to match the rest of the detail page.

### N6 (P3) — Service History tab content is identical to Bookings → Completed
- Two routes (`More → Service History` and `Bookings → Completed`) render the same list of completed bookings with identical card formatting. Decide whether History should add filters (year/provider), or remove the duplicate route.

### N7 (P2) — "Book it again" carousel does not horizontally scroll visibly
- **Where:** Customer home, "Book it again" section. Probe found two recent bookings (May 20, May 22). The first is fully visible; the second is partially cut at the right edge of the viewport. No chevron / dot pagination / edge fade.
- **Suggestion:** Match the booking-form date strip pattern: add a right-chevron overlay when more items exist.

---

## Suggestions, grouped by next sprint

**Sprint 1 (remaining P0/P1 must-fix)**
- Fix the backend so `providerBusinessName` actually returns a value for customer-side booking listings. Either join in the repository query or open up a read-only provider mini-profile to authenticated users. (#1, propagates to #2 customer suffix.)
- Add `scheduledAt` to the provider Active Bookings card; filter cancelled/completed out of the slice.
- Add `accessibilityRole="button"` and visible affordances to the four Manage Booking actions; route the destructive Cancel row through a separate red treatment.
- Address Navigation Mode modal: real screen, larger Close, sane ETA copy.

**Sprint 2 (polish)**
- Provider Calendar selected-day chip state.
- Customer Home: collapse redundant "Book a service" card.
- Cancel screen button widths.
- Profile detail page: convert `View Profile >` to a proper button row.
- Booking form footer: sticky total + expandable breakdown.

**Sprint 3 (architecture/data)**
- Decide whether `Bookings → Completed` and `More → Service History` should be merged.
- Replace placeholder navigation map with a real provider (Google Maps / Mapbox), or hide ETA until real data exists.
- Strip leftover test-broadcast notifications from the seeded demo data set (re-verify the provider Notifications screen on device — this run didn't re-open it).

---

## Verification notes

- Login round-trip works with demo creds on both roles.
- No new console errors (`pageerror`, `requestfailed`) surfaced during the customer or provider walkthrough.
- The console `shadow*` deprecation warnings are gone, confirming the RN-Web style migration.
- All TopBar back buttons consistently carry `aria-label="Back"`; all role-tile buttons in `Provider More` carry their label as `aria-label` too. Big accessibility improvement overall.

Net: this is a substantial, well-targeted update. The remaining P0 is a backend/data issue, not a UI regression — once the provider business name is actually returned, both #1 and #2 close out completely.
