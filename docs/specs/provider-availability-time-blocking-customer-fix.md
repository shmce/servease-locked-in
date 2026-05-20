# Provider Time Blocking — Customer-Side Fix (Follow-up PR)

> **Audience:** Codex agent executing the follow-up.
> **Repo root:** `/Users/mac/ServEase`
> **Parent brief:** `docs/specs/provider-availability-time-blocking.md`
> **Related migrations from PR 1:**
> - `backend/database/20260520_add_provider_time_off_windows.sql`
> - `backend/database/20260520_fix_provider_time_off_booking_rpc.sql`

## Problem

PR 1 shipped provider-side time blocking and the gateway smoke test confirmed the booking RPC raises `provider_unavailable` for blocked times. **But in the real mobile customer flow, a customer can still book a date/time that the provider has blocked.** Either:

- **Type A (server):** A customer booking request is succeeding when it should raise `provider_unavailable`. This means there is still another `servease_create_booking` overload, or a different RPC, or a service layer that bypasses the updated guard.
- **Type B (client):** The customer's booking screen still shows blocked slots as selectable / does not filter against `timeOffWindows` and `daysOff`, so the customer reaches an error state too late, or the screen "looks" booked when the server rejects.

Both must be fixed. Scope of this PR is expanded to include the customer booking flow in `mobile/` and the shared SDK in `packages/servease-sdk/*` (PR 1 explicitly punted on the SDK).

## Hard rules

1. **Diagnose Type A first.** Reproduce a real end-to-end customer booking against a blocked window. If it succeeds, that is a server bug — fix it before touching the client.
2. **Then fix Type B.** The customer must never see a blocked slot as selectable. The server guard stays as a defense-in-depth backstop, not the primary UX gate.
3. **Additive payload changes only.** Do not rename or remove existing fields anywhere.
4. **TDD.** Reproduce each bug with a failing test first, then fix.
5. **Scope:** `backend/` (only if a server bug is confirmed), `mobile/`, `packages/servease-sdk/*`, `docs/api-contracts.md`. Do **not** edit `FE_Web(Provider)/`, `admin/`, or `Landing Page/`.

## Step 1 — Reproduce and classify the bug

Run this exact scenario against a real (non-test) Supabase environment:

1. Seed or pick a provider with weekly windows that include a slot at 15:00 on a date `D` that is 3+ days from today.
2. As that provider, hit `POST /v1/provider/availability/time-off` with `{ offDate: D, startTime: '14:00', endTime: '17:00' }`.
3. As a customer, go through the **actual mobile customer booking flow** (not curl — the real screens) and try to book that provider for `D` at 15:00.
4. Record exactly what happens:
   - Was the slot selectable in the UI? (yes/no)
   - When Confirm was tapped, what HTTP request was sent, to what endpoint, with what payload?
   - What was the HTTP response status and body?
   - Did a row appear in `booking.bookings` for that time?

Write this up at the top of your final report as **"Reproduction trace"**. This is required.

## Step 2 — If a row was created (Type A: server bug)

Audit every code path that creates a booking:

- `grep -rn "servease_create_booking" backend/` — list every overload and every caller. There may be more than the two found in PR 1.
- `grep -rn "create_booking\|createBooking\|create-booking" backend/` — find every NestJS service/controller that creates bookings.
- `grep -rn "POST.*booking\|/v1/bookings" backend/apps/api-gateway` — find every gateway route that creates bookings.
- For each path, verify it ends up at an RPC overload that includes the time-off window check from `20260520_fix_provider_time_off_booking_rpc.sql`.

If any overload still does not check `provider_time_off_windows`, add a new migration `backend/database/<today>_fix_remaining_create_booking_overloads.sql` that brings every overload into compliance. Mirror the existing fix migration's structure.

Add a DB contract test that, for **every** overload signature found, asserts a booking inside a `provider_time_off_windows` row raises `provider_unavailable`. Loop the test over the overloads so adding a new overload later forces an update.

## Step 3 — If the row was NOT created but UI looked confused (Type B: client bug)

This is the most likely outcome. Fix the customer booking screen:

### 3a. Identify the customer booking flow files

Run:

```
grep -rn "bookingTimeSlots\|scheduledAt\|scheduled_at\|servease_create_booking\|getPublicProviderAvailability" mobile/src
```

