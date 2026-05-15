# ServEase Booking Screens

This document provides an overview of the 9 comprehensive booking screens created for the ServEase mobile application.

## Overview

All screens follow the established ServEase design system:
- **Brand Color**: #00BF63 (Green)
- **Mobile Viewport**: 393×852px (iPhone-style)
- **Typography**: Inter font family with strict hierarchy
- **Components**: Reusable BookingCard, ProviderCard, and StickyFooterButton
- **Navigation**: React Router with proper routing structure

## Screen Index

### 1. **Booking Review** (`/customer/booking-review/:id`)
**Purpose**: Customer reviews booking details before payment

**Features**:
- Provider summary card with profile, rating, and "View Profile" link
- Detailed service information (type, date/time, location, duration, description)
- Price breakdown with itemized fees and discounts
- Payment method selector
- Terms agreement with clickable policy links
- Green "Confirm & Pay" sticky footer button

**Route**: `/customer/booking-review/:id`

---

### 2. **Payment** (`/customer/payment/:bookingId`)
**Purpose**: Complete payment or confirm payment method

**Features**:
- Large amount display at top
- Four payment method options:
  - **GCash**: Mobile number field + redirect notice
  - **PayMaya**: Mobile number field + redirect notice
  - **Credit/Debit Card**: Card number, expiry, CVV fields + 3D Secure notice
  - **Cash on Service**: Instructions with checkmarks
- Visual selection with green highlighting
- Sticky "Proceed to Payment" button

**Route**: `/customer/payment/:bookingId`

---

### 3. **Booking Confirmation** (`/customer/booking-confirmation/:bookingId`)
**Purpose**: Success confirmation after booking creation

**Features**:
- Large green checkmark animation
- "Booking Confirmed!" heading
- Booking reference number display
- Provider card
- Service summary (type, date/time, location)
- Status indicator with estimated response time
- Three action buttons:
  - View Booking Details (green filled)
  - Book Another Service (green outlined)
  - Go to My Bookings (gray outlined)

**Route**: `/customer/booking-confirmation/:bookingId`

---

### 4. **My Bookings** (`/customer/bookings`)
**Purpose**: List all customer bookings with tab navigation

**Features**:
- Three tabs: Upcoming, Past, Cancelled
- Booking cards with:
  - Booking reference number
  - Provider photo, name, rating
  - Service type, date, time
  - Color-coded status badges (Pending, Accepted, In Progress, Completed, Cancelled)
  - Context-appropriate action buttons
- Empty state with "Browse Services" CTA
- Bottom navigation (Home, Bookings, Messages, Profile)

**Route**: `/customer/bookings`

---

### 5. **Booking Details** (`/customer/booking/:id`)
**Purpose**: Detailed view of a specific booking

**Features**:
- Booking reference and large status badge
- 8-step status timeline with checkmarks:
  - Booked
  - Provider accepted
  - On the way
  - Arrived
  - Service started
  - Service completed
  - Payment completed
  - Review submitted
- Provider card with contact buttons (Message, Call)
- Service details section
- Payment summary
- Action buttons: Track Provider, Modify Booking, Cancel Booking
- Download Receipt and Report Issue links

**Route**: `/customer/booking/:id`

---

### 6. **Track Provider** (`/customer/booking/:id/track`)
**Purpose**: Live tracking of provider location with map

**Features**:
- Full-screen interactive map (Leaflet/OpenStreetMap)
- Custom markers:
  - Green car icon for provider
  - Red pin for customer location
- Dashed green route line
- Bottom slide-up card with:
  - Provider photo, name, rating
  - Real-time ETA (updates every 5 seconds)
  - Distance remaining
  - "On the way" status indicator
  - Call and Message buttons
  - Last updated timestamp

**Route**: `/customer/booking/:id/track`

---

### 7. **Modify Booking** (`/customer/booking/:id/modify`)
**Purpose**: Request changes to existing booking

**Features**:
- Current booking details (read-only, gray background)
- Expandable modification options:
  - **Change date/time**: Date picker + time input
  - **Change location**: Address textarea
  - **Add/Edit description**: Textarea (4 rows)
  - **Add photos**: Upload grid (up to 5)
- Blue info banner: "Provider must approve changes"
- Green "Request Modification" sticky button (disabled until option selected)
- Cancel link

**Route**: `/customer/booking/:id/modify`

---

### 8. **Cancel Booking** (`/customer/booking/:id/cancel`)
**Purpose**: Cancel booking with reason and confirmation

**Features**:
- Red header for emphasis
- Booking summary card
- Yellow cancellation policy banner showing:
  - Time until booking
  - Cancellation fee
  - Refund amount
- Reason dropdown with 6 preset options
- Additional details textarea (optional)
- Refund information card (5-7 business days)
- Green "Keep booking" suggestion box with "Modify Booking Instead" button
- Red "Confirm Cancellation" button (requires reason)
- "Go Back" button

**Route**: `/customer/booking/:id/cancel`

---

### 9. **Dispute/Report Issue** (`/customer/booking/:id/dispute`)
**Purpose**: Report problem with completed or in-progress booking

**Features**:
- Red header for emphasis
- Booking reference display
- Issue type dropdown (7 options):
  - Service not completed
  - Poor quality work
  - Damage/Loss
  - Safety concern
  - Provider misconduct
  - Overcharge
  - Other
