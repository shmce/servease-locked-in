Create high-fidelity UI screens for a service provider dashboard web app called "Servease".

Match a modern SaaS dashboard style:
- Clean layout, soft shadows, rounded cards
- Green primary color (#16a34a)
- Consistent with existing dashboard UI (cards, typography, spacing)
- Desktop layout (1440px)
- Include sidebar navigation (Dashboard, Requests, Calendar, Earnings, Profile)

--------------------------------------------------

PAGE 1: REQUESTS PAGE

Header:
- Title: "Booking Requests"
- Search bar (Search requests...)
- Filter button (date, service type)

Tabs:
- New Requests (count badge)
- Pending
- Accepted
- Declined

Request Cards (list layout):
Each card contains:
- Customer photo + name
- Service type
- Proposed date & time
- Location
- Initial price
- Status badge

Actions (right side):
- Accept (primary button)
- Reject (secondary)
- Counter Offer (outlined button)

--------------------------------------------------

PAGE 2: BOOKING DETAILS PAGE (REQUEST STATE)

Header:
- Booking reference number
- Status badge (e.g., "Pending")

Progress timeline:
- Requested → Accepted → In Progress → Completed

Customer Card:
- Photo
- Name
- Rating
- Phone (masked)
- Call + Message buttons

Service Details:
- Service type
- Date & time
- Location (map preview + address)
- Description
- Photos
- Special instructions
- Estimated duration

Pricing Breakdown:
- Service fee
- Platform fee (10%)
- Provider earnings

Action Buttons (important):
- Accept
- Reject
- Counter Offer (highlight this)

--------------------------------------------------

PAGE 3: COUNTER OFFER (MODAL OR PAGE)

Design as modal overlay (preferred) or separate page.

Header:
- "Send Counter Offer"

Show original booking details (readonly):
- Service
- Original date/time
- Original price

Editable Fields:
- Proposed date & time (datetime picker)
- Proposed price (input)
- Estimated duration
- Reason for counter offer (textarea)
- Validity period:
  • 24 hours
  • 48 hours
  • 72 hours (radio buttons or pills)

Buttons:
- Send Counter Offer (primary)
- Cancel (secondary)
