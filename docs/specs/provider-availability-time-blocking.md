# Provider Availability Time Blocking — Codex Implementation Brief

> **Audience:** Codex agent executing the implementation.
> **Repo root:** `/Users/mac/ServEase`
> **Related spec:** `docs/specs/provider-availability.md`
> **Related contract doc:** `docs/api-contracts.md`

You are working in the ServEase monorepo. Repo layout: `backend/` (NestJS microservices), `mobile/` (React Native/Expo), `FE_Web(Provider)/` (web provider portal), `admin/`, `Landing Page/`, `docs/`, `packages/`.

## Goal

Let a provider block their availability from the mobile app so customers cannot book those times. Two block types:

- (a) Whole day off
- (b) Specific time range on a specific date (e.g. block 2pm–5pm on May 24 only)

Surface this as a calendar inside the mobile app. The flow: open Calendar tab → tap a date → choose "Block whole day" or "Block specific time" → save. Customers booking that provider must then be blocked from picking that date/time.

## Hard rules

1. **Provider must block at least 2 calendar days in advance** (Asia/Manila timezone). They cannot block today or tomorrow. Enforce on both client and server.
2. **A block must be rejected if it conflicts with an existing active booking** on that date/range. Surface a readable error so the provider knows to cancel/reschedule the booking first.
3. **All payload changes must be additive** so `FE_Web(Provider)/`, `admin/`, and `Landing Page/` (which also consume `ProviderAvailabilitySchedule`) keep working without changes in this PR.
4. **Scope of this PR:** `backend/`, `mobile/`, `docs/api-contracts.md` only. Do not edit `FE_Web(Provider)/`, `admin/`, or `Landing Page/`. If any of those would fail to compile because of TS strict mode against a shared type in `packages/`, **stop and report it** — list every file that would need a follow-up — do not edit them.
5. **TDD.** Write failing tests first, then implement.

## What already exists (use, don't duplicate)

- DB tables `booking.provider_availability_windows` (weekly recurring) and `booking.provider_days_off` (whole-date block).
- RPCs `servease_get_provider_availability`, `servease_replace_provider_availability_windows`, `servease_add_provider_day_off`, `servease_remove_provider_day_off` in `backend/database/20260515_add_provider_availability_management_rpc_functions.sql`.
- Booking guard `servease_create_booking` in `backend/database/20260515_add_booking_availability_guards.sql` already raises `provider_unavailable` for days-off and missing weekly windows.
- Mobile API client: `getProviderAvailability`, `replaceProviderAvailabilityWindows`, `addProviderDayOff`, `removeProviderDayOff` in `mobile/services/serveaseApi.ts:2014-2073`.
- Routes registered (no screen files yet): `providerCalendar` → `/provider/calendar` and `providerSetAvailability` → `/provider/set-availability` in `mobile/src/navigation/claireRouteManifest.ts:56-57`.
- API gateway availability module: `backend/apps/api-gateway/src/features/availability/availability.controller.ts` and `availability.types.ts`.
- Internal `availability-service` on port 8505 (see `docs/api-contracts.md:360`).
- Booking time-slot list `bookingTimeSlots` at `mobile/src/constants/appContent.ts:53-62` (1-hour slots). Reuse it.

## Backend work

### 1. New migration

Create `backend/database/<today>_add_provider_time_off_windows.sql`. Do **not** modify existing migrations.

- New table `booking.provider_time_off_windows`:
  - `id uuid pk default gen_random_uuid()`
  - `user_id uuid not null`
  - `off_date date not null`
  - `start_time time not null`
  - `end_time time not null`
  - `reason text`
  - `created_at timestamptz default now()`
  - Check constraint `start_time < end_time`
  - Index on `(user_id, off_date)`

