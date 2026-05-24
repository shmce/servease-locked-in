# Admin Support Provider Messaging Design

## Problem

Admins can reply to the user who opened a support ticket, but they do not have a direct action from the support workflow to contact the provider involved in the issue. Existing admin provider messaging is booking-scoped and already sends provider-owner notifications while recording the message in the admin booking thread.

## Goals

- Add a support-page action for admins to message the provider related to a ticket.
- Reuse the existing `POST /v1/admin/bookings/:bookingId/provider-messages` contract when a booking can be identified.
- Keep the support ticket owner reply thread separate from provider contact.
- Preserve existing admin authentication, provider-owner notification, booking-thread persistence, and audit behavior.
- Avoid adding event buses, cross-service database reads, or a second messaging system.

## Non-Goals

- Realtime chat between admins and providers.
- Cross-booking provider conversations.
- A new support-ticket participant model.
- Changes to provider mobile/web messaging inbox behavior beyond existing notification delivery.

## Recommended Approach

The admin Support detail dialog gets a "Message provider" panel. The panel first tries to infer a booking from the selected support ticket's message text using the existing booking issue format, which includes `Booking: <id>` and `Reference: <reference>`. If a booking ID is found, the admin can type a message and send it through the existing booking provider message API.

If no booking ID is detected, the panel shows a small booking ID input so the admin can paste or enter the relevant booking. This is intentionally conservative: support tickets do not currently expose structured `bookingId` or `providerId`, so selecting by booking lets the gateway resolve the provider through the existing admin booking flow.

## UI Behavior

- In `admin/src/app/pages/AdminGatewayPages.tsx`, the support conversation dialog adds a provider-contact section below the ticket message and above the reply thread.
- The section shows the detected booking ID when one is found.
- When no booking is detected, it provides a booking ID input.
- The send button is disabled until a booking ID and non-empty provider message are present.
- Successful sends clear only the provider-message draft and show a toast.
- Failed sends show an inline error and a toast.

## Data Flow

1. Admin opens a support ticket.
2. The Support page parses `selectedTicket.message` for a booking ID.
3. Admin writes a provider message.
4. Admin UI calls `sendAdminProviderMessage(accessToken, bookingId, message)`.
5. API Gateway validates the admin, loads the booking, resolves provider owner, persists an admin booking message, sends a notification, and records audit metadata.

## Error Handling

- Empty provider messages are rejected in the UI.
- Missing booking context shows an input instead of failing silently.
- API errors are surfaced inline as "Unable to message provider" with the gateway error text when available.
- The existing gateway behavior remains authoritative for invalid booking IDs, missing provider ownership, or notification failures.

## Testing

- Add focused admin UI tests for:
  - detecting a booking ID from a support ticket message,
  - sending a provider message from the support dialog,
  - requiring a manual booking ID when the ticket has no parseable booking.
- Do not introduce a new API wrapper while `sendAdminProviderMessage` covers the flow.

## Acceptance Criteria

- Admins can message a provider from the Support ticket dialog when a booking ID is present.
- Admins can manually enter a booking ID when the ticket does not include one.
- Provider messages use the existing admin booking provider-message endpoint.
- Support replies still work as before.
- Relevant admin UI tests pass.
