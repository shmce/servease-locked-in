# Mobile App Design Spec

## Status

- Owner: mobile
- Source design: `DESIGN.md`
- Implementation status: proposed
- Scope: customer and provider mobile app experience

## Purpose

The ServEase mobile app is the primary operational surface for customers and providers. It must open directly into useful work: customers see marketplace search, active bookings, and messages; providers see jobs, availability, messages, and earnings. The app must not behave like a marketing landing page.

## Product Principles

- Trust first: provider identity, verification, rating, price, availability, and booking status must be visible before decorative content.
- Fast repeat workflows: booking, messaging, status updates, support, and reviews should require few taps.
- Clear state transitions: every booking status must pair a readable label with the next available action.
- Role-specific operations: customer and provider navigation must prioritize different jobs-to-be-done.
- Mobile-first density: screens should be scannable and compact without becoming visually crowded.

## Visual System

Use the tokens in `DESIGN.md` and keep them mirrored in `mobile/constants/designTokens.ts`.

### Color Usage

- Brand `#ff385c`: primary actions, selected controls, important accents.
- Brand soft `#ffe8ee`: selected backgrounds and alert bands.
- Success `#15803d`: completed, paid, resolved, available.
- Warning `#b45309`: pending, open, needs action.
- Danger `#b91c1c`: rejected, cancelled, destructive actions.
- Ink/body/muted: text hierarchy.
- Surface/card/canvas: app background and content surfaces.

Avoid one-note palettes. Do not let the app become mostly pink, mostly slate, or mostly beige. Brand color should guide attention, not dominate the full screen.

### Typography

- Display: app titles and major workspace headers only.
- Title: screen titles and key selected item names.
- Section: panel headings and workflow step headings.
- Body: readable content, form values, descriptions.
- Caption: metadata, helper text, timestamps, secondary labels.
- Action: buttons, chips, segmented controls.

Text must not scale with viewport width. Long labels must wrap or truncate inside stable containers.

### Layout

- Use full-width screen sections with constrained internal padding.
- Use cards only for repeated items, selected objects, modals, and framed tools.
- Do not nest cards inside cards.
- Maintain stable dimensions for cards, buttons, status chips, counters, and tab bars.
- Touch targets must be at least 44 by 44 points.

## Navigation Model

### Signed-Out Shell

The signed-out screen shows:

- Marketplace preview: search input, categories, and provider/service listings.
- Sign-in panel: email, password, Supabase public configuration only when needed.
- Clear error band for missing configuration, invalid credentials, or gateway failure.

No signed-out screen should block public catalog browsing.

### Customer Tabs

1. Search
2. Bookings
3. Messages
4. Profile

Customer primary action: create a booking.

### Provider Tabs

1. Jobs
2. Calendar
3. Messages
4. Earnings
5. Profile

Provider primary action: respond to or update a job.

### Admin

Admin workflows are backend-supported but are not part of the mobile-first app. If admin UI is needed later, it should be a separate admin surface, not mixed into the customer/provider mobile navigation.

## Customer Screens

### Customer Home / Search

Purpose: help a customer quickly find a service and understand whether it is trustworthy and bookable.

Content:

- Search input.
- Category chips.
- Service/provider cards.
- Active booking summary if the customer has active bookings.
- Notification count.

Service/provider cards show:

- Service title.
- Provider business name.
- Verification status.
- Rating and review count.
- Price and pricing mode.
- Next availability if available.
- Short description.
- Primary action to select or book.

States:

- Loading: preserve list height with skeleton rows or fixed loading cards.
- Empty: "No providers found" with a category reset action.
- Error: explain whether catalog loading failed and offer retry.

### Service Detail

Purpose: confirm the selected service before booking.

Content:

- Provider identity and verification.
- Service description.
- Price and fee basis.
- Rating summary and recent reviews.
- Availability summary.
- Service area and constraints.
- Primary booking action.

