Create the following 8 screens as editable components with [bracketed placeholders]. Follow the exact styling from the provided code files:
SCREEN 1: BOOKING REVIEW PAGE
* Header: "Review booking" with back arrow (Inter SemiBold 18px)
* Provider card: [profile photo], [name], "★ [rating]" (Inter 14px #6B7280), "View Profile >" link (Inter SemiBold 14px #00BF63)
* Service details section:
    * "Service details" heading (Inter SemiBold 14px #111827)
    * Grid: Service type, Date, Time, Duration, Address (Inter 14px #6B7280 / #111827)
* Selected options section:
    * "Selected options" heading
    * Number of Skillrs, Hours, Add-ons (if any)
* Price breakdown:
    * Sub Total: [amount]
    * Processing fee: [amount]
    * Promo code: [code/discount] (if applicable, in green)
    * Booking Cost: [total] (Inter Bold 18px)
* Notice card: "You won't be charged until the job is completed." (bg #F9FAFB, text #6B7280, 12px)
* "Edit booking" text link (Inter SemiBold 14px #6B7280)
* StickyFooterButton: "Confirm & Pay" (green) → navigates to Payment
SCREEN 2: PAYMENT PAGE
* Header: "Reserve payment" with back arrow
* Large amount display: ₱[total] (Inter Bold 28px #111827) with note: "Pay nothing for this job today. You will be charged until after the job is completed." (Inter 12px #6B7280)
* Payment method sections (show/hide based on selection): FOR GCASH/PAYMAYA:
    * Mobile number field: [mobile number] (Inter 14px)
    * Redirect message: "You will be redirected to [GCash/PayMaya] to complete payment" (Inter 12px #6B7280)
    * Green "Proceed to Payment" button
* FOR CREDIT/DEBIT CARD:
    * Card details form:
        * Card number field: [1234 5678 9012 3456]
        * Expiry field: [MM/YY]
        * CVV field: [123]
    * 3D Secure iframe placeholder (gray box with note)
    * Green "Pay Now" button
* FOR CASH:
    * "Cash on service" confirmation card
    * Payment instructions: "Pay the Skillr directly after service completion" (Inter 14px)
    * Green "Confirm Cash Payment" button
* "Cancel" button (Inter SemiBold 14px #6B7280)
* Payment method selector (radio buttons or tabs) to switch between methods
SCREEN 3: BOOKING CONFIRMATION PAGE
* Success checkmark icon (green circle with check)
* "Your project has been booked!" heading (Inter Bold 18px #111827)
* Project ID: [#SERV-123456] (Inter 12px #6B7280)
* Provider card: [photo], [name], "★ [rating]" with "View Profile >" link
* Service summary: [date], [time], [location] (Inter 14px)
* Status timeline (horizontal with 4 steps):
    * Booked (active/green checkmark)
    * On the way
    * Started
    * Completed
* Note: "You booked this project on [booking-date] for [service-date]" (Inter 12px #6B7280)
* Two buttons side by side: "Manage project" and "Add to calendar" (outlined style)
* BottomNavigation with Projects active
SCREEN 4: MY PROJECTS PAGE (UNIFIED)
* Header: "Projects" with Filter ▼ dropdown (Inter SemiBold 18px #111827, filter #6B7280)
* Three tabs:
    * "Upcoming" (active: bg #00BF63 white text, inactive: bg #F9FAFB #6B7280)
    * "Past"
    * "Cancelled"
* Project cards (repeatable component) with:
    * Booking ID: [#SERV-123456] (Inter 10px #6B7280)
    * Provider photo (48x48 circle)
    * Provider name and rating: [name] ★ [rating] ([reviews])
    * Service type: [service type]
    * Date & time: [date] at [time]
    * Status badge: [pending/accepted/in-progress/completed/cancelled] with appropriate color
    * Action button: [Track/Review/View Details/Rebook] (Inter SemiBold 14px #00BF63)
* Empty state: Illustration, "No projects yet", "Start booking services to see them here", "Browse Services" green button
* BottomNavigation with Projects active
SCREEN 5: PROJECT DETAILS PAGE
* Header: "Project Information" with back arrow and address (Inter 12px #6B7280)
* Project ID: [#SERV-123456] (Inter 10px #6B7280)
* "The Skillr will start - [date] @ [time]" (Inter 12px #111827)
* Service type: [service type] (Inter SemiBold 16px #111827)
* Two buttons: "Manage project" and "Add to calendar" (side by side)
* Status timeline (horizontal steps with green checkmarks on completed)
* "You booked this project on [booking-date] for [service-date]" (Inter 12px #6B7280)
* Provider section: [photo], [name], ★ [rating], "View Profile >" link
* Service details expandable section
* Price breakdown
* BottomNavigation
SCREEN 6: TRACK SKILLR PAGE
* Header: "Track Skillr" with back arrow
* Full-screen map placeholder (light gray with "Map view" text)
* Bottom card (white, rounded top corners):
    * Provider: [name], ★ [rating]
    * ETA: "Arriving in [minutes] min" (Inter Bold 16px #111827)
    * Distance: "[distance] km away"
    * Two buttons: "Call" (green) and "Message" (outlined)
    * Last updated timestamp
SCREEN 7: MANAGE PROJECT PAGE
* Header: "Manage Project" with back arrow
* "Make changes to your project..." (Inter 14px #6B7280)
* Two tappable rows with chevrons:
    * "Cancel Booking" (Inter 16px #111827)
    * "Change booking date or time" (Inter 16px #111827)
* Tapping "Cancel Booking" navigates to Cancel Booking page
SCREEN 8: CANCEL BOOKING PAGE
* Header: "Cancel Booking" with back arrow
* "Please let us know why you're canceling your booking. We would really appreciate your feedback." (Inter 14px #6B7280)
* Radio button options:
    * Don't need the service anymore
    * Not available at this time
    * Found a better rate elsewhere
    * Placed the request by mistake
    * Other
* Two buttons side by side:
    * "Don't Cancel" (outlined)
    * "Cancel Booking" (red or green? confirm which)
SCREEN 9: REPORT ISSUE/DISPUTE PAGE
* Header: "Report an Issue" with back arrow
* Project ID: [#SERV-123456] (pre-filled)
* Issue type dropdown with chevron
* Description textarea: [Describe the issue...] (Inter 14px)
* "Upload evidence" button/area (photos)
* Desired resolution section with radio options
* "Submit" button (green)

CONNECTION NOTES:
* All screens in main branch (not booking-demo)
* Flow: CustomerHomePage → CustomerServiceDetail → BookingReview → Payment → BookingConfirmation → MyProjects → ProjectDetails → Track/Manage/Cancel/Report
* Use existing components from main branch (StickyFooterButton, BottomNavigation, StatusBar, MobileContainer)
* All text should be editable layers with [placeholders], not hardcoded
