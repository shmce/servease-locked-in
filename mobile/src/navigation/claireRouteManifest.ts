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
  { key: 'customerLogin', sourcePath: '/customer/login', group: 'auth', backendMode: 'connected' },
  { key: 'providerLogin', sourcePath: '/provider/login', group: 'auth', backendMode: 'connected' },
  { key: 'signupRoleSelection', sourcePath: '/signup-role-selection', group: 'auth', backendMode: 'needs-backend', notes: 'Requires signup/profile creation flow.' },
  { key: 'customerRegistration', sourcePath: '/customer/registration', group: 'auth', backendMode: 'needs-backend' },
  { key: 'providerSignupStep1', sourcePath: '/provider/signup/step1', group: 'auth', backendMode: 'needs-backend' },
  { key: 'providerSignupStep2', sourcePath: '/provider/signup/step2', group: 'auth', backendMode: 'needs-backend' },
  { key: 'providerSignupStep3', sourcePath: '/provider/signup/step3', group: 'auth', backendMode: 'needs-backend' },
  { key: 'providerSignupStep4', sourcePath: '/provider/signup/step4', group: 'auth', backendMode: 'needs-backend' },
  { key: 'providerSignupStep5', sourcePath: '/provider/signup/step5', group: 'auth', backendMode: 'needs-backend' },
  { key: 'customerHome', sourcePath: '/customer/home', group: 'customer', backendMode: 'connected' },
  { key: 'customerCategory', sourcePath: '/customer/category/:slug', group: 'customer', backendMode: 'connected' },
  { key: 'customerServiceDetail', sourcePath: '/customer/service/:id', group: 'customer', backendMode: 'connected' },
  { key: 'customerSearchResults', sourcePath: '/customer/search-results', group: 'customer', backendMode: 'connected' },
  { key: 'customerTopProviders', sourcePath: '/customer/top-providers', group: 'customer', backendMode: 'connected' },
  { key: 'providerProfile', sourcePath: '/provider/profile/:id', group: 'customer', backendMode: 'connected' },
  { key: 'bookingForm', sourcePath: '/booking-form/:providerId', group: 'customer', backendMode: 'connected' },
  { key: 'bookingReview', sourcePath: '/customer/booking-review/:id', group: 'customer', backendMode: 'connected' },
  { key: 'reservePayment', sourcePath: '/customer/payment/:bookingId', group: 'customer', backendMode: 'connected', notes: 'Uses current cash-on-service payment API only.' },
  { key: 'bookingConfirmation', sourcePath: '/customer/booking-confirmation/:bookingId', group: 'customer', backendMode: 'connected' },
  { key: 'myBookings', sourcePath: '/customer/bookings', group: 'customer', backendMode: 'connected' },
  { key: 'bookingDetails', sourcePath: '/customer/booking/:id', group: 'customer', backendMode: 'connected' },
  { key: 'manageBooking', sourcePath: '/customer/booking/:id/manage', group: 'customer', backendMode: 'connected' },
  { key: 'cancelBooking', sourcePath: '/customer/booking/:id/cancel', group: 'customer', backendMode: 'connected' },
  { key: 'reportIssue', sourcePath: '/customer/booking/:id/report-issue', group: 'customer', backendMode: 'connected', notes: 'Evidence upload remains needs-native/storage.' },
  { key: 'trackServiceProvider', sourcePath: '/customer/booking/:id/track', group: 'customer', backendMode: 'needs-backend', notes: 'Requires provider location/ETA API.' },
  { key: 'customerMore', sourcePath: '/customer/more', group: 'customer', backendMode: 'connected' },
  { key: 'customerProfile', sourcePath: '/customer/profile', group: 'customer', backendMode: 'visual-only', notes: 'Read-only until profile update endpoint is added.' },
  { key: 'customerSettings', sourcePath: '/customer/settings', group: 'customer', backendMode: 'visual-only' },
  { key: 'customerHelp', sourcePath: '/customer/help', group: 'customer', backendMode: 'connected', notes: 'Support tickets use existing API.' },
  { key: 'customerServiceHistory', sourcePath: '/customer/service-history', group: 'customer', backendMode: 'connected' },
  { key: 'customerNotifications', sourcePath: '/customer/notifications', group: 'customer', backendMode: 'connected' },
  { key: 'customerPaymentMethods', sourcePath: '/customer/payment-methods', group: 'customer', backendMode: 'needs-backend', notes: 'Requires card/payment provider integration.' },
  { key: 'customerReferral', sourcePath: '/customer/referral', group: 'customer', backendMode: 'needs-backend' },
  { key: 'providerHome', sourcePath: '/provider/home', group: 'provider', backendMode: 'connected' },
  { key: 'providerMyBookings', sourcePath: '/provider/my-bookings', group: 'provider', backendMode: 'connected' },
  { key: 'providerBookingDetails', sourcePath: '/provider/booking-details/:id', group: 'provider', backendMode: 'connected' },
  { key: 'providerCalendar', sourcePath: '/provider/calendar', group: 'provider', backendMode: 'connected' },
  { key: 'providerSetAvailability', sourcePath: '/provider/set-availability', group: 'provider', backendMode: 'connected' },
  { key: 'providerMessages', sourcePath: '/provider/messages/:id', group: 'provider', backendMode: 'connected' },
  { key: 'providerConversation', sourcePath: '/provider/conversation/:customerId', group: 'provider', backendMode: 'connected' },
  { key: 'providerEarnings', sourcePath: '/provider/earnings', group: 'provider', backendMode: 'connected' },
  { key: 'providerProfileView', sourcePath: '/provider/profile/view', group: 'provider', backendMode: 'connected' },
  { key: 'providerEditProfile', sourcePath: '/provider/edit-profile', group: 'provider', backendMode: 'needs-backend' },
  { key: 'providerPortfolio', sourcePath: '/provider/portfolio', group: 'provider', backendMode: 'needs-backend', notes: 'Requires portfolio/media endpoints.' },
  { key: 'providerPayoutManagement', sourcePath: '/provider/payout-management', group: 'provider', backendMode: 'needs-backend', notes: 'Requires payout method/provider APIs.' },
  { key: 'providerRequestPayout', sourcePath: '/provider/request-payout', group: 'provider', backendMode: 'needs-backend' },
  { key: 'providerNavigationMode', sourcePath: '/provider/navigation-mode/:id', group: 'provider', backendMode: 'needs-native' },
  { key: 'providerStartService', sourcePath: '/provider/start-service/:id', group: 'provider', backendMode: 'connected' },
  { key: 'providerServiceInProgress', sourcePath: '/provider/service-in-progress/:id', group: 'provider', backendMode: 'connected' },
  { key: 'providerCompleteService', sourcePath: '/provider/complete-service/:id', group: 'provider', backendMode: 'connected' },
  { key: 'providerServiceCompleted', sourcePath: '/provider/service-completed/:id', group: 'provider', backendMode: 'connected' },
  { key: 'providerServiceReceipt', sourcePath: '/provider/service-receipt/:id', group: 'provider', backendMode: 'connected' },
  { key: 'providerCancelBooking', sourcePath: '/provider/cancel-booking/:id', group: 'provider', backendMode: 'connected' },
  { key: 'providerReportIssue', sourcePath: '/provider/booking/:id/report-issue', group: 'provider', backendMode: 'connected' },
  { key: 'termsAndConditions', sourcePath: '/terms-and-conditions', group: 'shared', backendMode: 'visual-only' },
  { key: 'privacyPolicy', sourcePath: '/privacy-policy', group: 'shared', backendMode: 'visual-only' },
];
