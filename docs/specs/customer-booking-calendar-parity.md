# Customer Booking — Calendar View Parity

> **Audience:** Codex agent executing the follow-up.
> **Repo root:** `/Users/mac/ServEase`
> **Parent briefs:**
> - `docs/specs/provider-availability-time-blocking.md`
> - `docs/specs/provider-availability-time-blocking-customer-fix.md`

## Problem

The provider persona now picks dates from a full month calendar view in `mobile/src/screens/ProviderCalendarScreen.tsx`. The customer persona, when booking a provider, does **not** have the same calendar UI — it currently uses a different (list/dropdown/scroller) date picker. This is a visual and UX inconsistency. The customer should also see a month calendar when choosing a booking date.

## Goal

Bring the customer booking date picker to visual and behavioral parity with the provider calendar:

- Same month-grid layout, same day-cell styling, same swipe-month navigation.
- Same dot/marker language so unavailable days are visually obvious before the customer taps.
- Same theme tokens (colors, spacing, typography) — no one-off styling.

## Hard rules

1. **Reuse, don't copy.** Extract the shared calendar into a single component under `mobile/src/components/` so the provider and customer screens both render the same calendar. Don't fork two near-identical implementations.
2. **Keep persona-specific logic outside the shared component.** The shared component takes props for `disabledDates`, `markers`, `minDate`, `onSelectDate`, etc. The persona screen decides what to disable and what dots to render.
3. **Customer rules differ from provider:**
   - Customer `minDate` is `today` (not `today + 2`). They can book same-day if the provider is available.
   - Customer disables: dates in `daysOff`, dates with no matching weekly `windows` entry, dates fully covered by `timeOffWindows`.
   - Customer markers (suggested): no dot for available, grey/disabled cell for fully unavailable, small dot for partial availability (some slots blocked).
4. **Additive only.** Do not rename or remove existing fields, props, or exports.
5. **TDD.** Snapshot or render-tests for the shared component plus customer screen integration tests.
6. **Scope:** `mobile/` only. Do not edit `backend/`, `servease-web/`, `admin/`, or `packages/`.

## Step 1 — Locate

Run:

```
grep -rn "bookingTimeSlots\|scheduledAt\|getPublicProviderAvailability" mobile/src
```

List the customer booking screen files involved in the date+time selection step. Include this list in your report.

Also open `mobile/src/screens/ProviderCalendarScreen.tsx` and note which pieces are pure calendar UI (grid, day cell, month nav, marker rendering) vs. provider-specific logic (red/yellow/blue dots, navigation target, 2-day rule).

## Step 2 — Extract shared component

Create `mobile/src/components/MonthCalendar.tsx` (or whatever fits the existing naming convention — check sibling components first). Move the pure-UI parts of `ProviderCalendarScreen.tsx` into it.

Props (suggested — adjust to repo conventions):

```ts
interface MonthCalendarProps {
  selectedDate: string | null;            // 'YYYY-MM-DD'
  onSelectDate: (date: string) => void;
  minDate?: string;                       // disable dates before this
  maxDate?: string;
  disabledDates?: Set<string>;            // greyed out, not tappable
  markers?: Record<string, MarkerKind>;   // 'full' | 'partial' | 'booking' etc.
  initialMonth?: string;                  // 'YYYY-MM'
}
```

Use the same theme tokens (`mobile/src/theme/`) the provider screen uses. No hard-coded colors.

Update `ProviderCalendarScreen.tsx` to consume the shared component. Behavior must be identical to before — verify with the existing provider tests.

## Step 3 — Wire customer screen

In the customer booking screen identified in Step 1:

- Replace the existing date picker UI with `<MonthCalendar />`.
- Compute `disabledDates` and `markers` from the result of `getPublicProviderAvailability(providerId)`:
  - Disable date if it's in `daysOff` or has no weekly `windows` entry covering any `bookingTimeSlots`.
  - Marker `'partial'` if the date has any entries in `timeOffWindows` but at least one slot remains.
  - No marker otherwise.
- `minDate` = today (Asia/Manila).
- Keep the existing time-slot picker (filtering logic from the customer-fix PR stays as-is) — only the date step changes.

## Step 4 — Visual parity check

The customer's calendar must look like the provider's. Same:

- Cell size, padding, border radius
- Weekday header row style
- Month/year header + nav arrow style
- Selected-day highlight
- Disabled-day style
- Marker dot size and color (where applicable)

If your repo has Storybook or a similar component playground, add a story per persona. If not, take screenshots of both calendars side by side and include them in the report.

## Step 5 — Tests

- Component test for `MonthCalendar`: renders the right number of cells, marks disabled dates as un-tappable, fires `onSelectDate` for a valid tap, respects `minDate`/`maxDate`.
- Customer screen integration test: with a mocked availability payload containing a full day off and a partial-block date, assert the customer cannot tap the full-day-off date and the partial-block date renders the partial marker.
- Re-run the provider screen tests — must still pass without changes to their assertions.

## Verification

1. `npm test` in `mobile/` passes.
2. `npm run lint:check` passes.
3. Manual side-by-side:
   - Open the app as a provider → Calendar tab. Note the calendar layout.
   - Open the app as a customer → start a booking with a provider that has at least one full-day off and one partial time-off. The date picker must visually match the provider calendar.
   - Tap a partial-block date → time-slot step still hides the blocked slots (logic from the customer-fix PR).

## Deliverables

1. List of files added or changed.
2. Path to the new shared component.
3. Screenshots (or written confirmation) of the customer + provider calendars side by side.
4. Test results.
5. Anything in the provider calendar that could **not** be cleanly shared and had to stay duplicated — explain why.