Do not use oversized decorative images unless they show real service work or provider evidence.

### Booking Wizard

Purpose: capture only the information needed to create a booking.

Steps:

1. Service details: selected provider/service and pricing summary.
2. Address: service address and notes about access.
3. Schedule: date/time, duration, availability feedback.
4. Notes: customer notes and optional instructions.
5. Payment intent: payment method, amount, and confirmation.

Rules:

- Required field errors appear inline.
- User-entered values persist if submission fails.
- Provider unavailable errors keep the form intact and return focus to schedule.
- Submit creates a `pending` booking through the gateway.

### Booking Confirmation

Purpose: show what happened and what the customer should do next.

Content:

- Booking reference.
- Current status.
- Schedule and address.
- Provider summary.
- Price and payment method.
- Next actions: message, payment, support, cancel when allowed.

### Customer Bookings

Purpose: let customers scan active and past bookings.

Content:

- Segmented filter: active, completed, cancelled.
- Booking cards with status, date, provider, service, amount, and next action.
- Empty active state with a search action.

Status behavior:

- `pending`: show waiting state and cancel action if allowed.
- `confirmed`: show schedule and message action.
- `in_progress`: show job in progress and support action.
- `completed`: show review and receipt/payment actions.
- `cancelled` or `rejected`: show reason if available and rebook action.

### Booking Detail

Purpose: one place to manage a specific booking.

Content:

- Status timeline.
- Provider/customer visible details.
- Address and schedule.
- Notes.
- Payment summary.
- Conversation entry point.
- Review entry point when completed.
- Support entry point.

Actions must be role-aware and based on the server status, not local assumptions.

## Provider Screens

### Provider Jobs

Purpose: make today's work and pending requests immediately actionable.

Content:

- Today summary: pending, confirmed, in progress, completed.
- Pending request cards.
- Today's schedule.
- Job cards with customer request, address constraints, time, amount, and status.

Primary actions:

- Pending: accept, decline, message.
- Confirmed: start job, message, support.
- In progress: mark complete, report issue.
- Completed: view earning, message history.

### Provider Job Detail

Purpose: give providers enough context to do the work without administrative clutter.

Content:

- Customer name or safe display identity.
- Service request.
- Address and access notes.
- Schedule and duration.
- Price and payout preview.
- Status history.
- Messages.
- Issue/support action.

Dangerous or irreversible actions require confirmation.

### Provider Calendar

Purpose: manage availability and days off.

Content:

- Weekly availability windows.
- Day-off list.
- Add/edit window form.
- Add day off form.

States:

- Loading: fixed schedule rows.
- Empty: add availability action.
- Error: preserve edited values and offer retry.

### Provider Messages

Purpose: keep job communication lightweight and booking-scoped.

Content:

- Conversation list grouped by active bookings first.
- Message thread.
- Composer.
- Booking context header.

Messages must always be attached to a booking conversation. No general free-floating chat is in scope.

### Provider Earnings

Purpose: show work value without acting as a full ledger.

Content:

- Completed work total.
- Pending payout total.
- Payment status list.
- Per-job payout summary with platform fee.

Non-goals:

- Bank account management.
- Payout execution.
- Refund money movement.

## Shared Screens

### Messages

Conversation list:

- Booking/service title.
- Counterparty display name.
- Last message timestamp.
- Unread indicator when available.

Thread:

- Booking context header.
- Message bubbles with sender role.
- Delivery status when available.
- Composer with disabled state while sending.

### Payments

Payment surfaces show:

- Booking reference.
- Amount.
- Platform fee.
- Provider payout.
- Payment method.
- Status.
- Paid timestamp when available.

Payment status must use both text and color.

### Reviews

Customer review form appears only for completed bookings.

Review form:

- Rating control.
- Review text.
- Submit action.
- Inline error if booking is not eligible.

Provider review display:

- Average rating.
- Review count.
- Recent review list.

