# Admin Backend Contracts Needed

This document lists backend changes needed to make the remaining admin screens fully functional. It is documentation only; no backend files were changed.

## Rules For Backend Work

- Keep the existing HTTP microservices architecture.
- Route admin requests through the API Gateway on port `5001`.
- Do not add message buses, cross-service database access, or gateway database ownership.
- Each service should own its data and expose HTTP endpoints consumed by the gateway.
- Admin mutations should include authorization checks, audit logging, and structured error responses.

## Already Wired From Admin

These contracts already exist and are consumed by the Next.js admin app:

- `GET /v1/me`
- `GET /v1/admin/payments`
- `PATCH /v1/admin/payments/:paymentId/status`
- `GET /v1/admin/support/tickets`
- `PATCH /v1/admin/support/tickets/:ticketId/status`
- `GET /v1/catalog/categories`
- `GET /v1/catalog/services`
- `GET /v1/catalog/providers`

## Needed Contracts

### Dashboard And Platform Summary

- `GET /v1/admin/dashboard/summary`
- `GET /v1/admin/operations/alerts`
- `GET /v1/admin/users/summary`
- `GET /v1/admin/bookings/summary`

Needed for real top-level customer counts, booking counts, dispute counts, fraud/system alerts, trend deltas, and dashboard charts.

### Customers

- `GET /v1/admin/customers`
- `GET /v1/admin/customers/:customerId`
- `PATCH /v1/admin/customers/:customerId/status`
- `GET /v1/admin/customers/export`

Needed for customer list, detail, suspend/reactivate, and export.

### Provider Applications

- `GET /v1/admin/provider-applications`
- `GET /v1/admin/provider-applications/:applicationId`
- `POST /v1/admin/provider-applications/:applicationId/approve`
- `POST /v1/admin/provider-applications/:applicationId/reject`
- `POST /v1/admin/provider-applications/:applicationId/request-info`
- `GET /v1/admin/provider-applications/:applicationId/documents/:documentId`
- `GET /v1/admin/provider-applications/:applicationId/documents/:documentId/download`

Needed for approval queue, application review, document preview/download, rejection reasons, and KYC decisions.

### Service Providers

- `GET /v1/admin/providers`
- `GET /v1/admin/providers/:providerId`
- `PATCH /v1/admin/providers/:providerId/status`
- `PATCH /v1/admin/providers/:providerId/verification`
- `GET /v1/admin/providers/:providerId/earnings`

Needed because `GET /v1/catalog/providers` returns public listings, not full admin provider profiles.

### Bookings And Operations

- `GET /v1/admin/bookings`
- `GET /v1/admin/bookings/:bookingId`
- `POST /v1/admin/bookings/:bookingId/cancel`
- `POST /v1/admin/bookings/:bookingId/escalate`
- `POST /v1/admin/bookings/:bookingId/provider-messages`

Needed for all bookings, ongoing services, force cancel, escalation, provider contact, and booking detail drawers.

### Disputes

- `GET /v1/admin/disputes`
- `GET /v1/admin/disputes/:disputeId`
- `PATCH /v1/admin/disputes/:disputeId/assignee`
- `POST /v1/admin/disputes/:disputeId/resolve`
- `POST /v1/admin/disputes/:disputeId/refund`

Needed for disputes and resolutions workflows.

### Payments, Refunds, Payouts, Settlements

- `GET /v1/admin/payments/:paymentId`
- `GET /v1/admin/payments/failures`
- `GET /v1/admin/refunds`
- `POST /v1/admin/refunds/:refundId/approve`
- `POST /v1/admin/refunds/:refundId/reject`
- `GET /v1/admin/payout-requests`
- `POST /v1/admin/payout-requests/:payoutId/approve`
- `POST /v1/admin/payout-requests/:payoutId/reject`
- `POST /v1/admin/payout-requests/:payoutId/release`
- `GET /v1/admin/settlements`
- `POST /v1/admin/settlements/:settlementId/approve`
- `POST /v1/admin/settlements/:settlementId/reject`

Needed for real failure reasons, refund processing, payout approval, settlement approval, release flows, and finance audit trails.

### Catalog Admin

- `POST /v1/admin/catalog/categories`
- `PATCH /v1/admin/catalog/categories/:categoryId`
- `DELETE /v1/admin/catalog/categories/:categoryId`
- `POST /v1/admin/catalog/services`
- `PATCH /v1/admin/catalog/services/:serviceId`
- `DELETE /v1/admin/catalog/services/:serviceId`
- `PATCH /v1/admin/catalog/services/:serviceId/status`

Needed for category/service CRUD and status management.

### Service Areas

- `GET /v1/admin/service-areas`
- `POST /v1/admin/service-areas`
- `PATCH /v1/admin/service-areas/:areaId`
- `PATCH /v1/admin/service-areas/:areaId/status`
- `DELETE /v1/admin/service-areas/:areaId`

Needed for geographic coverage management.

### Promotions And Broadcasts

- `GET /v1/admin/promotions`
- `POST /v1/admin/promotions`
- `PATCH /v1/admin/promotions/:promotionId`
- `PATCH /v1/admin/promotions/:promotionId/status`
- `DELETE /v1/admin/promotions/:promotionId`
- `POST /v1/admin/broadcasts`
- `GET /v1/admin/broadcasts`

Needed for marketing promotions, lifecycle, targeting, and announcement delivery.

### Commission Rules

- `GET /v1/admin/commission-rules`
- `PATCH /v1/admin/commission-rules/:ruleId`
- `POST /v1/admin/commission-rules`

Needed for commission rule edits and financial audit trails.

### Admin Users, Roles, Audit Trail

- `GET /v1/admin/users`
- `POST /v1/admin/users`
- `PATCH /v1/admin/users/:adminId`
- `PATCH /v1/admin/users/:adminId/status`
- `POST /v1/admin/users/:adminId/invitations`
- `GET /v1/admin/roles`
- `PATCH /v1/admin/roles/:roleId`
- `GET /v1/admin/audit-logs`
- `GET /v1/admin/audit-logs/export`

Needed for admin CRUD, invitations, RBAC, and activity/audit exports.

### Account And Security

- `PATCH /v1/me`
- `GET /v1/me/settings`
- `PATCH /v1/me/settings`
- `PATCH /v1/me/password`
- `GET /v1/me/sessions`
- `DELETE /v1/me/sessions/:sessionId`
- `POST /v1/me/two-factor/enable`
- `POST /v1/me/two-factor/disable`

Needed for admin profile updates, synced settings, password changes, active sessions, and 2FA.

### Integrations

- `GET /v1/admin/integrations`
- `PATCH /v1/admin/integrations/:provider/credentials`
- `POST /v1/admin/integrations/:provider/test`
- `PATCH /v1/admin/integrations/:provider/status`

Needed for payment, messaging, maps, analytics, and push-provider configuration. Secret values should stay server-side.

### Reports

- `GET /v1/admin/reports/revenue.pdf`
- `GET /v1/admin/reports/bookings.csv`
- `GET /v1/admin/reports/bookings.pdf`
- `POST /v1/admin/reports/:reportType`
- `GET /v1/admin/reports/:reportId/download`
- `POST /v1/admin/reports/:reportType/schedules`
- `PATCH /v1/admin/reports/:reportType/schedules/:scheduleId/status`

Needed for PDF generation, scheduled reports, historical report downloads, and non-payment analytics.

## Frontend Status

The admin app now exposes `/backend-support` as an in-app matrix. It shows which screens are wired, partial, local-only, or blocked, and exports the same information as CSV.
