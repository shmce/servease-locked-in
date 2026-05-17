# Booking detail fields wired — 2026-05-17

> Closes a cross-cutting integration gap discovered while re-auditing the
> mobile, FE_Web(Provider), and Landing Page surfaces. The DB stored
> `service_description`, `customer_notes`, `hours_required`, `pricing_mode`,
> and `service_amount`, but neither the booking RPCs nor any client type
> exposed them. The provider-web `BookingDetailsPage` and
> `BookingRequestDetailsPage` therefore fell back to mock-data placeholders
> for "description", "special instructions", and "estimated duration".

## Symptom

Both pages contained a `// Mock data - in real app, fetch based on id`
comment with a placeholder branch (`Maria Santos`, `1500/150/1350` peso
breakdown, `2 hours` duration). Even on the real branch with `apiBooking`
loaded, the same fields were hardcoded to `"-"` or `0` because the
`BookingSummary` type omitted them.

## Root cause

`servease_list_visible_bookings` and `servease_get_visible_booking` only
selected 10 columns from `booking.bookings`. The repository's `mapBooking`
and downstream types matched that subset, so the missing fields silently
disappeared at the data-layer boundary even though the rows existed in
Postgres.

## Fix

1. **Database** (`backend/database/20260517_extend_booking_visible_fields.sql`):
   recreated both RPCs to also return `service_description`,
   `customer_notes`, `hours_required`, `pricing_mode`, and `service_amount`.
2. **booking-service** (`booking-lifecycle/booking.types.ts`,
   `supabase-booking.repository.ts`): added the new fields to
   `BookingRow`/`BookingSummary` and mapped them in `mapBooking`. Updated
   the repository spec to assert the full shape.
3. **api-gateway** (`features/booking/booking.types.ts`): extended
   `BookingSummary` with the same fields plus a `BookingPricingMode`
   union. `enrichBooking` already spreads the upstream object, so no
   service-layer changes were required.
4. **Frontends:**
   - `FE_Web(Provider)/src/services/serveaseProviderApi.ts`
   - `mobile/services/serveaseApi.ts`
   - `Landing Page/src/app/lib/bookings.ts`

   All three `BookingSummary` types now include the fields. Pricing mode
   is reused from each layer's own union.
5. **Provider web pages:**
   - `BookingRequestDetailsPage.tsx` and `BookingDetailsPage.tsx` removed
     the `// Mock data` fallback that fabricated a "Maria Santos" booking.
     Loading state and error state now render through the existing
     `infoBox` style. Real values render from `serviceDescription`,
     `customerNotes`, and `hoursRequired`. Photos are pulled from
     `apiBooking.attachments` filtered by `mediaKind` instead of two empty
     placeholders.

## Verification

- `npx jest` for `booking-lifecycle/supabase-booking.repository.spec` and
  `api-gateway/.../booking.service.spec` — both pass (9/9 and 10/10).
- `npx tsc --noEmit` across `backend`, `mobile`, `FE_Web(Provider)`, and
  `Landing Page` — all clean.

## Remaining stubs

The only `@HttpCode(501)` routes still in the backend are in
`backend/apps/api-gateway/src/features/admin/admin-report.controller.ts`:

| Route | Reason it is still a stub |
|---|---|
| `GET /v1/admin/reports/revenue.pdf` | PDF rendering worker not implemented; CSV exports cover the same data. |
| `POST /v1/admin/reports/:type` | Generic "kick off generation" endpoint; no async worker queue yet. |
| `POST /v1/admin/reports/:type/schedules` | Scheduled-report cron + delivery target storage not implemented. |

All four CSV exports (`bookings`, `revenue`, `users`, `financial`) and
the full set of admin listings/mutations are wired end-to-end.
