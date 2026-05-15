# Backend Adjustments Needed For Provider Web

No backend files were changed for this migration.

The Next.js provider web app currently runs with Figma-generated local/mock state. To wire it to live data, the API Gateway needs provider-facing contracts for the screens below. Existing gateway routes should be reused where they already match.

## Existing Routes To Reuse Or Confirm

- `POST <SUPABASE_URL>/auth/v1/token?grant_type=password`
- `GET /v1/me`
- `GET /v1/bookings?scope=provider`
- `GET /v1/bookings/:bookingId`
- `PATCH /v1/bookings/:bookingId/status`
- `GET /v1/provider/availability`
- `PUT /v1/provider/availability/windows`
- `POST /v1/provider/availability/days-off`
- `DELETE /v1/provider/availability/days-off/:offDate`
- `GET /v1/payments`
- `GET /v1/conversations`
- `POST /v1/conversations`
- `GET /v1/conversations/:conversationId/messages`
- `POST /v1/conversations/:conversationId/messages`
- `GET /v1/notifications`
- `PATCH /v1/notifications/:notificationId/read`
- `GET /v1/reviews?providerId=<providerId>`

## Frontend Wiring Added

The provider web app now calls these live routes when environment variables and a valid provider token are available:

- Login uses Supabase password auth, then `GET /v1/me`.
- Provider route protection restores the stored access token through `GET /v1/me` and requires `role: "provider"`, an existing `providerProfile`, and `status: "active"`.
- Availability loads from `GET /v1/provider/availability`.
- Weekly availability saves through `PUT /v1/provider/availability/windows`.
- Blocked dates save through `POST /v1/provider/availability/days-off`.
- Provider bookings load from `GET /v1/bookings?scope=provider`.
- Booking and request details load from `GET /v1/bookings/:bookingId`.
- Accept/reject/start/complete actions use `PATCH /v1/bookings/:bookingId/status`.
- Earnings dashboard, earnings details, and payout balance load from `GET /v1/payments`.
- Messages load through the gateway:
  - `GET /v1/conversations`
  - `GET /v1/conversations/:conversationId/messages`
  - `POST /v1/conversations/:conversationId/messages`
- Header notifications load through the gateway:
  - `GET /v1/notifications`
  - `PATCH /v1/notifications/:notificationId/read`

Required frontend environment variables:

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

The current frontend keeps mock data as a fallback when the user is not signed in or the backend is unavailable.

## Missing Or Incomplete Provider Contracts

- Current provider profile endpoint: return authenticated provider identity, business profile, service areas, documents, services/pricing, portfolio, and payout setup status.
- Provider dashboard summary endpoint: upcoming bookings, pending requests, earnings snapshot, rating/review snapshot, response-time metrics.
- Booking request actions: accept, reject, and cancel with provider reason.
- Booking list payload currently lacks customer address detail beyond `serviceAddress`, service duration, customer rating, request notes, photos, and customer instructions. The frontend displays fallbacks for those fields until the backend exposes them.
- Counter-offers are intentionally removed from the provider web app and should not be implemented unless the product scope changes.
- Booking status transitions currently require `currentStatus` and `nextStatus`. Confirm provider-allowed transitions for `pending -> confirmed`, `pending -> rejected`, `confirmed -> in_progress`, and `in_progress -> completed`.
- Availability break windows: the Figma UI has `breakStart` and `breakEnd`, but the current backend contract only accepts one `startTime`/`endTime` window per day. Add break support or document that breaks are not persisted.
- Provider earnings endpoint: provider-scoped gross earnings, platform fees, net earnings, payout status, transaction list, and filters.
- Payout methods and payout request endpoint: add/update payout account, request payout, and read payout request status.
- Payment records currently provide enough data for basic frontend earnings calculations, but not full provider statements. Add or confirm fields for payout batch ID, payout availability date, settlement status, customer display name, service title, and booking reference if those should be shown accurately.
- The provider web app can calculate summaries client-side from `GET /v1/payments`, but a dedicated provider earnings summary endpoint would avoid over-fetching as payment volume grows.
- Conversation records currently provide IDs and timestamps only. For production-quality provider messaging, add or confirm display fields such as customer display name, customer avatar/photo URL, booking reference, service title, booking schedule, booking status, unread count, and last message preview.
- Message sending currently supports text content only. The Figma UI includes image attachments, but no gateway upload/message attachment contract is confirmed for provider messages.
- Notification preferences are still local UI state. Add gateway routes for reading/updating provider notification preferences if these settings must persist across devices.
- Notification metadata should be standardized per type so the frontend can deep-link to bookings, messages, payouts, reviews, or support records from the notification dropdown.
- Review management endpoints: provider reply to review and provider report review.
- Notification preferences endpoint: read/update channel preferences and alert categories.
- Portfolio management endpoints: create/update/delete/reorder provider portfolio items and handle image upload URLs.
- Services/pricing management endpoints: create/update/delete/toggle provider services and pricing rules.

## Contract Rules

- Keep public routes under `/v1`.
- Keep the API Gateway as the only browser-facing backend.
- Do not add cross-service database access from the gateway.
- Each service should continue to own its schema and expose HTTP endpoints to the gateway.
- Use the existing response envelope conventions: `{ "data": ... }` and `{ "error": { "code": "...", "message": "...", "details": {} } }`.
