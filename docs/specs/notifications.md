# Notifications Slice

## Status

- Owner: backend
- Owning service: Notification Service
- Owning schema: `notification_and_support`
- Implementation status: implemented

## Problem

Users need an authenticated notification inbox and push-device registration path. Notification records live in the `notification_and_support.notifications` table and must remain owned by the Notification Service.

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

- Public route: `GET /v1/notifications`
- Internal route: `GET /internal/notifications?userId=<uuid>`
- Auth: required

Lists recent notifications for the authenticated user.

### `PATCH /v1/notifications/:notificationId/read`

- Public route: `PATCH /v1/notifications/:notificationId/read`
- Internal route: `PATCH /internal/notifications/:notificationId/read`
- Auth: required

Marks one authenticated user's notification as read.

### `POST /v1/notifications/devices`

- Public route: `POST /v1/notifications/devices`
- Internal route: `POST /internal/notifications/devices`
- Auth: required

Registers the authenticated user's Expo push token/device.

### `DELETE /v1/notifications/devices/:token`

- Public route: `DELETE /v1/notifications/devices/:token`
- Internal route: `DELETE /internal/notifications/devices/:token`
- Auth: required

Unregisters the authenticated user's push token/device.

## Internal Service Routes

- `GET /internal/notifications?userId=<uuid>`
- `POST /internal/notifications`
- `PATCH /internal/notifications/:notificationId/read`
- `POST /internal/notifications/devices`
- `DELETE /internal/notifications/devices/:token`

## Error States

- `401 auth_required`
- `401 invalid_auth_token`
- `503 notification_dependency_unavailable`

## Acceptance Criteria

- Missing authentication is rejected at the gateway.
- Notification listing is scoped to the authenticated user ID.
- Mark-read requires both notification ID and authenticated user ID.
- Internal create rejects missing user ID or type.

## Verification Commands

```sh
cd backend
npm run test
npm run build
```