- New RPCs (security definer, search_path = booking, public, revoke from public/anon/authenticated, grant execute to service_role — match the pattern of the existing migrations):
  - `servease_add_provider_time_off_window(p_provider_id uuid, p_off_date date, p_start_time text, p_end_time text, p_reason text default null)` — validates HH:MM format, rejects if `p_off_date < (current_date at time zone 'Asia/Manila') + interval '2 days'` with exception `time_off_too_soon`, rejects if any booking on that date+range overlaps with status in (`pending`, `confirmed`, `in_progress`) with exception `time_off_conflicts_booking`, rejects if `start >= end` with `invalid_availability_request`, inserts the row, returns the full availability payload (see step 3).
  - `servease_remove_provider_time_off_window(p_window_id uuid, p_provider_id uuid)` — deletes if owned by provider, returns the full payload.

- Extend `servease_add_provider_day_off` (replace it in this new migration with `create or replace function`): also raise `time_off_too_soon` if `p_off_date < today_in_manila + 2`, and `time_off_conflicts_booking` if any active booking exists on that date.

- Extend `servease_get_provider_availability` (also `create or replace` in this migration) so the returned payload includes a new field `timeOffWindows: [{ id, offDate, startTime 'HH:MM', endTime 'HH:MM', reason }]` ordered by `off_date, start_time`. Existing fields `windows` and `daysOff` stay exactly as they are.

- Update `servease_create_booking` (also `create or replace` in this migration): after the existing days-off check, also raise `provider_unavailable` if the requested time range overlaps any row in `provider_time_off_windows` for that provider on that local date.

- Add a smoke test at the bottom mirroring lines 169+ in `20260515_add_provider_availability_management_rpc_functions.sql`: seed a provider, create a time-off window, attempt a booking that overlaps → expect `provider_unavailable`. Then create a whole-day-off on a date with an existing booking → expect `time_off_conflicts_booking`. Then attempt a block for tomorrow → expect `time_off_too_soon`.

### 2. API gateway + availability-service

In `backend/apps/api-gateway/src/features/availability/`:

- Add `POST /v1/provider/availability/time-off` accepting `{ offDate: string; startTime: string; endTime: string; reason?: string | null }`, bearer auth, calls into the availability-service.
- Add `DELETE /v1/provider/availability/time-off/:id`, bearer auth.
- Update `availability.types.ts` to add `ProviderTimeOffWindow` and extend `ProviderAvailabilitySchedule.timeOffWindows`.
- Mirror exactly the validation/error-mapping style of the existing days-off endpoints. Map exceptions:
  - `time_off_too_soon` → 422 with code `time_off_too_soon`
  - `time_off_conflicts_booking` → 409 with code `time_off_conflicts_booking`
  - `invalid_availability_request` → 400

In the internal `availability-service`: add the matching internal route(s) at `/internal/providers/:providerId/availability/time-off` (POST + DELETE), wired to the new RPCs.

## Mobile work

### 1. API client — `mobile/services/serveaseApi.ts`

- Add `ProviderTimeOffWindow { id: string; offDate: string; startTime: string; endTime: string; reason: string | null }`.
- Extend `ProviderAvailabilitySchedule` with `timeOffWindows: ProviderTimeOffWindow[]`.
- Add two functions, mirroring `addProviderDayOff`/`removeProviderDayOff` at lines 2049-2073:
  - `addProviderTimeOffWindow(body: { offDate: string; startTime: string; endTime: string; reason?: string | null }, options?: ApiOptions)`
  - `removeProviderTimeOffWindow(id: string, options?: ApiOptions)`
- Update `mobile/services/serveaseApi.test.ts` to cover both new functions following the pattern at lines 1803-1812.

### 2. Two new screens under `mobile/src/screens/`

Follow the existing screen patterns (see `ProviderBookingsScreen.tsx` and `CustomerMoreScreen.tsx`). Use the existing theme in `mobile/src/theme/`. Use existing test patterns from `AuthScreens.test.ts` — **do not introduce a new test runner**.

**`ProviderCalendarScreen.tsx`** — month calendar view.

