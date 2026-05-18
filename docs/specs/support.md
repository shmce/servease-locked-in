# Support Slice

## Status

- Owner: backend
- Owning service: Support Service
- Owning schema: `notification_and_support`
- Implementation status: implemented

## Problem

Users need a backend path to submit support requests and review their own ticket history. Support data belongs in the Support Service even though it shares the existing `notification_and_support` schema with notifications.

## Goals

- Expose authenticated support ticket create/list routes.
- Persist tickets through the Support Service only.
- Validate subject and category input.
- Keep admin assignment/escalation for a later admin slice.

## Gateway Routes

### `GET /v1/support/tickets`

- Public route: `GET /v1/support/tickets`
- Internal route: `GET /internal/support/tickets`
- Auth: required

Lists tickets owned by the authenticated user.

### `POST /v1/support/tickets`

- Public route: `POST /v1/support/tickets`
- Internal route: `POST /internal/support/tickets`
- Auth: required

Body:

```json
{
  "subject": "Cannot contact provider",
  "message": "The provider did not respond.",
  "category": "booking"
}
```

### `GET /v1/support/tickets/:ticketId`

- Public route: `GET /v1/support/tickets/:ticketId`
- Internal route: `GET /internal/support/tickets/:ticketId`
- Auth: required

Returns one visible support ticket.

### `GET /v1/support/tickets/:ticketId/replies`

- Public route: `GET /v1/support/tickets/:ticketId/replies`
- Internal route: `GET /internal/support/tickets/:ticketId/replies`
- Auth: required

Lists replies for one visible support ticket.

### `POST /v1/support/tickets/:ticketId/replies`

- Public route: `POST /v1/support/tickets/:ticketId/replies`
- Internal route: `POST /internal/support/tickets/:ticketId/replies`
- Auth: required

Adds a user reply to one visible support ticket.

## Error States

- `401 auth_required`
- `401 invalid_auth_token`
- `400 invalid_support_ticket_request`
- `503 support_dependency_unavailable`

## Acceptance Criteria

- Missing authentication is rejected.
- Empty subjects are rejected.
- Created tickets are scoped to the authenticated user.
- Ticket listing only uses the authenticated user ID.

## Verification Commands

```sh
cd backend
npm run test
npm run build
```
