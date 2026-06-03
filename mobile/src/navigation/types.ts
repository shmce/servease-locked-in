export type AppRole = 'customer' | 'provider';

export type CustomerTab = 'explore' | 'bookings' | 'calendar' | 'messages' | 'more';
export type ProviderTab = 'home' | 'bookings' | 'calendar' | 'messages' | 'more';

export type AuthScreen =
  | 'authGate'
  | 'loginRole'
  | 'customerLogin'
  | 'providerLogin'
  | 'signupRole'
  | 'customerRegistration'
  | 'providerRegistration';

export type DetailScreen =
  | 'customerBookingReview'
  | 'customerReservePayment'
  | 'customerBookingConfirmation'
  | 'customerBookingDetail'
  | 'customerBookingManage'
  | 'customerBookingCancel'
  | 'customerBookingReport'
  | 'customerTrackServiceProvider'
  | 'customerCategory'
  | 'customerAllServices'
  | 'customerRecommendedServices'
  | 'customerTopProviders'
  | 'customerProviderProfile'
  | 'customerBookingForm'
  | 'customerSearchResults'
  | 'customerProfile'
  | 'customerSettings'
  | 'customerSecurity'
  | 'customerHelp'
  | 'customerServiceHistory'
  | 'customerNotifications'
  | 'customerPaymentMethods'
  | 'customerAddresses'
  | 'customerReferral'
  | 'customerTerms'
  | 'providerBookingDetail'
  | 'providerApplicationDocuments'
  | 'providerProfileView'
  | 'providerEditProfile'
  | 'providerPortfolio'
  | 'providerSetAvailability'
  | 'providerNavigationMode'
  | 'providerStartService'
  | 'providerServiceInProgress'
  | 'providerCompleteService'
  | 'providerServiceCompleted'
  | 'providerCancelBooking'
  | 'providerReportIssue'
  | 'providerServiceReceipt'
  | 'providerPayoutManagement'
  | 'providerRequestPayout'
  | 'providerReviews'
  | 'providerEarnings'
  | 'providerNotifications'
  | 'providerInsights'
  | 'providerHelp'
  | 'providerServices'
  | 'providerSecurity'
  | 'providerSettings';

export type AppScreen = AuthScreen | DetailScreen | CustomerTab | ProviderTab;

export interface RouteState {
  role: AppRole | null;
  screen: AppScreen;
}
