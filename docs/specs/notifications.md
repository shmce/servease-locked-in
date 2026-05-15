# Notifications Slice

## Problem

Users need an authenticated notification inbox. Notification records already exist in the `notification_and_support.notifications` table, but the Notification Service has no service API or gateway routes yet.

## Goals

- Expose authenticated notification list and mark-read routes.
- Add an internal create route for backend/admin workflows.
- Keep notification persistence inside Notification Service.
- Ensure users can only read and mark their own notifications.

## Non-Goals

- Push delivery.
- Email/SMS delivery.
- Realtime subscriptions.
- Notification templates.

## Gateway Routes

### `GET /v1/notifications`

Lists recent notifications for the authenticated user.

### `PATCH /v1/notifications/:notificationId/read`

Marks one authenticated user's notification as read.

## Internal Service Routes

- `GET /internal/notifications?userId=<uuid>`
- `POST /internal/notifications`
- `PATCH /internal/notifications/:notificationId/read`

## Acceptance Criteria

- Missing authentication is rejected at the gateway.
- Notification listing is scoped to the authenticated user ID.
- Mark-read requires both notification ID and authenticated user ID.
- Internal create rejects missing user ID or type.