- Issue description textarea (minimum 20 characters, 6 rows)
- Evidence upload area (photos/videos, up to 5 files)
  - Grid display with remove buttons
  - Upload progress counter
- Desired resolution radio buttons:
  - Full refund
  - Partial refund
  - Apology
  - Provider warning
  - Other
- Blue info notice: "We'll respond within 48 hours"
- Green "Submit Dispute" sticky button (validates required fields)

**Route**: `/customer/booking/:id/dispute`

---

## Reusable Components

### BookingCard
**Location**: `/src/app/components/BookingCard.tsx`

**Props**:
- `bookingId`: string
- `providerName`: string
- `providerPhoto`: string (URL)
- `rating`: number
- `reviewCount`: number
- `serviceType`: string
- `date`: string
- `time`: string
- `status`: "pending" | "accepted" | "in-progress" | "completed" | "cancelled"
- `onCardClick`: () => void
- `actionLabel?`: string (default: "View Details")

**Features**:
- Color-coded status badges
- Provider photo and rating
- Service details
- Click-to-navigate

---

### ProviderCard
**Location**: `/src/app/components/ProviderCard.tsx`

**Props**:
- `name`: string
- `photo`: string (URL)
- `rating`: number
- `reviewCount`: number
- `showActions?`: boolean
- `onViewProfile?`: () => void
- `onMessage?`: () => void
- `onCall?`: () => void

**Features**:
- Circular provider photo
- Star rating display
- Optional action buttons (Message, Call)
- Optional "View Profile" link

---

### StickyFooterButton
**Location**: `/src/app/components/StickyFooterButton.tsx`

**Props**:
- `label`: string
- `onClick`: () => void
- `disabled?`: boolean

**Features**:
- Keyboard-aware positioning
- Green brand color
- iOS home indicator
- Active press animation
- Disabled state styling

---

## Navigation Flow

```
Booking Flow:
1. Service Detail → Booking Review
2. Booking Review → Payment
3. Payment → Booking Confirmation
4. Booking Confirmation → Booking Details OR My Bookings

My Bookings Flow:
1. My Bookings (tabs: Upcoming/Past/Cancelled)
2. Select Booking → Booking Details
3. Booking Details → Track/Modify/Cancel/Dispute

Actions from Booking Details:
- Track Provider (live map)
- Modify Booking (request changes)
- Cancel Booking (with refund info)
- Report Issue (dispute)
```

---

## Design Patterns

### Typography
- **Page Headers**: 18px/600/SemiBold/#111827
- **Main Headings**: 28px/700/Bold/#111827 (Confirmation page)
- **Section Headings**: 16px/600/SemiBold/#111827
- **Body Text**: 14px/400/#6B7280
- **Labels**: 14px/500/#374151
- **Helper Text**: 12px/400/#9CA3AF
- **Buttons**: 16px/600/white

### Colors
- **Primary Green**: #00BF63
- **Success**: #D1FAE5 (bg), #00BF63 (text/icon)
- **Warning**: #FEF3C7 (bg), #92400E (text)
- **Error**: #EF4444
- **Neutral Gray**: #F9FAFB (bg), #6B7280 (text)

### Spacing
- **Container Padding**: 24px horizontal
- **Section Spacing**: 16px between cards
- **Card Padding**: 16px
- **Button Height**: 50-56px with 18px vertical padding

### Interactions
- **Card Press**: scale(0.98)
- **Button Press**: scale(0.97)
- **Active States**: All interactive elements
- **Transitions**: 150-200ms ease-out

---

## Demo Navigation

Visit `/booking-demo` to see a navigation screen with links to all 9 booking screens.

---

## Mock Data

All screens use mock data for demonstration purposes:
- Provider: Maria Santos (4.8★, 124 reviews)
- Service: House Cleaning
- Date: March 15, 2026
- Price: ₱900 total
- Booking ID: #SERV-123456
- Location: Manila, Philippines

Map coordinates use real Manila locations for realistic tracking visualization.

---

## Dependencies

- **react-router**: Navigation and routing
- **lucide-react**: Icon library
- **react-leaflet**: Map component (Track Provider)
- **leaflet**: Map library
- **motion**: Animations (potential future use)

---

## Accessibility

- Proper semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Focus states on interactive elements
- Color contrast ratios meet WCAG AA standards
- Touch targets minimum 44×44px

---

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live status changes
2. **Notifications**: Push notifications for booking updates
3. **Chat**: In-app messaging with providers
4. **Photo Gallery**: Full-screen image viewer
5. **Calendar Integration**: Add to device calendar
6. **Favorites**: Save preferred providers
7. **Ratings & Reviews**: Post-service rating flow
8. **Payment Gateway**: Actual GCash/PayMaya integration
9. **Geolocation**: Auto-detect user location
10. **Offline Support**: Cache booking data

---

## Testing Routes

```
/customer/booking-review/1
/customer/payment/1
/customer/booking-confirmation/1
/customer/bookings
/customer/booking/1
/customer/booking/1/track
/customer/booking/1/modify
/customer/booking/1/cancel
/customer/booking/1/dispute
/booking-demo (index page)
```
