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

## Now Wired Since Last Revision

- **Provider profile endpoint**: `GET /v1/provider/profile` returns business profile, services, portfolio, and verification status; consumed by `getProviderProfile`.
- **Provider dashboard summary endpoint**: `GET /v1/provider/dashboard` returns upcoming bookings, pending requests, earnings snapshot, and rating snapshot; consumed by `getProviderDashboard`.
- **Booking actions** (`accept`, `reject`, `start`, `complete`): served by `PATCH /v1/bookings/:bookingId/status` with `currentStatus` and `nextStatus`.
- **Provider-owned services CRUD**: `GET /v1/provider/services`, `PUT /v1/provider/services` (`replaceProviderOwnedServices`).
- **Payout account / methods / requests**: `GET/PUT /v1/payments/payout-account`, `GET/PUT /v1/payments/payout-methods`, `GET/POST /v1/payments/payouts` consumed by `getProviderPayoutAccount`, `listProviderPayoutMethods`, `upsertProviderPayoutMethod`, `listProviderPayouts`, and `requestProviderPayout`.
- **Provider review reply and flag**: `POST /v1/reviews/:id/reply` and `POST /v1/reviews/:id/flag` consumed by `replyToReview` and `flagReview`.
- **Portfolio CRUD**: `POST/GET/DELETE /v1/catalog/provider/portfolio` consumed by `addProviderPortfolioMedia`, `listCurrentProviderPortfolioMedia`, and `deleteProviderPortfolioMedia`.
- **Notification preferences (provider AND customer)**: `GET/PUT /v1/me/preferences` stores `pushNotificationsEnabled`, `notificationPreferences` per user. Provider web wires it via `NotificationPreferencesPage`; customer landing page wires it via the Account → Notification Preferences section.

## Still Missing Or Incomplete Provider Contracts

- Booking list payload currently lacks customer address detail beyond `serviceAddress`, service duration, customer rating, request notes, photos, and customer instructions. The frontend displays fallbacks for those fields until the backend exposes them.
- Counter-offers are intentionally removed from the provider web app and should not be implemented unless the product scope changes.
- Availability break windows: the Figma UI has `breakStart` and `breakEnd`, but the current backend contract only accepts one `startTime`/`endTime` window per day. Add break support or document that breaks are not persisted.
- Provider earnings summary endpoint: a dedicated `/v1/provider/earnings` would avoid client-side summarization over `/v1/payments` as volume grows. Today the frontend calculates from raw payment rows.
- Payment record fields: payout batch ID, payout availability date, settlement status, customer display name, service title, and booking reference are not all present on `/v1/payments`. Frontend uses fallbacks.
- Conversation rich display fields: customer display name, avatar/photo URL, booking reference, service title, booking schedule, booking status, unread count, and last message preview are not exposed yet.
- Message attachments: `POST /v1/conversations/:id/messages` is text-only. Image attachments shown in Figma require an upload + attachment contract.
- Notification metadata standardization per type, so the frontend can deep-link to bookings, messages, payouts, reviews, or support records.
- Pricing rules management on top of services: tiered pricing, surge windows, and provider-specific add-ons remain out of scope until product confirms.

## Contract Rules

- Keep public routes under `/v1`.
- Keep the API Gateway as the only browser-facing backend.
- Do not add cross-service database access from the gateway.
- Each service should continue to own its schema and expose HTTP endpoints to the gateway.
- Use the existing response envelope conventions: `{ "data": ... }` and `{ "error": { "code": "...", "message": "...", "details": {} } }`.
