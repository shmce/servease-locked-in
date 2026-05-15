# Admin Support Slice

## Problem

Administrators need a backend workflow to review and update support tickets. The existing architecture has an Admin Service shell but no admin API behavior.

## Goals

- Expose admin-authenticated gateway routes for support ticket operations.
- Keep support ticket persistence inside Support Service.
- Use Admin Service as the admin workflow boundary.
- Allow admins to list support tickets and update ticket status.

## Non-Goals

- Admin user management.
- Provider verification workflows.
- Payment dispute resolution.
- Audit log persistence.

## Gateway Routes

### `GET /v1/admin/support/tickets?status=open`

Requires authenticated user with `admin` role.

Errors:

- `400 invalid_admin_request` for unsupported status filters.
- `403 admin_required` for authenticated non-admin users.
- `503 admin_dependency_unavailable` when the Admin Service or downstream Support Service is unavailable.

### `PATCH /v1/admin/support/tickets/:ticketId/status`

Body:

```json
{
  "status": "resolved"
}
```

Requires authenticated user with `admin` role.

Errors:

- `400 invalid_admin_request` for missing or unsupported status values.
- `403 admin_required` for authenticated non-admin users.
- `503 admin_dependency_unavailable` when the Admin Service or downstream Support Service is unavailable.

## Internal Flow

1. Gateway authenticates bearer token.
2. Gateway loads current user profile through existing Auth/User/Catalog services.
3. Gateway rejects non-admin users with `403 admin_required`.
4. Gateway calls Admin Service.
5. Admin Service calls Support Service internal admin endpoints.
6. Support Service owns all writes to `notification_and_support.support_tickets`.

## Acceptance Criteria

- Non-admin users cannot access admin support routes.
- Invalid status values are rejected.
- Admin Service has no database access.
- Support Service owns the ticket status update RPC.