The customer date/time picker is somewhere in `mobile/src/screens/` or `mobile/src/components/`. List every file involved in choosing a date and time for a booking. Include this list in your final report.

### 3b. Fetch the right availability shape

The customer screen must call `getPublicProviderAvailability(providerId)` from `mobile/services/serveaseApi.ts` (it already returns `windows`, `daysOff`, and as of PR 1 also `timeOffWindows`). If the screen currently uses a different function or a stale SDK type, switch it.

### 3c. Filter the date picker

When rendering the date selector:

- Disable any date in the past or `< today + 0` (customer rule, separate from the provider 2-day rule).
- Disable any date listed in `daysOff` (whole-day off).
- Do **not** disable a date that only has partial `timeOffWindows` — those still have bookable hours; just filter at the time-slot step.
- Disable any date where no weekly `windows` entry covers any slot in `bookingTimeSlots`.

### 3d. Filter the time-slot picker

For the selected date, the available slots are `bookingTimeSlots` minus:

- Slots that fall outside the matching weekly `windows` entry for that weekday.
- Slots that overlap any entry in `timeOffWindows` for that `offDate`. A slot at `HH:00` overlaps the window `[startTime, endTime)` if `startTime ≤ HH:00 < endTime`.
- Slots that overlap an existing confirmed booking for that provider on that date (if the public endpoint exposes those — if not, leave this to the server backstop and just call it out in the report).

Show greyed-out slots with a tooltip/subtext "Provider unavailable" instead of hiding them entirely, so the customer sees the constraint.

### 3e. Server backstop UX

Even with perfect client filtering, the server can still reject (race condition, stale cache). When the booking POST returns `provider_unavailable` (409), show a friendly inline error on the slot picker: "This slot was just taken or blocked. Please pick another." Re-fetch availability automatically.

### 3f. Tests

- Unit test the slot-filter helper with cases for: empty timeOffWindows, full-day off, partial 14:00–17:00 block (assert 14:00/15:00/16:00 are filtered, 13:00 and 17:00 remain), overlapping weekly window edges.
- Screen test that asserts blocked slots render as disabled with the unavailable label.
- Mock the 409 response path and assert the re-fetch + error message.

## Step 4 — Shared SDK (`packages/servease-sdk/*`)

PR 1 left this out of scope. Pick it up now.

- Add `ProviderTimeOffWindow` to the SDK types.
- Extend `ProviderAvailabilitySchedule` with `timeOffWindows: ProviderTimeOffWindow[]` (additive — do not change existing fields).
- Add SDK methods `availability.addTimeOff` and `availability.removeTimeOff` mirroring `availability.addDayOff` / `availability.removeDayOff`.
- Add unit tests in the SDK matching its existing test style.
- Bump the SDK version per its existing release convention (check `packages/servease-sdk/package.json` and `CHANGELOG.md` if present).
- Note in your report which workspace consumers (`FE_Web(Provider)`, `admin`, `Landing Page`, `mobile`) now need to upgrade. Do not edit those consumers in this PR.

## Step 5 — Docs

Update `docs/api-contracts.md` only if Step 2 added new endpoints or response fields. If only client/SDK changed, no contract update is needed.

If you added a new migration in Step 2, append a short note to the bottom of `docs/specs/provider-availability-time-blocking.md` linking the follow-up migration and explaining the overload audit findings.

## Verification

1. Re-run the Step 1 reproduction. Booking must now be refused at the UI level (slot greyed out) **and** at the server (409) as defense-in-depth.
2. Backend: `npm test`, `npm run build`, `npm run lint:check`, `npm run check:migrations`, `npm run smoke:availability` all pass.
3. Mobile: `npm test` passes including the new filter tests.
4. SDK: package tests pass; `npm run build` of the package succeeds.
5. Re-confirm Type A and Type B both with manual end-to-end runs:
   - Full-day off → date disabled in customer picker.
   - Partial block 14:00–17:00 → date selectable, but 14/15/16 slots disabled.
   - Race: block created **after** customer loads the picker → confirm shows the inline 409 error and re-fetches.

## Deliverables

1. **Reproduction trace** (from Step 1) at the top of your report.
2. **Bug classification:** Type A, Type B, or both.
3. List of every file changed or added.
4. Any new migration filename and the audit table of `servease_create_booking` overloads (signature → does it check time-off windows?).
5. SDK version bump + list of downstream consumers that should upgrade in follow-up PRs.
6. Test results.
