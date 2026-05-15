# Figma Make Mobile App Spec

Create a mobile-first ServEase app UI. ServEase is a local services marketplace for customers and providers. The app must open directly into useful work, not a landing page.

## Visual System

Use a clean operational style. Background `#f7f8fa`, cards `#ffffff`, primary brand `#ff385c`, green primary/accent `#15803d`, brand soft `#ffe8ee`, warning `#b45309`, danger `#b91c1c`, text `#1f2933`, muted `#697586`, borders `#d9dee7`.

Green may be used as one of the main app colors for trust, availability, completed work, paid states, provider success, and positive primary accents. Use pink for customer booking emphasis and green for trusted/service-ready emphasis.

Use 8px card radius max. Touch targets min 44px. Typography: large title only for app/workspace header, compact section headings, readable body text, small metadata. Avoid decorative blobs/gradients and marketing hero layout.

## App Shell

Top header with ServEase logo/icon, current workspace subtitle, and compact metrics row. Below it show an alert/status band. Use a segmented tab bar.

Signed-out tabs:

1. Search
2. Account

Customer tabs:

1. Search
2. Bookings
3. Messages
4. Profile

Provider tabs:

1. Jobs
2. Calendar
3. Messages
4. Earnings
5. Profile

## Signed-Out Search

Show public marketplace browsing. Include search input, category chips, service cards, provider cards. Provider cards show service title, business name, verification chip, rating/review count, price, pricing mode, short description, and select/book action. Empty state: "No providers found".

## Account / Sign-In

Compact form for API URL, Supabase URL, publishable key, email, password, sign-in button. Signed-in state shows name/email, role, account status, address or provider business name, provider rating and verification if provider.

## Customer Search

Marketplace plus booking request panel. Booking panel shows selected provider/service summary, price, address field, scheduled time, duration, notes, and primary "Create booking" button. Preserve form values on errors.

## Customer Bookings

Show summary metrics: active, completed, unread. Booking cards show service title, booking reference, schedule, status chip, address, amount, and next action. Filters can be active/completed/cancelled. Empty state points back to Search.

## Booking Detail

Show selected booking in a clear detail panel: title/reference, status, amount, schedule, address, payment summary. Actions are status-aware: cancel when allowed, open messages, create payment. Completed bookings show review entry.

## Messages

Conversation list with booking reference and last message time. Message thread panel with recent bubbles. Message composer with multiline input and send button. Empty state: "Open messages on a booking".

## Customer Profile

Profile card, support form, support ticket list, notification list. Unread notifications have "Read" action. Ticket chips show open/in progress/resolved.

## Provider Jobs

Default provider home. Show today summary metrics: pending, confirmed, in progress, completed/unread. Job cards show service request, booking ref, schedule, address, amount, status chip, and next action. Pending jobs offer accept/decline/message. Confirmed jobs offer start/message/support. In-progress jobs offer mark complete/support.

## Provider Calendar

Weekly availability manager. Show rows for Monday-Sunday with available/closed chip and time window. Include day chips, start time, end time, "Save weekly window" button. Include day-off date, reason, "Add day off" button, and day-off list with remove actions. Empty day-off state included.

## Provider Earnings

Show payout total, payment count, completed count. Payment rows show provider payout, booking ref, platform fee, amount, and payment status chip. Empty state: "Payments appear after jobs".

## Component Rules

Use cards only for repeated items and selected/detail panels. Do not nest cards. Use compact rows for lists. Status chips: pending/open warning, completed/paid/resolved success green, rejected/cancelled danger, confirmed/in progress/read neutral.

Buttons: primary brand or green for main action depending on context, secondary outline for normal actions, danger red for destructive actions. Keep all text inside containers without overlap.
