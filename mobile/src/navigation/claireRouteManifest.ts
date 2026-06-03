export type ClaireRouteGroup = 'auth' | 'customer' | 'provider' | 'shared';

export type ClaireBackendMode =
  | 'connected'
  | 'visual-only'
  | 'needs-backend'
  | 'needs-native';

export interface ClaireRouteManifestItem {
  key: string;
  sourcePath: string;
  group: ClaireRouteGroup;
  backendMode: ClaireBackendMode;
  notes?: string;
}

export const claireRouteManifest: ClaireRouteManifestItem[] = [
  { key: 'authGate', sourcePath: '/auth-gate', group: 'auth', backendMode: 'connected' },
  { key: 'loginRoleSelection', sourcePath: '/login-role-selection', group: 'auth', backendMode: 'connected' },
  { key: 'customerLogin', sourcePath: '/customer/login', group: 'auth', backendMode: 'connected', notes: 'Password login remains Supabase-backed; Google authorization uses APICenter gateway endpoints for verification, then returns to the password-backed session flow.' },
  { key: 'providerLogin', sourcePath: '/provider/login', group: 'auth', backendMode: 'connected', notes: 'Password login remains Supabase-backed; Google authorization uses APICenter gateway endpoints for verification, then returns to the password-backed session flow.' },
  { key: 'signupRoleSelection', sourcePath: '/signup-role-selection', group: 'auth', backendMode: 'connected' },
  { key: 'customerRegistration', sourcePath: '/customer/registration', group: 'auth', backendMode: 'connected' },
  { key: 'providerSignupStep1', sourcePath: '/provider/signup/step1', group: 'auth', backendMode: 'connected', notes: 'Claire multi-step provider signup is consolidated into the functional React Native provider registration screen.' },
  { key: 'providerSignupStep2', sourcePath: '/provider/signup/step2', group: 'auth', backendMode: 'connected', notes: 'Claire multi-step provider signup is consolidated into the functional React Native provider registration screen.' },
  { key: 'providerSignupStep3', sourcePath: '/provider/signup/step3', group: 'auth', backendMode: 'connected', notes: 'Claire multi-step provider signup is consolidated into the functional React Native provider registration screen.' },
  { key: 'providerSignupStep4', sourcePath: '/provider/signup/step4', group: 'auth', backendMode: 'connected', notes: 'Claire multi-step provider signup is consolidated into the functional React Native provider registration screen.' },
  { key: 'providerSignupStep5', sourcePath: '/provider/signup/step5', group: 'auth', backendMode: 'connected', notes: 'Claire multi-step provider signup is consolidated into the functional React Native provider registration screen.' },
  { key: 'customerHome', sourcePath: '/customer/home', group: 'customer', backendMode: 'connected' },
  { key: 'customerCategory', sourcePath: '/customer/category/:slug', group: 'customer', backendMode: 'connected' },
  { key: 'customerServiceDetail', sourcePath: '/customer/service/:id', group: 'customer', backendMode: 'connected' },
  { key: 'customerSearchResults', sourcePath: '/customer/search-results', group: 'customer', backendMode: 'connected' },
  { key: 'customerTopProviders', sourcePath: '/customer/top-providers', group: 'customer', backendMode: 'connected' },
  { key: 'providerProfile', sourcePath: '/provider/profile/:id', group: 'customer', backendMode: 'connected' },
  { key: 'bookingForm', sourcePath: '/booking-form/:providerId', group: 'customer', backendMode: 'connected', notes: 'Service address verification uses APICenter geocoding through the gateway.' },
  { key: 'bookingReview', sourcePath: '/customer/booking-review/:id', group: 'customer', backendMode: 'connected' },
  { key: 'reservePayment', sourcePath: '/customer/payment/:bookingId', group: 'customer', backendMode: 'connected', notes: 'Uses APICenter checkout for card/wallet methods and the existing reservation API for cash-on-service.' },
  { key: 'bookingConfirmation', sourcePath: '/customer/booking-confirmation/:bookingId', group: 'customer', backendMode: 'connected' },
  { key: 'myBookings', sourcePath: '/customer/bookings', group: 'customer', backendMode: 'connected' },
  { key: 'customerCalendar', sourcePath: '/customer/calendar', group: 'customer', backendMode: 'connected', notes: 'Calendar data is booking-backed; export opens an external Google Calendar URL.' },
  { key: 'bookingDetails', sourcePath: '/customer/booking/:id', group: 'customer', backendMode: 'connected' },
  { key: 'manageBooking', sourcePath: '/customer/booking/:id/manage', group: 'customer', backendMode: 'connected' },
  { key: 'cancelBooking', sourcePath: '/customer/booking/:id/cancel', group: 'customer', backendMode: 'connected' },
  { key: 'reportIssue', sourcePath: '/customer/booking/:id/report-issue', group: 'customer', backendMode: 'connected', notes: 'Evidence upload uses authenticated media uploads.' },
  { key: 'trackServiceProvider', sourcePath: '/customer/booking/:id/track', group: 'customer', backendMode: 'connected', notes: 'Uses booking tracking snapshot; live GPS remains native follow-up.' },
  { key: 'customerMore', sourcePath: '/customer/more', group: 'customer', backendMode: 'connected' },
  { key: 'customerProfile', sourcePath: '/customer/profile', group: 'customer', backendMode: 'connected' },
  { key: 'customerAddresses', sourcePath: '/customer/addresses', group: 'customer', backendMode: 'connected', notes: 'Uses authenticated saved-address profile routes.' },
  { key: 'customerSettings', sourcePath: '/customer/settings', group: 'customer', backendMode: 'connected' },
  { key: 'customerHelp', sourcePath: '/customer/help', group: 'customer', backendMode: 'connected', notes: 'Support tickets use existing API; FAQ copy is static content.' },
  { key: 'customerServiceHistory', sourcePath: '/customer/service-history', group: 'customer', backendMode: 'connected' },
  { key: 'customerNotifications', sourcePath: '/customer/notifications', group: 'customer', backendMode: 'connected' },
  { key: 'customerPaymentMethods', sourcePath: '/customer/payment-methods', group: 'customer', backendMode: 'connected', notes: 'Stores non-sensitive payment method display metadata; live processor tokenization remains external.' },
  { key: 'customerReferral', sourcePath: '/customer/referral', group: 'customer', backendMode: 'connected', notes: 'Referral summary is gateway-backed; code sharing is manual because clipboard copy is not enabled.' },
  { key: 'providerHome', sourcePath: '/provider/home', group: 'provider', backendMode: 'connected' },
  { key: 'providerMyBookings', sourcePath: '/provider/my-bookings', group: 'provider', backendMode: 'connected' },
  { key: 'providerBookingDetails', sourcePath: '/provider/booking-details/:id', group: 'provider', backendMode: 'connected' },
  { key: 'providerCalendar', sourcePath: '/provider/calendar', group: 'provider', backendMode: 'connected', notes: 'Schedule data is booking-backed; availability editing uses gateway-backed provider availability routes.' },
  { key: 'providerSetAvailability', sourcePath: '/provider/set-availability', group: 'provider', backendMode: 'connected' },
  { key: 'providerMessages', sourcePath: '/provider/messages/:id', group: 'provider', backendMode: 'connected' },
  { key: 'providerConversation', sourcePath: '/provider/conversation/:customerId', group: 'provider', backendMode: 'connected' },
  { key: 'providerEarnings', sourcePath: '/provider/earnings', group: 'provider', backendMode: 'connected' },
  { key: 'providerProfileView', sourcePath: '/provider/profile/view', group: 'provider', backendMode: 'connected' },
  { key: 'providerEditProfile', sourcePath: '/provider/edit-profile', group: 'provider', backendMode: 'connected' },
  { key: 'providerPortfolio', sourcePath: '/provider/portfolio', group: 'provider', backendMode: 'connected' },
  { key: 'providerPayoutManagement', sourcePath: '/provider/payout-management', group: 'provider', backendMode: 'connected' },
  { key: 'providerRequestPayout', sourcePath: '/provider/request-payout', group: 'provider', backendMode: 'connected' },
  { key: 'providerInsights', sourcePath: '/provider/insights', group: 'provider', backendMode: 'connected', notes: 'Metrics are dashboard-backed; growth tips are local display guidance.' },
  { key: 'providerNavigationMode', sourcePath: '/provider/navigation-mode/:id', group: 'provider', backendMode: 'connected', notes: 'Uses booking tracking, device location, and OpenRouteService directions through the gateway for in-app route preview.' },
  { key: 'providerStartService', sourcePath: '/provider/start-service/:id', group: 'provider', backendMode: 'connected' },
  { key: 'providerServiceInProgress', sourcePath: '/provider/service-in-progress/:id', group: 'provider', backendMode: 'connected' },
  { key: 'providerCompleteService', sourcePath: '/provider/complete-service/:id', group: 'provider', backendMode: 'connected' },
  { key: 'providerServiceCompleted', sourcePath: '/provider/service-completed/:id', group: 'provider', backendMode: 'connected' },
  { key: 'providerServiceReceipt', sourcePath: '/provider/service-receipt/:id', group: 'provider', backendMode: 'connected' },
  { key: 'providerCancelBooking', sourcePath: '/provider/cancel-booking/:id', group: 'provider', backendMode: 'connected' },
  { key: 'providerReportIssue', sourcePath: '/provider/booking/:id/report-issue', group: 'provider', backendMode: 'connected' },
  { key: 'termsAndConditions', sourcePath: '/terms-and-conditions', group: 'shared', backendMode: 'visual-only', notes: 'Static informational content; no backend persistence is implied.' },
  { key: 'privacyPolicy', sourcePath: '/privacy-policy', group: 'shared', backendMode: 'visual-only', notes: 'Static informational content; no backend persistence is implied.' },
];
