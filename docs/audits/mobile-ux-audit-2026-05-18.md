# Mobile UX Audit — 2026-05-18

Inspected via Expo Web (`expo start --web`, viewport 390×844, iOS UA) using Playwright DOM/snapshot inspection against demo accounts (`customer.demo@servease.test` / `provider.demo@servease.test`, password `ServEaseDemo#2026`). Backend gateway live; demo seed verified via `npm run smoke:demo-api`.

Severity legend
- **P0** — Blocks or breaks core flow / data-correctness bug.
- **P1** — Confusing, looks broken, hurts trust.
- **P2** — Polish / consistency / accessibility / copy.

Where I can quote a line, paths point to `mobile/...`.

---

## P0 — Functional / Correctness

### 1. Customer bookings list always says "Service Provider: Assigned provider"
- **Where:** `src/components/AppDisplay.tsx:48-54` (`BookingCard`) — also surfaces in `cust-tab-bookings`, `cust-bookings-completed`.
- **What I saw:** Every booking card in the customer's Bookings tab (both *In Progress* and *Completed*) shows the literal string `Assigned provider` instead of the provider's business name.
- **Root cause:** The component hard-codes `'Assigned provider'` for the customer side; it never reads the provider name. `BookingSummary` in `mobile/services/serveaseApi.ts:103-122` exposes `providerId` but no `providerBusinessName`/`providerName` — the API payload doesn't include it.
- **Fix:** Add `providerBusinessName` to `BookingSummary` (and the gateway booking summary mapper), then render `booking.providerBusinessName ?? booking.providerId.slice(0,8)`. Same change matches how the provider side handles `customerFullName`.

### 2. Messages list shows raw booking UUID prefixes, no service/counterparty name
- **Where:** `App.tsx:4545-4551`, screen `customer-tab-messages` / `provider-tab-messages`.
- **What I saw:** Every conversation row reads `Booking conversation` / `Booking 88888888 · May 18, 5:37 AM` — there's no service title, no counterparty name, and the UUID prefix means nothing to a user.
- **Fix:** Look up the booking by `conversation.bookingId` and render `{serviceTitle} — {counterpartyName}` with the booking reference (`SE-…`) as the secondary line instead of the UUID slice.

### 3. Notice `Marketplace loaded.` persists across screens including auth
- **Where:** `App.tsx:728` (`setNotice('Marketplace loaded.')` after catalog load) and the `notice` prop is rendered as a footer on every auth screen (`AuthScreens.tsx:124, 207, 319`).
- **What I saw:** Right after the catalog finishes loading, "Marketplace loaded." appears in the *Customer Login* footer and the *Sign up* screen, where it's totally out of context.
- **Fix:** Clear `notice` on screen transitions (in `navigate()`), or scope the catalog-loaded toast to surfaces that need it. The success message itself ("Marketplace loaded.") is dev-flavored copy; either remove or drop it into a transient toast.

### 4. Provider Home active-booking cards don't navigate on tap (web)
- **Where:** `App.tsx:5492-5498` — `ProviderBookingRow` rendered inside `Section`. Tapping the card visually highlights but does not navigate to `providerBookingDetail`.
- **What I saw:** In the probe, clicking the card body kept the same page text; navigating via the *Bookings* tab works. Likely a nested-Pressable / event swallow issue on RN Web. Same `openBooking` is wired identically from the *Bookings* tab and works there.
- **Fix:** Audit `ProviderBookingRow` for the actual pressable hit target — make the outermost wrapper the `Pressable`, ensure inner `Text` doesn't intercept events on web. Verify on native too; the call site already passes `onPress`.

### 5. Customer booking history "Book it again" surfaces cancelled & duplicate items
- **Where:** Home → *Book it again* carousel.
- **What I saw:** Four cards, all the same package, scheduled on past and future dates. There's no filter for "completed/cancelled" vs "upcoming", and the list shows the same booking title four times with no provider differentiation.
- **Fix:** Only show *completed* bookings; deduplicate by `(serviceId, providerId)` so customers see distinct services to rebook, not a history dump.

---

## P1 — High-impact UX issues

### 6. Auth-gate buttons are disabled with no inline reason
- **Where:** `AuthScreens.tsx:346-392`, `01-authGate-initial.png`.
- **What I saw:** Both `Sign up to ServEase` and `Log In` are rendered visibly disabled until the legal checkbox below is ticked. There is no helper text near the buttons explaining why, and tapping a disabled button is a complete silent no-op.
- **Fix:** Either (a) move the legal checkbox above the buttons, or (b) on disabled tap, briefly highlight/scroll-to the checkbox with a short message like "Please agree to the Terms to continue." First-time users miss the relationship today.

