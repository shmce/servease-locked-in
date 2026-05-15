SCREEN 1: BOOKING REVIEW PAGE

Connect from: After service options selection

Header: "Review booking" with back arrow

Provider info section: [Provider name], [Rating] with "View Profile >" link

Service details section: [Service type], [Date], [Time], [Duration], [Address]

Selected options section: [Number of Skillrs], [Hours], [Add-ons]

Price breakdown section (editable line items):

Sub Total: [amount]

Processing fee: [amount]

Promo code: [code/discount]

Booking Cost: [total]

Note: "You won't be charged until the job is completed."

Green "Confirm & Pay" button

"Edit booking" text link

SCREEN 2: PAYMENT PAGE

Header: "Reserve payment"

Info note: "Pay nothing for this job today. You will be charged until after the job is completed."

Saved payment methods section (cards with [last 4 digits] and [cardholder name])

"ADD NEW CARD" button

Payment option: "Credit or Debit Card" with chevron

"Have a voucher or promo code?" expandable section with [code] field

Green confirm button

SCREEN 3: PROJECT CONFIRMATION PAGE

Success checkmark icon

"Your project has been booked!" heading

Project ID: [#project-id] (placeholder format)

Provider card with "View Profile >" link

Service summary: [Date], [Time], [Location]

Status timeline with 4 steps: Booked, On the way, Started, Completed (first step active)

Note: "You booked this project on [booking-date] for [service-date]"

Two buttons side by side: "Manage project" and "Add to calendar"

Bottom navigation with Projects active

SCREEN 4: MY PROJECTS PAGE

Header: "Projects" with Filter ▼ dropdown

Two tabs: "In Progress" (active) and "Completed"

Project cards (repeatable component):

Title: [service type]

Subtitle: "Scheduled for [date]"

Description: [service frequency]

Provider: [provider name]

Button: [action text] (varies by status)

Bottom navigation with Projects active

Empty state component for when no projects

SCREEN 5: PROJECT DETAILS PAGE

Header: "Project Information" with [address]

Project ID: [#project-id]

Info line: "The Skillr will start - [start-date] @ [start-time]"

Service type: [service type]

Two buttons: "Manage project" and "Add to calendar"

Status timeline with 4 steps (completed steps have green checkmarks)

"You booked this project on [booking-date] for [service-date]"

Provider section with [name], [rating], "View Profile >" link

Bottom navigation

SCREEN 6: TRACK SKILLR PAGE

Header: "Track Skillr" with back arrow

Map view placeholder

Bottom card with:

Provider: [name], [rating]

ETA: "[minutes] min"

Two buttons: "Call" and "Message"

SCREEN 7: MANAGE PROJECT PAGE

Header: "Manage Project"

"Make changes to your project..."

Two options (tappable rows):

"Cancel Booking" (with chevron)

"Change booking date or time" (with chevron)

SCREEN 8: CANCEL PROJECT PAGE

Header: "Cancel Booking"

"I'M SORRY" (in caps)

Description: "Please let us know why you're canceling your booking. We would really appreciate your feedback."

Radio button group with options (editable list)

Two buttons side by side: "Don't Cancel" and "Cancel Booking"

SCREEN 9: REPORT ISSUE/DISPUTE PAGE

Header: "Report an Issue"

Project ID: [#project-id] (pre-filled placeholder)

Issue type dropdown with placeholder options

Description textarea [describe the issue...]

"Upload evidence" button/area

Desired resolution section with radio options

"Submit" button

CONNECTION NOTES:

All screens must be in the main customer flow branch (not booking-demo)

Connect screens in logical order: Booking Review → Payment → Project Confirmation → My Projects → Project Details → [Track/Manage/Cancel/Report]

Use existing component library from main branch

All text should be editable layers/components, not flattened text