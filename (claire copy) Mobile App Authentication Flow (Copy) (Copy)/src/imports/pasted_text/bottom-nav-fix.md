DESIGN SYSTEM TO FOLLOW:

Font: Poppins (Bold, SemiBold, Medium, Regular)

Green: #00BF63 (active states, primary buttons, available dates)

Bottom navigation: ALWAYS Explore | Projects | Messages | More (identical on every screen)

The "More" tab is where Profile, Settings, etc. live

Bottom navigation should be fixed at the bottom with home indicator

Text colors: Black (#000000) for headings, #777/#666 for secondary text

Background: White, light gray (#F5F5F5) for subtle backgrounds

Border radius: 10px, 12px, 50px (pill buttons)

Spacing: 20px/24px side margins

Status bar: iOS style with time 9:41

THE PROBLEM:

Home screen has correct bottom nav: Explore | Projects | Messages | More

When clicking Projects tab, either:

A second bottom nav appears (duplicate)

The bottom nav changes to different icons/labels

The bottom nav shows "Profile" instead of "More"

THE FIX:

1. REMOVE DUPLICATE BOTTOM NAVIGATION

Delete any extra bottom navigation components in:

MyProjects.tsx

ProjectDetails.tsx

BookingConfirmation.tsx

Payment.tsx

BookingReview.tsx

CancelBooking.tsx

ManageProject.tsx

TrackSkillr.tsx

ReportIssue.tsx

ChangeBookingDateTime.tsx (new screen)

Each screen should have ONLY ONE bottom navigation component

2. USE THE SAME BOTTOM NAVIGATION COMPONENT

Import and use the BottomNavigation component from the existing codebase

Do not create custom bottom navs on individual screens

The component should have:

Explore (Home icon)

Projects (Calendar icon) - active state green

Messages (MessageCircle icon)

More (MoreHorizontal icon)

3. UPDATE PROJECTS TAB TO MAINTAIN CONSISTENCY

In MyProjects.tsx, the bottom navigation should be IDENTICAL to Home screen

Icons should match:

Explore: <Home className="w-[24px] h-[24px]" />

Projects: <Calendar className="w-[24px] h-[24px]" /> (green when active)

Messages: <MessageCircle className="w-[24px] h-[24px]" />

More: <MoreHorizontal className="w-[24px] h-[24px]" />

Labels: "Explore", "Projects", "Messages", "More" (all with proper font: Poppins Medium 10px)

4. REMOVE ANY "PROFILE" TAB

The bottom navigation should NEVER show "Profile" as a tab

Profile is accessed through the "More" tab

Delete any code that tries to add a Profile tab

5. FIX ACTIVE STATE

On Projects screen, the Projects icon should be green (#00BF63)

On Home screen, the Explore icon should be green

On Messages screen (future), Messages icon should be green

On More screen, More icon should be green

6. HOME INDICATOR

All screens should have the home indicator at the bottom:

css
<div className="h-[34px] relative">
  <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
</div>
SCREENS TO CHECK/UPDATE:

CustomerHomePage.tsx - ✓ already correct

MyProjects.tsx - remove duplicate nav, ensure matches Home

ProjectDetails.tsx - use same BottomNavigation component

BookingConfirmation.tsx - use same BottomNavigation component

Payment.tsx - use same BottomNavigation component

BookingReview.tsx - use same BottomNavigation component

CancelBooking.tsx - use same BottomNavigation component

ManageProject.tsx - use same BottomNavigation component

TrackSkillr.tsx - use same BottomNavigation component

ReportIssue.tsx - use same BottomNavigation component

ChangeBookingDateTime.tsx - use same BottomNavigation component (new screen)

ADD SCREEN 11: CHANGE BOOKING DATE/TIME PAGE (new screen)

SCREEN 11: CHANGE BOOKING DATE/TIME PAGE (ChangeBookingDateTime.tsx)

Header: "Change booking date or time" with back arrow

Current booking details summary (read-only, light gray background #F5F5F5, rounded 12px, padding 16px):

Current date: [March 15, 2026]

Current time: [10:00 AM]

Select new date section:

Label: "Select new date" (Poppins SemiBold 14px)

Calendar view (current month shown with days in grid)

Available dates highlighted in green (#00BF63 with white text)

Unavailable dates grayed out (#E5E5E5)

Users can tap to select a new date

Select new time section:

Label: "Select new time" (Poppins SemiBold 14px)

Time slot options as pill buttons:

"Morning 9–11 AM" (outlined, selectable)

"Afternoon 12–3 PM" (outlined, selectable)

"Evening 4–6 PM" (outlined, selectable)

Selected time slot becomes green (#00BF63 with white text)

Info banner: "Provider must approve date/time changes" (bg #F9FAFB, text #6B7280, 12px, rounded 8px, padding 12px, center text)

Green "Request Change" button (full width, rounded 50px, py 16px, Poppins Bold 16px)

"Cancel" text link (center, Poppins Medium 14px, #777, mt 16px)

Also update SCREEN 3: MANAGE PROJECT PAGE

Ensure "Change booking date or time" is clickable and navigates to this new screen

Add chevron (>) to the right of each row to indicate tappable action

Rows should have active state (opacity change on press)