### 7. Booking timeline uses raw enum names
- **Where:** Customer booking detail (`Booking Timeline`), e.g. `Booking status changed to in_progress`, `Booking status changed to confirmed`.
- **What I saw:** The timeline events are surfaced as `Booking status changed to <snake_case>` literals.
- **Fix:** Map the status to a human label: "Provider confirmed booking", "Service in progress", "Service completed". Status badge already humanizes — apply the same to the timeline.

### 8. Customer bookings tab name "In Progress" includes pending / confirmed
- **Where:** Customer `Bookings` tab. Tab labels are `In Progress` and `Completed`. Cards under In Progress include statuses `pending`, `confirmed`, and `in progress`.
- **What I saw:** A `pending` booking sits inside the "In Progress" tab, which contradicts its label. Provider side gets 4 tabs (Upcoming / In Progress / Completed / Cancelled) — customer gets only 2 and conflates upcoming with active.
- **Fix:** Rename to `Active` (or split into `Upcoming` and `In Progress`). Surface `Cancelled` as its own filter, or roll into Completed with a tone differentiation.

### 9. Booking-detail "Reserve payment" CTA shows even when payment is already captured / booking completed
- **Where:** Customer booking detail for `completed` bookings still renders `Reserve payment` plus a `Submit review` form with an already-submitted review prefilled ("5/5 rating | galing!").
- **What I saw:** On a *completed* booking that already has a review on file, the UI offers "Submit review" again and "Reserve payment" again. No state about *what was already paid* is visible.
- **Fix:** Hide `Reserve payment` for `completed`/`paid` bookings (or replace with "View receipt"). For the review section: collapse to a read-only "Your review · 5★" with an edit affordance.

### 10. Booking form date strip is a fixed 7-day row that gets clipped
- **Where:** `cust-booking-form-full.png` — only `TODAY 18 / TOMORROW 19 / WED 20 / THU 21` are visible on a 390pt viewport; FRI/SAT/SUN exist in the DOM but sit off-screen with no visible swipe affordance.
- **What I saw:** No chevron, no edge fade, no "swipe for more" cue. Users will believe the next 3 days don't exist.
- **Fix:** Make the date strip horizontally scrollable with edge fade or a right chevron. Better: switch to a calendar sheet that supports >7 days (provider availability already extends further).

### 11. Cancel-Booking copy and tone
- **Where:** `cust-cancel-booking`.
- **What I saw:**
  - Heading is `I'M SORRY` in all caps — feels dramatic and AI-generated.
  - Cancellation policy footer says "Backend cancellation fees are not enabled yet." which leaks implementation language to the customer.
  - Submit `Cancel Booking` button is disabled until a reason is picked, but no inline microcopy explains that.
- **Fix:** Replace headline with `Cancel this booking?`; replace the policy line with user-facing terms only; add helper text "Select a reason to continue".

### 12. Provider "More" uses placeholder letter icons in tiles and Quick Actions
- **Where:** `provider-tab-more.png` and provider Home Quick Actions.
- **What I saw:** Every tile/quick action shows a single capital letter ("P", "P", "P", "R", "I", "N", "H", "S") instead of an icon. `lucide-react-native` is already a dependency.
- **Fix:** Swap to real Lucide icons (`User`, `Image`, `Wallet`, `BarChart3`, `Bell`, `LifeBuoy`, `Calendar`). Same fix needed for customer category list icons if any are letter-based (saw Lucide sparkles for Home Cleaning, but `Home Repairs` and `Repairs` both share a wrench — fine, just confirm intentional).

### 13. Provider Home KPIs contradict each other
- **Where:** `provider-00-home.png`.
- **What I saw:** Top KPI cards read `Total Earnings PHP 0`, then below `Today | Earned Today PHP 0 | Accept Rate 100%`, then the *More* tab and *Insights* both show `Total Earnings PHP 0` — but the same screen also exposes `Payments | PHP 1,275 pending`. So the provider sees "0 earnings" while a pending payout sits on the same page.
- **Fix:** Either count pending payouts toward "Total Earnings" or rename the KPI to "Paid Out". The current label is misleading.

### 14. Provider More tab is a 6-section dumping ground
- **Where:** `provider-tab-more` text dump (single screen contains: Payout summary → 8 navigation tiles → Payments list → My Services with inline Edit/Pause/Remove → Profile editor with form inputs → 2FA setup → Support form with ticket list → Sign out / Delete Account).
- **What I saw:** A user looking for "Settings" gets a four-screen scroll with two different forms and a destructive `Delete Account` red button at the very bottom.
- **Fix:** Reduce *More* to navigation tiles only. Move profile-editor and 2FA into dedicated screens (`providerEditProfile`, `providerSecurity`). Move *My Services* to its own *Services* screen (or under Home). Move *Delete Account* into Settings.

