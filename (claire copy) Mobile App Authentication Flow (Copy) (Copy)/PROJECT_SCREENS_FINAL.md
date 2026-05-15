# ServEase Project Flow - Complete Documentation

## Overview

9 mobile screens for ServEase following exact design patterns from the existing UI. All screens use:

- **Terminology**: "Projects" (not Bookings), "Skillr" (not Provider)
- **Brand Color**: #00BF63
- **Mobile Size**: 393×852px
- **Typography**: Inter font family
- **Bottom Navigation**: Explore | Projects | Messages | More

---

## Screen Index

### 1. Project Review (`/customer/project-review/:id`)

**Header**: "Review booking" with back arrow

**Sections**:
- Skillr info: Photo, name, rating + "View Profile >" link
- Service details: Type, Date, Time, Duration, Address
- Selected options: Number of Skillrs, Hours, Add-ons
- Price breakdown: Sub Total, Processing fee, Promo code, Booking Cost
- Notice: "You won't be charged until the job is completed."

**Actions**:
- Green "Confirm & Pay" sticky button
- "Edit booking" text link

---

### 2. Reserve Payment (`/customer/payment/:projectId`)

**Header**: "Reserve payment" with back arrow

**Sections**:
- Info note: "Pay nothing for this job today..."
- Saved payment methods: Radio buttons with card details
- "ADD NEW CARD" button (outlined green)
- Payment option: "Credit or Debit Card" with chevron
- Expandable promo code section

**Actions**:
- Green "Confirm" sticky button

---

### 3. Project Confirmation (`/customer/project-confirmation/:projectId`)

