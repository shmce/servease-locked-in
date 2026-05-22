# ServEase Design Spec

## Purpose

ServEase is a service marketplace for booking home, personal, and local services. The product should feel direct, reliable, and approachable: customers can find and book help quickly, while providers can manage jobs without fighting dense administration screens.

This file is the source of truth for product experience, visual direction, interaction patterns, and screen-level acceptance criteria. Implementation workflow, architecture, data ownership, API contracts, and verification rules live under `docs/`.

## Product Principles

- **Trust before decoration:** show provider identity, ratings, availability, price clarity, and booking status before promotional content.
- **Fast repeat workflows:** searching, booking, accepting jobs, messaging, and updating job status should require minimal steps.
- **Clear state transitions:** every booking must visibly move through requested, accepted, scheduled, in progress, completed, disputed, or canceled states.
- **Marketplace neutrality:** the UI should work for many service categories without looking tied to one trade.
- **Mobile-first operations:** customer and provider flows must be usable from a phone as the primary device.

## Visual Direction

The interface should use a clean marketplace style with strong service cards, clear pricing, visible availability, and restrained brand color. Avoid landing-page-heavy composition for app screens. The first screen of the app should be useful: search, service categories, nearby providers, current bookings, or provider jobs depending on user role.

## Design Tokens

```yaml
colors:
  brand: "#ff385c"
  brandPressed: "#e21d48"
  brandSoft: "#ffe8ee"
  success: "#15803d"
  warning: "#b45309"
  danger: "#b91c1c"
  ink: "#1f2933"
  body: "#3f4652"
  muted: "#697586"
  border: "#d9dee7"
  borderSoft: "#edf0f5"
  canvas: "#ffffff"
  surface: "#f7f8fa"
  card: "#ffffff"
  overlay: "rgba(17, 24, 39, 0.54)"

typography:
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
  display:
    size: 28
    weight: 700
    lineHeight: 36
  title:
    size: 20
    weight: 650
    lineHeight: 28
  section:
    size: 17
    weight: 650
    lineHeight: 24
  body:
    size: 15
    weight: 400
    lineHeight: 22
  caption:
    size: 13
    weight: 400
    lineHeight: 18
  action:
    size: 15
    weight: 650
    lineHeight: 20

radius:
  xs: 4
  sm: 8
  md: 12
  lg: 16
  full: 999

spacing:
  xs: 4
  sm: 8
  md: 12
  base: 16
  lg: 24
  xl: 32
  section: 40
```

## Core Components

### Buttons

Primary actions use the brand color and should appear once per decision area. Secondary actions use white or surface backgrounds with a border. Destructive actions use danger styling and must require an explicit confirmation when they affect bookings, payouts, accounts, or provider availability.

### Service Cards

Service cards show category, provider name, rating, price basis, next availability, location radius, and a primary booking affordance. They should not rely on large decorative imagery; images are useful only when they clarify the provider, service, or completed work.

### Booking Status

Booking status must be represented by a label, color, and next action. A status chip alone is not enough when the user has to act; pair the state with a clear command such as accept, reschedule, start job, mark complete, review, or contact support.

### Forms

Forms should be short and staged. Use steppers or grouped sections for booking details, address, schedule, notes, and payment. Validate required fields inline and preserve entered values when a submission fails.

### Navigation

Customers need fast access to search, bookings, messages, and profile. Providers need jobs, calendar, messages, earnings, and profile. Admin tools should stay separate from mobile-first customer and provider workflows.

## Customer Experience

1. Customer opens the app and sees search, service categories, and active bookings.
2. Customer searches or selects a category.
3. Results show providers and service options with price, rating, and availability.
4. Customer chooses a provider or service package.
5. Booking flow captures service details, location, schedule, notes, and payment intent.
6. Confirmation screen shows booking status, provider contact rules, cancellation policy, and next steps.

## Provider Experience

1. Provider sees today's jobs, pending requests, and calendar availability.
2. Provider can accept, decline, reschedule, or message from each job.
3. Job detail contains customer request, address constraints, schedule, notes, price, and status history.
4. Provider can move a job through start, complete, issue reported, or canceled states.
5. Earnings view shows completed work, pending payout, adjustments, and payout history.

## Admin Experience

1. Admin users sign in through Supabase auth and are validated by `GET /v1/me`.
2. Admin pages must show live gateway data or a clear empty/error state; do not present local-only mutations as successful backend changes.
3. Finance, support, catalog, provider application, booking, report, audit, pricing, and user-management screens use `/v1/admin/...` gateway routes.
4. Admin tools should be dense and operational: prioritize tables, filters, queue state, review details, and audit context over marketing-style presentation.
5. Risky actions such as provider decisions, refunds, payouts, account deletion, and booking cancellation require confirmation and visible outcome state.

## Web Experience

`servease-web/` owns the public site, browser account flows, and provider dashboard route mount under `/provider/*`.

- Public pages should emphasize provider discovery, booking clarity, account access, and support paths.
- Browser account flows should use local Next.js API proxy routes when server-side gateway credentials or request shaping are needed.
- Provider dashboard screens should stay under `servease-web/src/provider-app` and use `servease-web/src/services/serveaseProviderApi.ts`.
- Browser code may use Supabase publishable keys only; service-role keys belong in backend environments.

## Empty, Loading, And Error States

- Empty states must offer a next action, not only descriptive text.
- Loading states should preserve layout dimensions to prevent jumps.
- Error states must explain what failed, whether data was saved, and what the user can do next.
- Network failures in booking and payment flows must be retryable without losing form state.

## Accessibility

- Touch targets must be at least 44 by 44 points.
- Text and controls must meet WCAG AA contrast.
- Status cannot be communicated by color alone.
- Interactive icons need accessible labels.
- Forms must announce validation errors and focus the first blocking field.

## Acceptance Criteria

- The first implemented app screen is an operational marketplace screen, not a marketing landing page.
- Customer and provider roles have distinct navigation and workflow priorities.
- Booking status is consistent across mobile UI, gateway responses, and service data.
- Design tokens are reusable in React Native styles and web/admin surfaces.
- UI decisions that affect architecture, contracts, or data ownership are reflected in the docs under `docs/`.