### 15. Customer cancel reason chips lack selected state feedback in audit screen
- **Where:** `cust-cancel-booking`.
- **What I saw:** Six chips (Found another service, Changed my mind, etc.). The submit button stays disabled, suggesting no chip was selected after tapping — and there's no visible "selected" state to confirm a tap registered. Worth manually re-testing on device; if a chip *was* selected and Cancel still doesn't enable, that's a P0.

### 16. Messages thread participants are labeled by role, not name
- **Where:** Messages thread rendering, `App.tsx` around 4560-4600.
- **What I saw:** Every bubble headers as `customer · May 16, 2:11 PM` or `provider · May 18, 12:35 AM`. No name, no avatar. Both sides see only the role.
- **Fix:** Use the counterparty's name (`booking.customerFullName` or provider's `businessName`) and "You" for the active user.

### 17. Help Center filter chips drop the ampersand
- **Where:** `customer-more-help`.
- **What I saw:** Article labels in the body are "Payments & Refunds" and "Safety & Trust", but the filter chips above say `Payments Refunds` and `Safety Trust` (no `&`). Looks broken.
- **Fix:** Use the same category strings; the `&` is being stripped somewhere (likely a chip-label sanitizer or a translation key).

### 18. Provider notifications surface internal test artifacts
- **Where:** `provider-more-notifications`.
- **What I saw:** `Test Broadcast | hi`, `Provider live integration test`, `Booking SE-07D7E0537A completed during smoke verification.` are visible in the seeded provider's real inbox. Demo accounts double as a stage — fine for engineering, not for a stakeholder demo.
- **Fix:** Either reseed clean demo data or filter test broadcasts/tickets by a `meta.testOnly` flag client-side.

### 19. Empty-thread state reads "No messages loaded." (technical, not friendly)
- **Where:** Messages screen, before a conversation is selected.
- **Fix:** "Pick a conversation to start chatting." (and on a real empty thread: "Say hi 👋").

### 20. Provider "0 New Booking Requests · Tap to review and accept" remains a green CTA when zero
- **Where:** Provider Home banner.
- **What I saw:** The big primary-colored CTA banner persists with the chevron even when there are zero new requests. Implies an action is available when there isn't one.
- **Fix:** When `count === 0`, swap to a soft "You're all caught up" muted card with no chevron — or hide the banner entirely.

---

## P2 — Polish / Consistency / Accessibility

### 21. Top-bar back button has no `aria-label`
- **Every screen with a `TopBar`:** the back chevron is an icon-only `Pressable` with no accessibility label (probe consistently flagged it as `{"t":"","w":44,"h":44}`). Add `accessibilityLabel="Back"` to the back button in `DesignKit.TopBar`.

### 22. Top-right notification bell button has no label and `42×42` tap target
- **Customer/provider Home headers.** Just under the 44pt iOS HIG minimum (44×44). Add `accessibilityLabel="Notifications"` and bump to 44.

### 23. Auth-gate copy: "Sign up to ServEase" / "Log In"
- "Sign up to" is unusual phrasing — "Sign up for ServEase" or just "Sign up" is more natural.
- Login screen header is `Login` (one word), button is `Login` — but the auth-gate button is `Log In` (two words). Pick one and be consistent (`Log in` is the conventional title-cased form).

### 24. Booking form: callout fee, total, and primary button overlap visual hierarchy
- The footer `Estimated total / Service rate PHP 1,500 / Callout fee PHP 0 / You'll review on the next step / PHP 1,500 / You won't be charged…` is heavy text wall before the CTA. Consider a fixed bottom bar with the total + CTA; collapse the breakdown into an expandable.

### 25. "Verify address" is a small `108×23` text link
- Below iOS minimum tap target. Either restyle as a chip (≥36 high) or move it inline next to the address.

### 26. Login screen merges email/password, Google sign-in, *and* phone OTP onto one screen
- Three different auth methods stacked on one screen creates choice overload. Tabs ("Email" / "Google" / "Phone") or a "Try another method" expander would reduce it.

### 27. Many list items are entire-card pressables containing nested text — RN Web flags `role=button` with 80+ character text labels
- Examples: `Customer Casey Demo Customer Service Deep Home Cleaning Package Amount PHP 1,500` becomes the button's accessible label. Screen readers read the whole card as one button. Use `accessibilityLabel` to provide a concise label.

