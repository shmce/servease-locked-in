DESIGN SYSTEM TO FOLLOW:

Font: Poppins (as seen in CustomerHomePage.tsx) - Bold, SemiBold, Medium, Regular

Green: #00BF63 (primary buttons, active states, checkmarks)

Text colors: Black (#000000) for headings, #777/#666 for secondary text

Background: White, light gray (#F5F5F5) for subtle backgrounds

Border radius: 10px, 12px, 50px (pill buttons)

Bottom navigation: ALWAYS Explore | Projects | Messages | More (never changes, More tab leads to profile)

Spacing: 20px/24px side margins

Status bar: iOS style with time 9:41

FIX THE FOLLOWING SCREENS to match prototype exactly:

SCREEN 1: MY PROJECTS PAGE

Header: "Projects" (no filter icon unless specified)

Tabs: TWO tabs only - "In Progress" and "Completed" (NOT three tabs)

Project cards should have:

Service title (e.g., "Indoor Cleaning")

Status badge: "Processing" (in orange/gray)

Schedule: "Scheduled for Wed, 8 Mar"

Description: "One-Time Cleaning Service"

Provider name with checkmark ✅ (green check)

Button: "Mark as completed" (for In Progress) or appropriate action

Bottom navigation: Explore | Projects | Messages | More (Projects active)

SCREEN 2: PROJECT DETAILS PAGE

Header: "Project Information" with address line below

Project ID: "#7890128" format

Info line: "The Skillr will start - Wednesday, March 07 2023 @ 09:00AM"

Service type: "One-Time Cleaning Service"

Two buttons side by side: [Manage project] and [Add to calendar] (outlined style)

Status timeline: Horizontal with 4 steps - Booked, On the way, Started, Completed

Completed steps have green checkmarks

Current step highlighted

Note: "You booked this project on Monday March 05, 2023 for Wednesday March 07 2023"

Provider section: [Provider name], ★ [rating] ([reviews]), "View Profile" link

Add "Service Details" expandable section with:

Indoor Cleaning

Date: Wed, March 7

Start time: 9:00 - 11:00 AM

Skill: [Provider name]

You selected: [X] Skill's | [X] hours

Additional Service: [if any]

Size of home: [range]

Address: [full address]

Price breakdown section:

Sub Total: ₱[amount]

Processing fee: ₱[amount]

Promo code (X% OFF): -₱[amount]

Booking Cost: ₱[total] (bold)

Note: "You won't be charged until the job is completed."

SCREEN 3: MANAGE PROJECT PAGE

Header: "Manage Project"

Subtext: "Make changes to your project..."

Two tappable rows with chevrons (>) that are clickable:

"Cancel Booking" (leads to Cancel Booking page)

"Change booking date or time" (leads to modification page)

Both rows should have visual feedback (active state)

SCREEN 4: CANCEL BOOKING PAGE

Header: "Cancel Booking"

DO NOT include "I'M SORRY" - remove completely

Text: "Please let us know why you're canceling your booking. We would really appreciate your feedback."

Radio button options:

Don't need the service anymore

Not available at this time

Found a better rate elsewhere

Placed the request by mistake

Other

Two buttons side by side:

"Don't Cancel" (outlined, black text)

"Cancel Booking" (red or green? use red for destructive action)

SCREEN 5: BOOKING REVIEW PAGE

Should match Service Details screenshot with:

Service title at top

Complete service details grid

Selected options (Skillr's, hours, add-ons)

Size of home

Address

Complete price breakdown

"You won't be charged until the job is completed" notice

SCREEN 6: PAYMENT PAGE

Header: "Reserve payment"

Note: "Pay nothing for this job today. You will be charged until after the job is completed."

Large amount: ₱[total]

Payment method options with proper fields per method

"Cancel" link/button

SCREEN 7: BOOKING CONFIRMATION PAGE

"Your project has been booked!" heading

Project ID

Provider info

Status timeline

Two buttons: "Manage project" and "Add to calendar"

SCREEN 8: TRACK SKILLR PAGE

Map view placeholder

Bottom card with provider info, ETA, Call/Message buttons

SCREEN 9: REPORT ISSUE/DISPUTE PAGE

Header: "Report an Issue"

Project ID pre-filled

Issue type dropdown

Description textarea

Upload evidence

Desired resolution options

"Submit" button