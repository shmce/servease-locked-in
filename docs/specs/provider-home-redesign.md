# Provider Home Redesign — Action-First Dashboard

> **Audience:** Codex agent executing the redesign.
> **Repo root:** `/Users/mac/ServEase`
> **Related specs:**
> - `docs/specs/provider-availability-time-blocking.md`
> - `docs/specs/customer-booking-calendar-parity.md`

## Problem

Provider feedback:

- Information is cluttered ("kalat").
- Theme and colors feel ugly ("pangit") — driven by inconsistent use of 5 accent colors across an inline 10k-line file, not by the brand color itself.
- Homepage is too busy and the navigation flow is unclear.
- Necessary functionalities (specifically **Request Payout**) are buried 3 taps deep.
- Main functionalities should be visible on the homepage.

Current state: the provider home is rendered inline inside `mobile/App.tsx` at lines 6096–6226 (`renderProviderHome()`). The whole file is 10,407 lines. This is half of why the screen is hard to evolve and why styling drifts.

## Goal

Replace the provider homepage with an **action-first dashboard**:

- The hero shows what the provider should *do right now*, not just stats.
- Three high-value actions are one tap away from the homepage: Request Payout, Set/Block Availability, Start/Navigate next job.
- The theme is tightened to one primary (mint) + one alert color + neutrals — same brand, much calmer.
- The home is extracted out of `App.tsx` into its own screen file matching the pattern of `ProviderCalendarScreen.tsx`.

## Hard rules

1. **Extract before redesign.** First move `renderProviderHome()` out of `App.tsx` into `mobile/src/screens/ProviderHomeScreen.tsx`, wired via props. Tests pass before any visual change. This is non-negotiable — do not redesign in place.
2. **Customer home stays untouched.** Do not edit customer screens, the customer tab bar, or any customer flow.
3. **No new dependencies** without checking `mobile/package.json`. Reuse the theme tokens in `mobile/src/theme/serveaseDesign.ts` (extend, don't replace).
4. **Additive payload changes only** if any new backend field is needed. This task should ideally need zero backend changes — flag it if you find otherwise.
5. **TDD.** Render-test the new screen for each state (no jobs, one upcoming job, pending requests, payout available, payout disabled).
6. **Scope:** `mobile/` only. Do not edit `backend/`, `FE_Web(Provider)/`, `admin/`, `Landing Page/`, `packages/`. If you discover a shared type that must change, **stop and report** — do not edit out-of-scope folders.

## Step 1 — Extract

Create `mobile/src/screens/ProviderHomeScreen.tsx` and move the body of `renderProviderHome()` (`App.tsx:6096–6226`) into it. Follow the prop pattern used by `ProviderBookingsScreen.tsx` (`App.tsx:6228–6240`): the screen takes the data and callbacks it needs as props; the parent `App.tsx` still owns state.

After extraction, `App.tsx`'s `renderProviderHome()` becomes a thin wrapper that constructs props and renders `<ProviderHomeScreen ... />`. Run the existing test suite — it must pass with **zero behavioral changes** before moving to Step 2.

Commit this as its own commit titled `refactor: extract ProviderHomeScreen from App.tsx`.

## Step 2 — Theme tightening

Edit `mobile/src/theme/serveaseDesign.ts`:

- Keep `palette.mint`, `palette.mintDark`, `palette.mintDeep`, `palette.mintSoft`.
- Keep neutrals: `ink`, `body`, `muted`, `faint`, `line`, `lineSoft`, `input`, `white`, `surface`, `cream`.
- **Demote** `coral`, `blue`, `violet`, `amber` — add a comment `// Legacy. Do not use in new code. Use palette.alert or palette.mint.` Do not delete them yet (other screens still reference them).
- Add `palette.alert = '#EF4444'` (alias of existing `red`, kept for semantic clarity) and update existing `red` references in the new home screen to use `palette.alert`.

Add a `homeTokens` export grouping the spacing and radius values the new home uses, so the home screen never hardcodes a number:

```ts
export const homeTokens = {
  heroPadding: spacing.lg,
  cardGap: spacing.md,
  sectionGap: spacing.xl,
  pillGap: spacing.sm,
};
```

Do not touch other screens' usage of the legacy accent colors in this PR.

## Step 3 — New homepage layout

In the new `ProviderHomeScreen.tsx`, replace the body with the layout below, top to bottom:

### 3a. Top bar (compact)

- Left: "Hi, {businessName or fullName}" — single line, small caps muted label "Today, {weekday}".
- Right: bell icon with unread dot. No giant hero panel.

Height target: ~64px. Do not use the current oversized hero.

### 3b. Action hero — the one thing they should do next

A single large card. Content depends on state, evaluated in this order:

1. **If there is a confirmed booking scheduled today**, show that one as the hero:
   - Time chip ("2:00 PM"), service title, customer first name, address single-line truncated.
   - **Smart primary button** (right side, large, mint):
     - If `now < scheduledAt - 30 minutes`: button label is **"Navigate"**, opens directions (existing `providerNavigationMode` flow).
     - If `now >= scheduledAt - 30 minutes` AND `booking.status === 'confirmed'`: button label is **"Start Service"**, opens existing `providerStartService` flow.
     - If `booking.status === 'in_progress'`: button label is **"Continue"**, opens `providerServiceInProgress`.
   - The button state is computed from a small pure function `nextJobAction(booking, now)` — unit test it directly with cases for each branch including the exact ±30min boundary.

2. **Else if there are pending booking requests**, show "X new requests" as the hero with a single "Review requests" button → existing `providerBookings` tab.

3. **Else** (no job today, no pending), show "All caught up." with two equal pill buttons: "Block time off" → calendar, "Share profile" → existing share/profile flow.

The hero is always rendered. There is no scenario where the hero collapses to nothing.

### 3c. Quick action row (3 pills, horizontal)

Equal-width buttons immediately under the hero, in this order, left to right:

1. **Request Payout** → directly opens the existing `providerRequestPayout` route (skip the `providerPayoutManagement` intermediate page). Show the available balance as a small label under the pill so the provider doesn't have to tap to know. If balance is below the minimum payout threshold, the pill is greyed out with a tooltip "Available: ₱X · minimum ₱Y to request." (Use whatever threshold the backend already enforces — if there's a config, read it; if not, derive from a 422 dry-call. Do **not** invent a new threshold.)
2. **Block Time** → opens `providerCalendar` (the calendar screen you already shipped).
3. **Messages** → opens `providerMessages` tab, with unread count badge if any.

