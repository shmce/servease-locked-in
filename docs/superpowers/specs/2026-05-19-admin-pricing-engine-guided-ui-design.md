# Admin Pricing Engine Guided UI Design

## Scope

Replace the confusing single-screen Pricing Engine editor with a wizard-first admin experience. The wizard becomes the main way admins create and edit pricing rules, while an advanced editor remains available for experienced admins who need direct field access.

## Goals

- Make pricing rule setup understandable without requiring admins to know the backend formula.
- Guide admins through category scope, labor baseline, travel and fuel, urgency multipliers, outlier thresholds, and final review.
- Show a sample quote preview before publishing so admins can see the effect of their changes.
- Keep advanced access to every backend-supported rule field.
- Preserve the existing admin routes and Payment Service ownership model.

## Existing Contracts

- Admin frontend calls `GET /v1/admin/pricing/rules`.
- Admin frontend calls `PUT /v1/admin/pricing/rules`.
- Admin frontend calls `GET /v1/admin/pricing/fuel-index`.
- Admin frontend calls `POST /v1/admin/pricing/fuel-index`.
- Admin frontend calls `GET /v1/admin/pricing/quote-audits`.
- API Gateway verifies admin access and proxies to Admin Service.
- Admin Service proxies pricing operations to Payment Service.
- Payment Service owns `payment.pricing_category_rules`, `payment.pricing_fuel_index_snapshots`, `payment.pricing_quote_snapshots`, and `payment.pricing_outlier_reviews`.

## Page Structure

The Pricing Engine page should have three primary areas:

1. Overview cards for active rules, latest fuel index, and quote outliers.
2. A rules table with actions: `Create Rule`, `Edit`, `Duplicate`, and `Advanced`.
3. Quote audit table for recent pricing outcomes and outliers.

`Create Rule` and `Edit` open the guided wizard. `Advanced` opens the direct field editor for the selected rule.

## Wizard Flow

### Step 1: Scope

Admins choose the rule category, pricing mode, and active status.

Fields:
- `categoryId`
- `categoryName`
- `pricingMode`
- `isActive`

Guidance:
- Explain that category-specific rules win before default rules.
- Explain that `any` applies when no flat/hourly-specific rule is available.

### Step 2: Labor Baseline

Admins configure the normal labor range.

Fields:
- `baselineMin`
- `baselineMax`

Guidance:
- Explain that hourly provider prices are multiplied by estimated hours.
- Explain that labor is clamped into this baseline before travel and urgency are added.
- Validate that max is greater than or equal to min.

### Step 3: Travel And Fuel

Admins configure travel-related pricing assumptions.

Fields:
- `travelFeeMin`
- `travelFeeMax`
- `travelMultiplier`
- `travelTimeFeePerMinute`
- current default fuel index display

Guidance:
- Explain that distance-based fuel cost uses fuel index and vehicle efficiency assumptions.
- Explain that missing distance falls back to the default travel fee.
- Link or inline action to update the default fuel index.

### Step 4: Urgency And Outliers

Admins configure urgency and review thresholds.

Fields:
- `urgencyPriorityMultiplier`
- `urgencyEmergencyMultiplier`
- `fairBandPercent`
- `outlierWarnPercent`

Guidance:
- Explain that urgency multipliers apply to labor subtotal.
- Explain that fair band creates the fair min/max around the final estimate.
- Explain that outlier warning threshold decides when quotes are marked below or above range.

### Step 5: Review And Publish

Admins review the rule before saving.

Content:
- Summary of all selected fields.
- Sample quote preview using editable sample inputs.
- Before/after comparison when editing an existing rule.
- Clear confirmation button: `Publish Rule`.

The wizard should not submit partial steps to the backend. It builds local draft state and calls `PUT /v1/admin/pricing/rules` only on final publish.

## Advanced Editor

Advanced mode should expose all backend-supported fields in a compact form. It should be available from a rule row or from the wizard review step, but it should not be the default path.

Advanced editor requirements:
- Use the same validation as the wizard.
- Show plain labels matching the backend fields.
- Save through the same `PUT /v1/admin/pricing/rules` endpoint.
- Preserve a way back to the guided wizard for the same rule.

## Sample Quote Preview

The frontend can calculate a local preview using the same deterministic formula as the Payment Service for admin education only. The preview must be labeled as a simulation and should not create a persisted quote snapshot.

Preview inputs:
- provider base price
- pricing mode
- hours required
- distance kilometers
- duration minutes
- urgency
- fuel price per liter

Preview output:
- labor subtotal
- travel and fuel subtotal
- urgency adjustment
- estimated total
- fair range
- fairness status

The saved rule remains authoritative only after Payment Service persists it.

## Error Handling

- If rules fail to load, show an inline error with retry.
- If fuel index fails to load, keep the wizard usable and mark preview confidence as reduced.
- If publish fails validation, keep the admin on the relevant step and highlight the invalid fields.
- If publish fails due to dependency outage, keep the draft state in memory and show a retry action.

## Testing

Frontend tests:
- Wizard opens from `Create Rule`.
- Existing rule opens in wizard with prefilled fields.
- Step validation blocks invalid baseline ranges.
- Final publish calls `saveAdminPricingRule` with all supported fields.
- Advanced editor saves through the same API helper.
- Preview calculation updates when sample inputs or rule fields change.

Backend tests are not required unless the admin API contract changes. This design should reuse existing pricing endpoints.

## Acceptance Criteria

- The default edit path for pricing rules is guided by the wizard.
- Admins can still access an advanced direct editor.
- Every currently supported pricing rule field is editable somewhere in the UI.
- The UI explains how each pricing lever affects the quote.
- The final publish step shows a readable summary before saving.
- Quote audits and fuel index management remain available on the Pricing Engine page.