**Elements**:
- Success checkmark icon (green circle)
- "Your project has been booked!" heading
- Project ID display (e.g., #PRJ-123456)
- Skillr card with "View Profile >" link
- Service summary: Date, Time, Location
- **HORIZONTAL** status timeline (4 steps: Booked, On the way, Started, Completed)
- Note: "You booked this project on [date] for [date]"

**Actions**:
- Two side-by-side buttons: "Manage project" (green) + "Add to calendar" (outlined)
- Bottom navigation (Projects active)

---

### 4. My Projects (`/customer/projects`)

**Header**: "Projects" with "Filter ▼" dropdown

**Tabs**: "In Progress" (active) | "Completed"

**Project Cards** (repeatable):
- Title: [service type]
- Subtitle: "Scheduled for [date]"
- Description: [frequency]
- Skillr name
- Action button (varies by status)

**Bottom Navigation**: Explore | **Projects** (active) | Messages | More

**Empty State**: Icon, message, "Browse Services" button

---

### 5. Project Details (`/customer/project/:id`)

**Header**: "Project Information" with address subtitle

**Sections**:
- Project ID
- Start info: "The Skillr will start - [date] @ [time]"
- Service type
- **HORIZONTAL** status timeline (with green checkmarks)
- Booking note
- Skillr section with "View Profile >" link

**Actions**:
- Two side-by-side buttons: "Manage project" + "Add to calendar"
- Bottom navigation

---

### 6. Track Skillr (`/customer/project/:id/track`)

**Header**: "Track Skillr" with back arrow

**Map View**:
- Full-screen interactive map (Leaflet)
- Green car marker for Skillr
- Red pin marker for customer
- Dashed green route line

**Bottom Card**:
- Skillr photo, name, rating
- ETA display (e.g., "ETA: 12 min")
- Two side-by-side buttons: "Call" (green) + "Message" (outlined)

---

### 7. Manage Project (`/customer/project/:id/manage`)

**Header**: "Manage Project" with back arrow

**Description**: "Make changes to your project..."

**Options** (tappable rows with chevrons):
1. "Cancel Booking"
2. "Change booking date or time"

---

### 8. Cancel Project (`/customer/project/:id/cancel`)

**Header**: "Cancel Booking" with back arrow

**Content**:
- **"I'M SORRY"** heading (all caps, bold, 24px, centered)
- Description: "Please let us know why you're canceling your booking. We would really appreciate your feedback."
- Radio button group (6 options):
  - Found another service
  - Changed my mind
  - Schedule conflict
  - Too expensive
  - Skillr not responding
  - Other

**Actions**:
- Two side-by-side buttons: "Don't Cancel" (outlined green) + "Cancel Booking" (red)

---

### 9. Report Issue (`/customer/project/:id/report-issue`)

**Header**: "Report an Issue" with back arrow

**Form Fields**:
1. **Project ID**: Pre-filled, disabled (e.g., #PRJ-123456)
2. **Issue type**: Dropdown with 7 options
3. **Description**: Textarea ("describe the issue...")
4. **Upload evidence**: Upload button/area
5. **Desired resolution**: Radio buttons (5 options)

**Actions**:
- Green "Submit" sticky button (disabled until form complete)

---

## Design Patterns

### Status Timeline (HORIZONTAL)
- 4 steps in a row: Booked → On the way → Started → Completed
- Completed steps: Green circle with white checkmark
- Incomplete steps: Gray circle outline
- Connected by horizontal line (green for completed, gray for incomplete)

### Buttons
- **Side-by-side**: Two equal-width buttons in a row
- **Primary**: Green background (#00BF63), white text
- **Secondary**: Green border (2px), green text, white background
- **Destructive**: Red background (#EF4444), white text

### Links
- Format: "View Profile >" with chevron icon
- Color: #00BF63
- Font: 14px/600/SemiBold

### Cards
- White background
- Minimal borders (#F2F2F2)
- Subtle dividers between sections
- 12px border radius
- Subtle shadow: 0 2px 8px rgba(0,0,0,0.06)

### Bottom Navigation
- 4 items: Explore | Projects | Messages | More
- Active item: Green icon + semibold text
- Inactive: Gray (#9CA3AF)
- Icons: Search, FolderKanban, MessageCircle, Menu (lucide-react)

---

## Component Library

### BottomNavigation
Location: `/src/app/components/BottomNavigation.tsx`

Always shows: Explore | Projects | Messages | More
Active state based on current route

### StatusTimeline
Location: `/src/app/components/StatusTimeline.tsx`

Props:
```typescript
steps: { label: string; completed: boolean }[]
```

Renders horizontal timeline with checkmarks

### ProjectCard
Location: `/src/app/components/ProjectCard.tsx`

Props:
- serviceType, scheduledDate, frequency
- skillrName, actionLabel
- onCardClick, onActionClick

### ProviderCard
Reusable component (kept from original):
- Shows Skillr photo, name, rating
- Optional "View Profile >" link
- Optional Call/Message actions

### StickyFooterButton
Existing component:
- Green button with iOS home indicator
- Keyboard-aware positioning

---

## Navigation Flow

```
Service Selection
  ↓
Project Review (/customer/project-review/:id)
  ↓
Reserve Payment (/customer/payment/:id)
  ↓
Project Confirmation (/customer/project-confirmation/:id)
  ↓
[Navigate to Projects or Project Details]

My Projects (/customer/projects)
  ↓
Project Details (/customer/project/:id)
  ├→ Manage Project (/customer/project/:id/manage)
  │   ├→ Cancel Project (/customer/project/:id/cancel)
  │   └→ Change Date/Time
  ├→ Track Skillr (/customer/project/:id/track)
  └→ Report Issue (/customer/project/:id/report-issue)
```

---

## Route Summary

```
/customer/project-review/:id          → Project Review
/customer/payment/:projectId          → Reserve Payment
/customer/project-confirmation/:id    → Project Confirmation
/customer/projects                    → My Projects
/customer/project/:id                 → Project Details
/customer/project/:id/track           → Track Skillr
/customer/project/:id/manage          → Manage Project
/customer/project/:id/cancel          → Cancel Project
/customer/project/:id/report-issue    → Report Issue
/booking-demo                         → Demo Index
```

---

## Typography Standards

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Page Headers | 18px | 600 | #111827 |
| Section Headings | 14px | 600 | #111827 |
| Main Headings | 24px | 700 | #111827 |
| Body Text | 14px | 400 | #6B7280 |
| Labels | 14px | 500 | #374151 |
| Helper Text | 12px | 400 | #9CA3AF |
| Button Text | 14px | 600 | white or #00BF63 |
| Links | 14px | 600 | #00BF63 |

---

## Color Palette

- **Primary Green**: #00BF63
- **Success Background**: #F0FDF4 (light green)
- **Success Border**: #D1FAE5
- **Error**: #EF4444
- **Background**: #FFFFFF (white)
- **Subtle Background**: #F9FAFB
- **Border**: #F2F2F2 or #E5E7EB
- **Text Primary**: #111827
- **Text Secondary**: #6B7280
- **Text Tertiary**: #9CA3AF

---

## Key Differences from Original Design

### Updated Terminology
- ❌ Booking → ✅ Project
- ❌ Provider → ✅ Skillr
- ❌ My Bookings → ✅ My Projects
- ❌ Booking Review → ✅ Project Review

### Updated Components
- ❌ Vertical timeline → ✅ Horizontal timeline
- ❌ Single buttons → ✅ Side-by-side buttons
- ❌ Bottom nav: Home/Bookings/Messages/Profile → ✅ Explore/Projects/Messages/More

### Simplified Screens
- ❌ Complex cancel flow → ✅ "I'M SORRY" with simple radio buttons
- ❌ Heavy cards → ✅ Minimal borders and subtle dividers
- ❌ "View Profile" button → ✅ "View Profile >" link with chevron

---

## Testing

Visit `/booking-demo` to see all 9 screens with navigation links.

Each screen is fully functional with:
- ✅ Proper routing
- ✅ Mock data
- ✅ Interactive elements
- ✅ Correct terminology
- ✅ Design patterns from reference
- ✅ Responsive layouts
- ✅ iOS home indicator

---

## Dependencies

- react-router: Navigation
- lucide-react: Icons
- react-leaflet + leaflet: Maps (Track Skillr)
- Inter font family: Typography

---

## Future Enhancements

1. Real-time ETA updates via WebSocket
2. Actual payment gateway integration
3. Photo gallery for evidence upload
4. Push notifications for project updates
5. In-app messaging with Skillrs
6. Calendar API integration
7. Review and rating system
8. Favorite Skillrs feature
9. Project history and analytics
10. Offline mode support
