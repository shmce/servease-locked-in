Create two high-fidelity dashboard pages for a service provider web app called "Servease".

Match the design system of a modern SaaS dashboard:
- Clean UI, soft shadows, rounded cards
- Green primary color (#16a34a), with blue/purple/orange accents
- Same style as existing dashboard (cards, typography, spacing)
- Desktop layout (1440px)
- Consistent with sidebar + top navbar layout

--------------------------------------------------

PAGE 1: MY BOOKINGS

Header:
- Title: "My Bookings"
- Search bar (placeholder: "Search bookings...")
- Filter button (icon + label)

Tabs (top):
- Upcoming (with count badge)
- In Progress (with count badge)
- Completed
- Cancelled

Booking List (card-based layout):
Each booking card contains:
- Reference number (small text)
- Customer photo + name
- Service type
- Date & time
- Location (with distance if upcoming)
- Status badge (color-coded)
- Amount (bold)

Quick Actions (right side of card, varies by status):
- Upcoming: "View Details", "Get Directions"
- In Progress: "Continue", "Mark Complete"
- Completed: "View Summary"
- Cancelled: "View Details"

Filter Modal (when clicking filter):
- Date range picker
- Service type dropdown
- Status filter
- Apply button

--------------------------------------------------

PAGE 2: BOOKING DETAILS

Header:
- Booking reference number
- Large status badge

Progress Timeline (horizontal or vertical):
- Requested → Accepted → On the Way → Arrived → In Progress → Completed

SECTION: CUSTOMER INFO (card)
- Profile photo
- Name
- Rating (stars)
- Phone number (masked until accepted)
- Buttons:
  • Call
  • Message

SECTION: SERVICE DETAILS (card)
- Service type
- Date & time
- Location:
  • Map preview
  • Address text
- Description
- Uploaded photos (grid)
- Special instructions
- Estimated duration
- Actual duration (if ongoing/completed)

SECTION: PRICING BREAKDOWN (card)
- Service fee
- Additional charges
- Platform fee (10%)
- Your earnings (highlighted)

SECTION: ACTION BUTTONS (dynamic based on status)

Upcoming:
- Get Directions
- Start Trip
- Cancel Booking

Arrived:
- I've Arrived

In Progress:
- Start Service
- Upload Progress Photos
- Add Additional Charges
- Complete Service

Other:
- Request Reschedule
- Report Issue

SECTION: CHAT / MESSAGES
- Conversation UI (chat bubbles)
- Input field + send button
