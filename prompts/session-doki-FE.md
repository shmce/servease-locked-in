# ServEase Mobile — Session Log (branch: doki-FE)

## Design System Rules Established
- `fontWeight: '700'` is the standard bold across the entire app (no '800', no '900')
- `fontWeight: '500'` for secondary/meta text (dates, labels, captions)
- `palette.cream` (`#FAF8F5`) as scroll background
- `palette.white` for card surfaces
- `palette.mint` (`#56C490`) as primary accent
- `palette.ink` for primary text, `palette.muted` for secondary, `palette.faint` for tertiary

---

## Changes Made (in order)

### 1. CustomerCategory / CustomerTopProviders — Remove pricing from list cards
- `mobile/src/features/customer-category/views/CustomerCategory.tsx` — removed `priceLabel` from serviceFooter
- `mobile/src/features/customer-top-providers/views/CustomerTopProviders.tsx` — removed `priceLabel` from providerMeta

### 2. CustomerProviderProfile — Full redesign
- `mobile/src/features/customer-provider-profile/views/CustomerProviderProfile.tsx`
  - Mint hero (height 148, borderBottomRadius 24) with overlapping 96px avatar
  - Name 22/700 + CheckCircle icon
  - Stats card (3 cells + dividers)
  - Pill tab rail
  - About tab: two Cards — description + detail rows (label muted 13/500, value ink 13/700 right)
- `mobile/src/features/customer-provider-profile/viewModels/useCustomerProviderProfileViewModel.ts`
  - `verificationStatus === 'approved'` → shows "Verified" (not raw "approved")

### 3. FontWeight '700' sweep — shared components
- `mobile/src/components/DesignKit.tsx`
  - `sectionTitle`: added `fontWeight: '700'` (spreads type.section which is '800')
  - `buttonText`: added `fontWeight: '700'`
  - `topTitle`: added `fontWeight: '700'`
  - `emptyTitle`: added `fontWeight: '700'`
  - `pillText`: `'800'` → `'700'`
  - `badgeText`: `'800'` → `'700'`
  - `metricValue`: `'800'` → `'700'`
  - `navMark`: `'800'` → `'700'`
  - `navLabelActive`: `'800'` → `'700'`
- `mobile/src/components/AppDisplay.tsx`
  - `cardTitle`: added `fontWeight: '700'`
  - `cardMeta`: added `fontWeight: '500'`
  - `tableLabel`: `'800'` → `'500'`
  - `tableValue`: `'800'` → `'700'`
  - `providerName`: `'800'` → `'700'`
  - `bookingActionText`: `'800'` → `'700'`
  - `priceText`: `'900'` → `'700'`
  - `serviceThumbText`: `'900'` → `'700'`
  - `providerListAvatarText`: `'900'` → `'700'`
  - `settingsSectionTitle`: `'900'` → `'700'`
  - `quickIconText`: `'900'` → `'700'`
  - `roleMark`, `chevron`: `'900'` → `'700'`
  - `infoValue`: `'800'` → `'700'`
- `mobile/src/components/MonthCalendar.tsx`
  - `monthTitle`, `weekday`, `dayNumber`: all fixed to `'700'`
- `mobile/src/tracking/TrackingMapPreview.tsx`
  - `addressVerificationTitle`: `'800'` → `'700'`
  - `cardTitle`: `'900'` → `'700'`

### 4. CustomerBookingForm — Font weights + remove Duration field
- `mobile/src/features/customer-booking/views/CustomerBookingForm.tsx`
  - All `'900'`/`'800'` → `'700'`
  - Removed "Duration (hours)" Field

### 5. CustomerBookingSchedulePicker — Wheel/Drum time picker
- `mobile/src/features/customer-booking/views/CustomerBookingSchedulePicker.tsx`
  - Full rewrite: Modal bottom sheet with two WheelPicker drums (Hour + Minute in 30-min intervals)
  - "Arrives at" and "Finishes at" time rows in a Card
  - Auto-calculates `hoursRequired` from time difference → calls `onHoursRequiredChange`
  - `WheelPicker`: `ScrollView` with `snapToInterval={48}` + `decelerationRate="fast"`
  - Selection rail (mint 1.5px borders), fade overlays top/bottom
  - Minutes wheel uses `key={selHour}` to remount on hour change

