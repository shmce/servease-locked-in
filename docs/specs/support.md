# Support Slice

## Problem

Users need a backend path to submit support requests and review their own ticket history. Support data belongs in the Support Service even though it shares the existing `notification_and_support` schema with notifications.

## Goals

- Expose authenticated support ticket create/list routes.
- Persist tickets through the Support Service only.
- Validate subject and category input.
- Keep admin assignment/escalation for a later admin slice.

## Gateway Routes

### `GET /v1/support/tickets`

Lists tickets owned by the authenticated user.

### `POST /v1/support/tickets`

Body:

```json
{
  "subject": "Cannot contact provider",
  "message": "The provider did not respond.",
  "category": "booking"
}
```

## Acceptance Criteria

- Missing authentication is rejected.
- Empty subjects are rejected.
- Created tickets are scoped to the authenticated user.
- Ticket listing only uses the authenticated user ID.
