# Messaging Slice

## Problem

Customers and providers need a booking-scoped conversation after a booking exists. The backend must expose this through the API Gateway while keeping the Messaging Service as the only owner of the `messages` schema.

## Goals

- Expose authenticated gateway routes for booking conversations.
- Allow a booking participant to open or fetch the booking conversation.
- Allow customers and providers to send text messages in visible conversations.
- List visible conversations and conversation messages.
- Keep communication pure HTTP between gateway, Booking Service, Catalog Service, and Messaging Service.

## Non-Goals

- WebSockets or realtime subscriptions.
- Message attachments.
- Read receipts.
- Push notifications.
- Cross-booking conversations.

## Data Ownership

- Messaging Service owns the `messages` schema.
- Booking Service remains the source of truth for booking visibility and participant IDs.
- Catalog Service remains the source of truth for provider profile resolution.
- API Gateway authenticates Supabase tokens and coordinates service calls. It does not query messaging tables.

## Gateway Routes

### `GET /v1/conversations`

Lists conversations visible to the authenticated user. Customers match `customer_id`; providers match their provider profile ID.

### `POST /v1/conversations`

Body:

```json
{
  "bookingId": "uuid"
}
```

The gateway first verifies the booking is visible to the authenticated user. The Messaging Service then creates or returns the booking conversation.

### `GET /v1/conversations/:conversationId/messages`

Lists messages for a visible conversation.

### `POST /v1/conversations/:conversationId/messages`

Body:

```json
{
  "content": "Message text"
}
```

The gateway sends the authenticated user ID as `senderId` and derives `senderRole` from whether the user is the customer or provider participant.

## Error States

- `401 auth_required`
- `401 invalid_auth_token`
- `400 invalid_messaging_request`
- `403 conversation_forbidden`
- `404 conversation_not_found`
- `404 booking_not_found`
- `503 messaging_dependency_unavailable`

## Acceptance Criteria

- The API Gateway exposes the four conversation routes.
- A conversation can only be created after the caller can see the booking.
- Empty or whitespace-only message content is rejected.
- Providers can access conversations through their provider profile ID.
- Messaging Service uses service-role-only RPC functions in `public`.
- Gateway and service tests cover create/list/send failure and success paths.
