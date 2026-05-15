# Admin Payments Slice

## Problem

The first payment slice creates payment records, but administrators need a backend route to review and update payment status while external processor integration remains out of scope.

## Goals

- Expose admin-authenticated payment list and status update routes.
- Keep payment persistence inside Payment Service.
- Use Admin Service as the admin workflow boundary.
- Support manual transitions to `pending`, `paid`, `cancelled`, or `refunded`.

## Non-Goals

- Card processor webhooks.
- Payout execution.
- Refund money movement.
- Ledger accounting.

## Gateway Routes

### `GET /v1/admin/payments?status=pending`

Requires authenticated user with `admin` role.

Errors:

- `400 invalid_admin_request` for unsupported status filters or update values.
- `403 admin_required` for authenticated non-admin users.
- `503 admin_dependency_unavailable` when the Admin Service or downstream Payment Service is unavailable.

### `PATCH /v1/admin/payments/:paymentId/status`

Body:

```json
{
  "status": "paid"
}
```

Requires authenticated user with `admin` role.

Errors:

- `400 invalid_admin_request` for missing or unsupported status values.
- `403 admin_required` for authenticated non-admin users.
- `503 admin_dependency_unavailable` when the Admin Service or downstream Payment Service is unavailable.

## Acceptance Criteria

- Non-admin users cannot access admin payment routes.
- Invalid payment statuses are rejected by Payment Service.
- Admin Service has no database access.
- Payment Service owns payment status updates.