### Support

Support ticket form:

- Subject.
- Category.
- Message.
- Related booking when available.

Ticket list:

- Subject.
- Status.
- Created date.
- Latest visible message when available.

## Components

### App Shell

- Safe area aware.
- Status bar uses dark content on light surfaces.
- Top summary section adapts by role.
- Bottom tabs use labels and icons when icon library is available.

### Buttons

- Primary: one per decision area, brand background.
- Secondary: border, white or surface background.
- Destructive: danger styling and confirmation.
- Disabled: visibly disabled and non-interactive.

### Status Chips

Each chip includes:

- Label.
- Tone.
- Accessible text.

Mapping:

- Pending/open: warning.
- Confirmed/in progress/read-neutral: neutral.
- Completed/paid/resolved: success.
- Cancelled/rejected/refunded/destructive: danger.

### Cards

Card types:

- Service card.
- Booking card.
- Job card.
- Conversation row.
- Payment row.
- Support ticket row.
- Notification row.

All cards need stable padding, an 8px radius, and a clear selection state.

### Forms

Form design:

- Group related fields.
- Preserve values on failure.
- Validate required fields inline.
- Keep submit buttons fixed in the visible form section when possible.
- Use native inputs for text and numeric values until richer controls are needed.

## Data And API Mapping

The mobile app calls only the API Gateway.

Public:

- `GET /v1/catalog/categories`
- `GET /v1/catalog/services?categoryId=...`
- `GET /v1/catalog/providers?serviceId=...`
- `GET /v1/reviews?providerId=...`

Authenticated:

- `GET /v1/me`
- `GET /v1/bookings`
- `GET /v1/bookings?scope=provider`
- `POST /v1/bookings`
- `PATCH /v1/bookings/:bookingId/status`
- `GET /v1/conversations`
- `POST /v1/conversations`
- `GET /v1/conversations/:conversationId/messages`
- `POST /v1/conversations/:conversationId/messages`
- `GET /v1/payments`
- `POST /v1/payments`
- `POST /v1/reviews`
- `GET /v1/support/tickets`
- `POST /v1/support/tickets`
- `GET /v1/notifications`
- `PATCH /v1/notifications/:notificationId/read`

Mobile must not call Supabase directly except for Supabase Auth password sign-in with the publishable key.

## Error, Empty, And Loading Rules

Loading:

- Preserve dimensions.
- Avoid full-screen spinners after initial load.
- Show local loading on the action that started the request.

Empty:

- Explain what is missing.
- Provide one useful next action.

Error:

- Show what failed.
- Say whether entered data was saved locally.
- Provide retry or recovery action.
- Keep forms intact after network or validation errors.

## Accessibility

- Minimum touch target: 44 by 44 points.
- All interactive controls need accessible labels.
- Status must not rely on color alone.
- Form validation errors should be adjacent to fields and announced by screen readers where possible.
- Text contrast must meet WCAG AA.

## Implementation Order

1. Finalize app shell, tokens, and shared components.
2. Customer search and booking flow.
3. Customer bookings, booking detail, messages, payments, reviews, support, notifications.
4. Provider jobs and job detail.
5. Provider calendar and availability management.
6. Provider earnings.
7. Native polish: secure session persistence, icons, platform-specific keyboard handling, and device testing.

## Acceptance Criteria

- The first screen after launch is operational and role-aware.
- Customers can browse catalog, create bookings, view booking status, message, pay, review, and request support.
- Providers can view jobs, update status, message, manage availability, and view earnings.
- All states include loading, empty, error, and success behavior.
- Design tokens are reused from `DESIGN.md`.
- Mobile API clients match gateway contracts and do not call backend services directly.
- Customer and provider flows can be verified against the backend `npm run verify` state.

## Verification Commands

```sh
cd backend
npm run verify

cd ../mobile
npm run typecheck
npm test
npm run web
```