These three replace the current "Quick Actions" 2x2 grid. Drop "Insights" and "Portfolio" from the homepage — they move to the More tab (already there as `providerInsights` and `providerPortfolio`).

### 3d. Earnings strip (compact)

One row, three numbers, no card chrome:

- Today (₱)
- This week (₱)
- All-time rating with star

Tap anywhere on the strip → opens `providerEarnings`. Do not show acceptance rate here — move it to `providerEarnings`. Do not show the 3-up MetricCard grid that's currently at the top.

### 3e. Active bookings (next 3)

Section header "Active". Show up to 3 upcoming non-pending bookings as compact rows (one line each: time · service · customer). Tap → existing booking detail.

If the hero is already showing the soonest job (state 1 in section 3b), exclude it from this list to avoid duplication.

"View all" link → bookings tab.

### 3f. Application status banner (only if needed)

Keep the existing `renderProviderApplicationBanner()` logic, but render it at the bottom of the scroll, not the top. Reason: once approved it disappears; pre-approval providers see it but the rest of the home is still useful.

### 3g. Remove from homepage

Explicitly remove these from the home (they exist elsewhere already):

- The big "Available Payout" featured MetricCard (replaced by the Request Payout pill).
- The 3-up MetricCard grid at the top (New Requests / Today / Rating).
- The "Today" conditional MetricCard section.
- "My Services" section (lives on the More tab).
- The 2x2 Quick Actions grid.

## Step 4 — Visual rules (theme discipline)

Codify and follow these in the new screen so it doesn't drift:

- **Backgrounds:** `palette.surface` for the screen, `palette.white` for cards.
- **Primary text:** `palette.ink`. Secondary: `palette.body`. Muted: `palette.muted`.
- **Borders:** `palette.line` only. No shadow stacks deeper than a single 8% opacity drop.
- **Primary actions:** `palette.mint` background, `palette.white` text.
- **Destructive / blocked states:** `palette.alert`. Nothing else.
- **No coral, blue, violet, or amber anywhere in this screen.**
- **Spacing:** only `homeTokens.*` and `spacing.*` values. No hardcoded `padding: 11` etc.
- **Radius:** only `radius.*`. No hardcoded values.
- **Type:** only `type.*` from the theme. No inline `fontSize`.

Add a lint comment at the top of the screen file:

```tsx
// Theme discipline: only palette.mint*, palette.alert, and palette.{ink,body,muted,faint,line,lineSoft,input,white,surface,cream} are allowed.
// Spacing/radius/type must use the exported theme tokens.
```

## Step 5 — Tests

Add `mobile/src/screens/ProviderHomeScreen.test.tsx`:

- Hero state matrix: today's confirmed job before T-30 → button reads "Navigate". After T-30 → "Start Service". In-progress → "Continue". No job today but pending requests → "Review requests". Nothing → "All caught up" with both pills.
- Unit-test `nextJobAction(booking, now)` directly with the exact boundary (29 min before, 30 min before, 31 min before).
- Request Payout pill: enabled when balance ≥ minimum, disabled and labeled with the threshold otherwise.
- Snapshot the empty state and the one-job state to catch silent visual drift.

Reuse the existing test setup (Vitest/Jest — match what `AuthScreens.test.ts` uses, do not introduce a new runner).

## Step 6 — Verification

1. `npm test` in `mobile/` passes.
2. `npm run lint:check` passes.
3. Visual manual check on a real provider account:
   - With a job scheduled in 2 hours → hero shows Navigate.
   - Advance device clock to 20 min before scheduled time → hero flips to Start Service.
   - Tap Request Payout → lands on the Request Payout screen directly, no intermediate Payout Management.
   - Tap Block Time → opens the calendar.
   - With no job and no pending requests → hero shows "All caught up" with both action pills.
4. Diff the screen header-to-footer against the spec list in Step 3g and confirm every removal is gone.

## Deliverables

1. List of files added or changed.
2. Confirmation that **Step 1 (extract) shipped as a separate commit** before any visual change.
3. Screenshot of the new homepage in each of the three hero states (today's job, pending requests, all caught up).
4. List of any legacy accent-color usages (`coral`/`blue`/`violet`/`amber`) you found in the homepage code while extracting — these are now removed from the home, but log where they still appear elsewhere in `mobile/` so I know what to clean up next.
5. Test results.
6. The path to the new screen file and confirmation that `App.tsx` is now thinner by ~130 lines.
