export type AppRole = 'customer' | 'provider';

export type CustomerTab = 'explore' | 'bookings' | 'messages' | 'more';
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
  | 'customerCategory'
  | 'customerAllServices'
  | 'customerRecommendedServices'
  | 'customerTopProviders'
  | 'customerProviderProfile'
  | 'customerBookingForm'
  | 'customerSearchResults'
  | 'customerProfile'
  | 'customerSettings'
  | 'customerHelp'
  | 'customerServiceHistory'
  | 'customerNotifications'
  | 'customerTerms'
  | 'providerBookingDetail'
  | 'providerNavigationMode'
  | 'providerStartService'
  | 'providerServiceInProgress'
  | 'providerCompleteService'
  | 'providerServiceCompleted'
  | 'providerCancelBooking'
  | 'providerReportIssue'
  | 'providerServiceReceipt';

export type AppScreen = AuthScreen | DetailScreen | CustomerTab | ProviderTab;

export interface RouteState {
  role: AppRole | null;
  screen: AppScreen;
}
