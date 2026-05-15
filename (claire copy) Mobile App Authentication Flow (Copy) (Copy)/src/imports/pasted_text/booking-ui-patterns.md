Maintain consistent UI patterns: bottom navigation when applicable, green CTA buttons (#00BF63), white cards with subtle shadows, circular profile images, and the same typography hierarchy as the existing screens.

PAGE 1: BOOKING REVIEW PAGE
Purpose: Customer reviews their booking details before proceeding to payment.

Required elements:

Header: "Review Booking" with back arrow

Provider summary card (profile photo, name, rating "★ 4.8 (124)", "View Profile" link)

Service details section:

Service type (from dropdown selection)

Date & time selected

Location/address

Duration

Description/special instructions (if any)

Price breakdown card:

Service fee: $XX

Callout fee (if applicable): $XX

Platform fee: $XX

Promo discount (if applied): -$XX

Total: $XX (bold, larger text)

Payment method selector (shows selected method with chevron to change)

Terms agreement text: "By confirming booking, I agree to the Service Policy and Refund Policy"

Green "Confirm & Pay" button (#00BF63) at bottom

"Edit booking" text link below button

PAGE 2: PAYMENT PAGE
Purpose: Customer completes payment or confirms payment method.

Required elements:

Header: "Payment" with back arrow

Large amount display: "$XX.XX" at top

Selected payment method card with options:

For GCash/PayMaya: Show mobile number field with "Proceed to Payment" button

For Credit/Debit Card: Card number, Expiry, CVV fields with "Pay Now" button

For Cash: "Cash on service" confirmation card with payment instructions

If card selected: Include 3D Secure iframe note/placeholder

"Cancel" button (text link or outlined)

Green "Confirm Payment" or "Proceed" button (varies by method)

PAGE 3: BOOKING CONFIRMATION PAGE
Purpose: Success confirmation after booking is created.

Required elements:

Large success checkmark animation (can be represented as green circle with check icon ✓)

"Booking Confirmed!" heading

Booking reference number: "#SERV-123456"

Provider details card (photo, name, rating)

Service summary: Service type, Date & time, Location

Status indicator: "Waiting for provider acceptance" with estimated response time (15 mins)

Three action buttons (stacked or horizontal depending on space):

"View Booking Details" (outlined)

"Book Another Service" (outlined)

"Go to Dashboard" (green filled)

Bottom navigation (if this is within main app flow)

PAGE 4: MY BOOKINGS PAGE
Purpose: List of all customer bookings.

Required elements:

Header: "My Bookings"

Tab bar with 3 tabs: "Upcoming" (active), "Past", "Cancelled"

For Upcoming tab:

List of booking cards, each containing:

Booking reference (small, gray)

Provider photo, name, and rating

Service type

Date & time

Status badge (e.g., "Pending", "Accepted", "In Progress") with appropriate color coding

Action button (e.g., "Track", "Message", "View Details")

For Past tab:

Similar cards but with completed status and "Review" or "Book Again" buttons

For Cancelled tab:

Similar cards with cancelled status and refund info (if applicable)

Empty state: Illustration and message "No bookings yet" with "Browse Services" green button

Bottom navigation (Home, Bookings active, Messages, Profile)

PAGE 5: BOOKING DETAILS PAGE
Purpose: Detailed view of a specific booking.

Required elements:

Header: "Booking Details" with back arrow and menu (3 dots)

Booking reference number: "#SERV-123456"

Large status badge (e.g., "Confirmed", "In Progress")

Status timeline (vertical steps):

✓ Booked (completed)

○ Provider accepted (current/active)

○ On the way

○ Arrived

○ Service started

○ Service completed

○ Payment completed

○ Review submitted

Provider card with photo, name, rating, and contact buttons (Message, Call)

Service details section:

Date & time

Location with map thumbnail (tap to expand)

Service description

Photos uploaded (if any, as thumbnails)

Price breakdown (same as review page)

Payment method

Action buttons based on status:

If en route: Green "Track Provider" button

Always: "Message Provider" (outlined)

If applicable: "Modify Booking", "Cancel Booking" (text links)

If completed: "Leave Review", "Download Receipt", "Report Issue"

Chat messages preview/link to conversation (if any)

PAGE 6: TRACK PROVIDER PAGE
Purpose: Live tracking of provider location.

Required elements:

Header: "Track Provider" with back arrow

Full-screen map view (dominant element)

Map elements:

Provider marker (moving/updated)

Customer location marker

Route line between provider and customer

Bottom ETA card (slides up):

Provider photo, name, rating

ETA: "Arriving in 12 min" (updating)

Distance remaining: "2.3 km away"

Two buttons: "Call Provider" (green) and "Message Provider" (outlined)

Small refresh indicator/last updated timestamp

PAGE 7: MODIFY BOOKING PAGE
Purpose: Request changes to an existing booking.

Required elements:

Header: "Modify Booking" with back arrow

Current booking details summary (read-only, gray background):

Date & time, Location, Description

"What would you like to change?" section:

Option 1: "Change date/time" (radio/checkbox) with date picker and time selector

Option 2: "Change location" with address field and map

Option 3: "Add/Edit description" with textarea

Option 4: "Add photos" with upload area (up to 5)

New values input fields (appear when options selected)

Notice: "Provider must approve changes" (info banner)

Green "Request Modification" button

"Cancel" text link

PAGE 8: CANCEL BOOKING PAGE
Purpose: Cancel a booking with reason and confirmation.

Required elements:

Header: "Cancel Booking" with back arrow

Booking summary card (small: service, date, provider)

Cancellation policy banner showing:

Time until booking

Cancellation fee (if applicable)

Refund amount

Cancellation reason dropdown with options:

Changed my mind

Found another provider

Emergency

Wrong booking

Provider issue

Other

Additional details textarea (optional)

Refund information summary (how much will be refunded)

Red/outlined "Confirm Cancellation" button

"Go Back" text link

Consider adding a "Keep booking" suggestion or retention offer

PAGE 9: DISPUTE/REPORT ISSUE PAGE
Purpose: Report a problem with a completed or in-progress booking.

Required elements:

Header: "Report an Issue" with back arrow

Booking reference (pre-filled/displayed)

Issue type dropdown with options:

Service not completed

Poor quality work

Damage/Loss

Safety concern

Provider misconduct

Overcharge

Other

Issue description textarea (required)

Evidence upload area: "Add photos or videos" (up to 5)

Desired resolution section:

Radio buttons: "Full refund", "Partial refund", "Apology", "Provider warning", "Other"

Green "Submit Dispute" button

Note about review time (e.g., "We'll respond within 48 hours")