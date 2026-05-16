# Admin Refund Workflow

## Goal

Replace the admin refund screen's local/mock workflow with backend-owned refund review. Payment Service owns refund requests because it owns payments and payout math. API Gateway remains an HTTP proxy/authorization boundary and must not access payment tables.

## Data Shape

`payment.refund_requests` stores one refund review record per payment:

- `id`
- `payment_id`
- `booking_id`
- `customer_id`
- `provider_id`
- `amount`
- `reason`
- `status`: `requested`, `approved`, `processed`, `rejected`
- `requested_at`
- `decided_by`
- `decision_reason`
- `decided_at`
- `processed_at`
- `created_at`

## API Contract

Gateway endpoints:

- `GET /v1/admin/refunds?status=`
- `POST /v1/admin/refunds/:refundId/approve`
- `POST /v1/admin/refunds/:refundId/reject`

Admin Service internal endpoints:

- `GET /internal/admin/refunds?status=`
- `POST /internal/admin/refunds/:refundId/approve`
- `POST /internal/admin/refunds/:refundId/reject`

Payment Service internal endpoints:

- `GET /internal/admin/payments/refunds?status=`
- `POST /internal/admin/payments/refunds/:refundId/approve`
- `POST /internal/admin/payments/refunds/:refundId/reject`

## Behavior

- Listing returns refund requests ordered newest first.
- Approve moves the request to `approved` and marks the related payment as `refunded`.
- Reject moves the request to `rejected`, records the decision reason, and does not refund the payment.
- Re-approving/rejecting missing records returns not found.
- Invalid statuses or empty reject reasons return invalid request.
- Gateway records best-effort audit logs for approve/reject decisions.

## Acceptance Criteria

- Admin refund screen loads refund requests from the gateway.
- Approve and reject buttons call backend endpoints and update the row locally.
- Backend tests cover invalid status/reason validation and repository RPC mapping.
- Admin smoke verifies the refund list endpoint has live demo data.
