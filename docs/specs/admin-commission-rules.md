# Admin Commission Rules

## Goal

Persist admin commission rule edits in the Payment Service instead of keeping the Commission Rules page local-only. Payment Service owns this data because it already owns pricing, payment fees, and payout math.

## Scope

- Store category-level commission rules in `payment.commission_rules`.
- Keep the existing global payment calculation compatible with `payment.platform_pricing_config`.
- Expose admin list/update routes through Payment Service, Admin Service, and API Gateway over HTTP.
- Wire the admin Commission Rules page to the gateway.

## Data Shape

- `id`
- `category_key`
- `category_label`
- `current_rate`
- `previous_rate`
- `status`: `active`, `pending`, `inactive`
- `monthly_revenue`
- `monthly_commission`
- `updated_by`
- `updated_at`
- `created_at`

## API Contract

Gateway endpoints:

- `GET /v1/admin/commission-rules`
- `PATCH /v1/admin/commission-rules/:ruleId`

Internal Admin Service endpoints:

- `GET /internal/admin/commission-rules`
- `PATCH /internal/admin/commission-rules/:ruleId`

Internal Payment Service endpoints:

- `GET /internal/admin/payments/commission-rules`
- `PATCH /internal/admin/payments/commission-rules/:ruleId`

## Behavior

- List returns rules ordered by category label.
- Update accepts `currentRate`, `status`, and `adminUserId`.
- Rate must be between `0` and `100`.
- Status must be `active`, `pending`, or `inactive`.
- Updating a rule shifts old `current_rate` into `previous_rate`.
- Updating the `platform-default` rule also inserts a new `payment.platform_pricing_config` row so existing payment creation continues using the latest global commission rate.

## Acceptance Criteria

- Admin Commission Rules loads backend rules.
- Saving a rule calls the gateway and updates the row locally.
- Invalid rates fail before backend calls in the admin UI and fail in Payment Service validation.
- Backend tests cover service validation and repository RPC mapping.
- Admin smoke verifies commission rules can be listed through the gateway.