### 28. Console deprecation warning: `shadow*` style props deprecated, use `boxShadow`
- Repeats on every screen. RN-Web 0.21 → migrate to `boxShadow` in styles to stop the noise and prepare for future RN releases. Search styles for `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`.

### 29. Settings screen mixes "Save Password" form, 2FA setup, language toggle, dark-mode toggle, active sessions, and **Delete Account** on one screen
- Similar problem to More: too many forms. Group with section dividers (Account / Security / Preferences / Danger Zone) and put `Delete Account` behind a confirmation that requires typing the email.

### 30. Customer profile screen lacks an avatar editor and email is non-editable but not visibly disabled
- The email field shows the value as plain text in a tinted block (looks like an input), but tapping does nothing. Either render it as a labeled field with a lock icon or move to a "Read-only details" section.

### 31. Provider Save Profile button (300pt) is narrower than other primary buttons (342pt)
- Inconsistency — align all primary buttons to the same width inside cards vs full-bleed screens.

### 32. Booking form "Reference photo (optional)" tile is 145pt tall but it's a single tap target containing the upload button
- The whole area is one button with text "Attach a photo" inside. Standardize to a dedicated upload affordance with a distinct icon.

### 33. Date-picker dates show day-of-week for some entries (`WED 20 MAY`) and word labels for others (`TODAY 18 MAY`, `TOMORROW 19 MAY`)
- The mix is fine for the first two, but consider also marking the rest (e.g., `WED · 20 MAY`) for consistent line breaks.

### 34. Some images render without `alt` text on RN-Web
- The probe didn't find image alts on the auth-gate marketing imagery. Provide empty `alt=""` for purely decorative graphics or descriptive alts otherwise.

### 35. Provider Calendar "Edit window" — day chips have no selected state visible
- Mon/Tue/Wed/Thu/Fri/Sat/Sun are all rendered identically; tapping doesn't visibly toggle. Confirm tap state and add a selected outline.

### 36. Cancellation policy footer copy includes "Backend cancellation fees are not enabled yet."
- See #11. Repeating because it leaks engineering vocabulary to end-users; never ship this string.

---

## What I verified worked well

- Demo seed works end-to-end (`smoke:demo-api` passes).
- Bookings detail screen on a confirmed booking renders the correct progress dots (`Booked / On the way / Started / Completed`) and exposes Track / Manage / Message / Reserve payment buttons.
- Provider Bookings tab has clean status filters (4 tabs) and an inline search.
- Provider Insights screen reads well (Acceptance/Completion/Repeat customers).
- Provider Calendar layout (Upcoming jobs, Weekly availability, Days off) is well-structured even if interactivity needs polish.
- Customer search input on Explore is prominent and the search-as-you-type returns results.

---

## Recommended fix order

**Sprint 1 (must-fix for credible demo):**
- #1 Booking-card "Assigned provider" placeholder (add `providerBusinessName` end-to-end).
- #2 Messages list service+counterparty labeling.
- #3 Notice toast cleanup across navigation.
- #4 Provider Home card tap navigation.
- #18 Reseed/clean demo notifications.
- #11 + #36 Cancel-Booking copy ("I'M SORRY", backend-language leak).
- #21–#22 Add `accessibilityLabel` to TopBar back + notifications bell.

**Sprint 2 (trust & clarity):**
- #6 Auth-gate disabled-button feedback.
- #7 Humanize booking timeline labels.
- #8 Customer Bookings tab naming/status grouping.
- #9 Hide already-actioned CTAs on completed bookings.
- #10 Date-strip horizontal scroll affordance.
- #12 Replace letter placeholders with Lucide icons.
- #13 Provider KPI naming consistency.
- #16 Use real names in message thread bubbles.

**Sprint 3 (architecture):**
- #14, #29 Break up the *More*/*Settings* dumping grounds.
- #26 Split login methods.
- #28 Migrate `shadow*` → `boxShadow`.

---

## Artifacts

Screenshots captured under `/tmp/mobile-audit/shots/` (auth gate, login flows, customer Explore/Bookings/Messages/More + Profile/Settings/Notifications/Help/Terms/Booking-form/Booking-detail/Cancel; provider Home/Bookings/Calendar/Messages/More + Profile/Portfolio/Payouts/Insights/Notifications/Help). Probe scripts: `/tmp/mobile-audit/probe2.mjs` (auth), `probe3.mjs` (tabs), `probe4.mjs` (deep customer), `probe5.mjs` (lifecycle).