- Check `mobile/package.json` for an existing calendar dep (`react-native-calendars` if available). **Do not add a new dependency** without checking; if none present, build a minimal grid with View/Pressable.
- Mark each day:
  - Whole day off → red dot
  - Has partial time-off only → yellow dot
  - Has any active booking → blue dot
  - Otherwise no dot
- Tap a date → navigate to `ProviderSetAvailabilityScreen` with that date pre-selected.
- Load data on focus via `getProviderAvailability`.

**`ProviderSetAvailabilityScreen.tsx`** — date detail + block form.

- Header: selected date. Show a hint "You can only block dates at least 2 days from today." when current selection is `< today + 2` in Asia/Manila tz, and disable the submit button.
- Segmented toggle: "Block whole day" vs "Block specific time".
- Whole day → submit calls `addProviderDayOff`.
- Specific time → two pickers using the same 1-hour slots as `bookingTimeSlots` from `mobile/src/constants/appContent.ts:53`. End time must be `>` start time (disable invalid options). Optional reason text input. Submit calls `addProviderTimeOffWindow`.
- Below the form, list existing blocks for that date (whole-day-off + all time-off windows) with a delete (X) button on each that calls the right remove endpoint.
- Map API error codes to user-readable strings:
  - `time_off_too_soon` → "You can only block dates at least 2 days from today."
  - `time_off_conflicts_booking` → "You have a booking on this date or time. Cancel or reschedule it first."
  - `invalid_availability_request` → "Please check the date and time."
  - Anything else → generic "Couldn't save. Please try again."

### 3. Navigation + content

- Add the two screens to the navigator and route registry the same way other provider screens are wired. The route keys `providerCalendar` and `providerSetAvailability` already exist in `claireRouteManifest.ts` — wire the actual screens to them.
- The "Calendar" provider bottom tab in `mobile/src/navigation/types.ts:4` should land on `ProviderCalendarScreen`.
- Update the FAQ at `mobile/src/constants/appContent.ts:183-185` to mention partial time blocks.

### 4. Tests

- Unit tests for the two new screens (form validation, 2-day rule, error mapping, list rendering) using the existing test setup pattern.
- Unit tests for the two new API client functions.
- Keep coverage at or above the project's current baseline.

## Docs

Update `docs/api-contracts.md`:

- "Provider, Availability, and Pricing" section (around line 242): add rows for `POST /v1/provider/availability/time-off` and `DELETE /v1/provider/availability/time-off/:id`.
- SDK table around line 113: add `availability.addTimeOff` and `availability.removeTimeOff`.
- Update the `ProviderAvailabilitySchedule` type definition to include `timeOffWindows: ProviderTimeOffWindow[]` and define the new type.
- Update the internal `availability-service` route list at line 360 with the new internal endpoint.
- Document the new error codes `time_off_too_soon` and `time_off_conflicts_booking` next to the existing error code section near line 49.

## Non-goals

- Do not modify `admin/`, `FE_Web(Provider)/`, or `Landing Page/`.
- Do not add new dependencies without checking what's already in `mobile/package.json` and `backend/package.json`.
- Do not modify existing migrations — only add the new one.
- Do not change the customer booking UI; only the booking guard RPC.
- Do not rename or remove any existing field in `ProviderAvailabilitySchedule`.

## How to verify before reporting done

1. Backend: run the existing test suite + the new smoke test in the migration.
2. Mobile: `npm test` (or whatever the project uses — check `mobile/package.json`) passes; lint passes.
3. Manually walk the flow: open mobile app as a provider → Calendar tab → tap a date 3+ days out → block 2pm–5pm → switch to a customer account → try to book that provider for 3pm same day → see error.
4. Verify a date 1 day out is greyed out and the API also rejects it.
5. Verify blocking a date with an existing booking returns the "cancel or reschedule first" error.

## Deliverables in your final report

1. List of every file changed or added.
2. The new migration filename.
3. Short description (or screenshots if you can produce them) of the two new screens.
4. Test results (pass/fail counts).
5. **Any shared types in `packages/` that other frontends import** — flag them with file paths so I know what to queue for PR 2.