### 6. CustomerBookingReview — Full redesign
- `mobile/src/features/customer-booking/views/CustomerBookingReview.tsx`
  - Provider card: mintSoft avatar, name 15/700, rating 12/500, "View Profile" link
  - `ReviewRow`: label muted 12/500 left, value ink 13/700 right (numberOfLines 3)
  - Special instructions: uppercase label above body text
  - Total row: "Booking Cost" 14/700 ink | amount 22/700 mint
  - `palette.cream` scroll background

### 7. Messages — Full redesign (both roles)
- `mobile/src/features/messages/viewModels/useMessagesViewModel.ts`
  - Added `counterparty`, `initial`, `serviceName`, `timeLabel` to conversation rows
  - Added `threadTitle`, `threadSubtitle` to data
- `mobile/src/features/messages/views/Messages.tsx`
  - Full rewrite: flat conversation list + separate ChatDetailScreen
  - `ConversationListScreen`: borderless rows, 48px mint pill avatar, name 15/700, service 12/500, time 11/500
  - `ChatDetailScreen`: `KeyboardAvoidingView`, chat bubbles (mine: mint bg / theirs: lineSoft bg), fixed input bar with Paperclip + TextInput + Send
  - Auto-scroll to bottom on new messages
- `mobile/src/App.tsx`: added `onDeselectConversation={() => messagesFlow.actions.setSelectedConversationId(null)}`

### 8. CustomerMore — Redesign to match ProviderMore layout
- `mobile/src/features/customer-more/viewModels/useCustomerMoreViewModel.ts`
  - Removed `CustomerMoreMenuIcon` type
  - Added `badge?: number` to `CustomerMoreMenuItem`
  - Returns `actionRows: CustomerMoreMenuItem[][]` (pairs) instead of flat `menuItems`
- `mobile/src/features/customer-more/views/CustomerMore.tsx`
  - Full rewrite: `TopBar` + cream `ScrollView` + `ActionRow`/`QuickAction` pairs
  - White profile card (mint avatar, name 16/700, email 13/500 muted)
  - Log out button + version text at bottom
- `mobile/src/components/AppDisplay.tsx`
  - Added `FileText, Gift, WalletCards` to lucide imports
  - Added customer icon mappings to `quickActionIcons`: `'My Profile'`, `'Refer a Friend'`, `'Payment Methods'`, `'Help & Support'`, `'Terms & Privacy'`
  - `QuickAction` now accepts `badge?: number` prop (red dot with count, positioned top-right of icon)

### 9. CustomerCalendar — Font weight fix
- `mobile/src/features/customer-calendar/views/CustomerCalendar.tsx`
  - `cardTitle`: `'900'` → `'700'`

### 10. CustomerBookingDetail — Full redesign
- `mobile/src/features/customer-booking-detail/views/CustomerBookingDetail.tsx`
  - Dropped `InfoRow` from AppDisplay, replaced with local `DetailRow` (label muted 12/500 left, value ink 13/700 right)
  - Booking reference: small mint uppercase with letter-spacing
  - Service title: 20/700 (was 22/900)
  - Schedule label: muted 12/500
  - Provider card: 44px mintSoft avatar + name 14/700 + "View Profile" link inline
  - All font weights fixed

### 11. BookingDetailSections — Font weight fix
- `mobile/src/shared/components/BookingDetailSections.tsx`
  - `cardTitle`: `'900'` → `'700'`, size 15 → 14
  - `cardMeta`: `'600'` → `'500'`
  - `cardBody`: `'600'` → `'500'`

---

## Key Patterns to Follow in Future Sessions

```
// Standard bold heading
fontWeight: '700'

// Standard body / meta
fontWeight: '500'

// Section label inside a card
color: palette.ink, fontSize: 13, fontWeight: '700'

// Detail row (label | value)
label: { color: palette.muted, flex: 1, fontSize: 12, fontWeight: '500' }
value: { color: palette.ink, flex: 1.6, fontSize: 13, fontWeight: '700', textAlign: 'right' }

// Scroll background
backgroundColor: palette.cream

// Card surface
backgroundColor: palette.white

// Mint accent
palette.mint  // #56C490
```

## Architecture Rule (enforced by architecture.test.ts)
Views must NOT contain: `formatMoney`, `categories.find`, `services.filter`, `buildCustomer*`, `buildProvider*`
All formatting/filtering logic belongs in ViewModels.
