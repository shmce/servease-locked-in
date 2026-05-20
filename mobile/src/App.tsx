import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import {
  lazy,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AppState,
  Linking,
  Platform,
  StyleSheet,
} from 'react-native';
import { TopBar } from './components/DesignKit';
import { AppRouter, type AppRouterRenderers } from './legacy-router/AppRouter';
import { AppShell } from './legacy-router/AppShell';
import {
  MissingSelection,
} from './components/AppDisplay';
import {
  buildCalendarExportUrl,
  buildBookingTransitionRequest,
  paymentNotice,
  providerPayoutTotal,
  roleLabel,
  statusLabel,
} from './domain/booking';
import {
  bookingTimeSlots,
  defaultScheduledAt,
  type ProviderBookingTab,
} from './constants/appContent';
import {
  readError,
} from './navigation/routeHelpers';
import { resolveNotificationRoute } from './navigation/notificationRouting';
import {
  BookingMediaSection,
  BookingServiceUpdatesSection,
  BookingTimelineEventsSection,
} from './shared/components/BookingDetailSections';
import { SupportPanel } from './shared/components/SupportPanel';
import { useStableCallback } from './shared/hooks/useStableCallback';
import type { CustomerProviderProfileTab } from './features/customer-provider-profile/viewModels/useCustomerProviderProfileViewModel';
import type { CustomerTrackingSheetLevel } from './features/customer-track-provider/viewModels/useCustomerTrackProviderViewModel';
import type { ProviderNavigationSheetLevel } from './features/provider-navigation-mode/viewModels/useProviderNavigationModeViewModel';
import { useCustomerBookingFlowViewModel } from './features/customer-booking/viewModels/useCustomerBookingFlowViewModel';
import { useMessagesFlowViewModel } from './features/messages/viewModels/useMessagesFlowViewModel';
import { useNotificationsFlowViewModel } from './features/notifications/viewModels/useNotificationsFlowViewModel';
import { useProviderServiceFlowViewModel } from './features/provider-service-flow/viewModels/useProviderServiceFlowViewModel';
import { useSupportFlowViewModel } from './features/support/viewModels/useSupportFlowViewModel';
import { useProviderLiveLocation } from './tracking/useProviderLiveLocation';
import { AppRole, AppScreen, RouteState } from './navigation/types';
import { palette, radius, spacing, type } from './theme/serveaseDesign';
import type {
  AuthSession,
  BookingStatus,
  BookingSummary,
  BookingServiceUpdateSummary,
  BookingTimelineEventSummary,
  BookingTrackingSnapshot,
  CatalogCategory,
  CatalogServiceItem,
  CurrentUserProfile,
  CustomerPaymentMethodSummary,
  CustomerPaymentMethodType,
  PaymentSummary,
  PayoutAccountSummary,
  PayoutMethodSummary,
  PayoutMethodType,
  PayoutSummary,
  ReferralSummary,
  CurrentUserSessionSummary,
  UserPreferenceSummary,
  ProviderAvailabilitySchedule,
  ProviderApplicationStatus,
  ProviderDashboardSummary,
  ProviderListing,
  ProviderOwnedServiceInput,
  ProviderOwnedServiceSummary,
  ProviderPortfolioMediaSummary,
  ReviewSummary,
  SharedPaymentMethod,
  UploadKind,
  UploadSummary,
  GeoDirectionsRoute,
  GeoRouteLocation,
} from './shared/models/types';
import {
  addProviderPortfolioMedia,
  createCheckoutSession,
  createPayment,
  createProviderPayoutIdempotencyKey,
  createReview,
  deleteBookingAttachment,
  deleteCurrentUserAccount,
  disableCurrentUserTwoFactor,
  enableCurrentUserTwoFactor,
  exchangeGoogleCode,
  replyToReview,
  flagReview,
  getMyProviderApplication,
  getProviderDashboard,
  getCheckoutStatus,
  getDirections,
  getGoogleAuthorizationUrl,
  generateOtp,
  listProviderOwnedServices,
  replaceProviderServices,
  deleteCustomerPaymentMethod,
  deleteProviderPortfolioMedia,
  getCurrentUser,
  getBookingTrackingSnapshot,
  subscribeBookingTrackingSnapshots,
  getProviderPayoutAccount,
  getReferralSummary,
  getUserPreferences,
  getPublicProviderAvailability,
  getProviderAvailability,
  listCatalogCategories,
  listCatalogServices,
  listConversations,
  listCustomerBookings,
  listCustomerPaymentMethods,
  listNotifications,
  listPayments,
  listProviderBookings,
  listProviderListings,
  listProviderPayoutMethods,
  listProviderPayouts,
  listProviderPortfolioMedia,
  listProviderReviews,
  listBookingServiceUpdates,
  listBookingTimelineEvents,
  listCurrentUserSessions,
  listSupportTickets,
  registerAccount,
  reorderProviderPortfolio,
  requestPasswordReset,
  requestProviderPayout,
  updateProviderPortfolioMedia,
  upsertProviderPayoutMethod,
  transitionBookingStatus,
  updateCurrentUserPassword,
  updateCurrentUserProfile,
  upsertCustomerPaymentMethod,
  updateUserPreferences,
  verifyOtp,
  verifyCurrentUserTwoFactor,
  uploadMedia,
  validatePromotion,
  resolveGatewayBaseUrl,
  signInWithPassword,
  syncExpoPushRegistration,
} from './shared/models/apiService';

const AuthScreens = lazy(() =>
  import('./features/auth/views/AuthScreens').then((module) => ({
    default: module.AuthScreens,
  })),
);
const CustomerMoreScreen = lazy(() =>
  import('./features/customer-more/views/CustomerMore').then((module) => ({
    default: module.CustomerMoreScreen,
  })),
);
const BookingsScreen = lazy(() =>
  import('./features/bookings/views/Bookings').then((module) => ({
    default: module.BookingsScreen,
  })),
);
const CustomerAllServicesScreen = lazy(() =>
  import('./features/customer-all-services/views/CustomerAllServices').then((module) => ({
    default: module.CustomerAllServicesScreen,
  })),
);
const CustomerBookingFormScreen = lazy(() =>
  import('./features/customer-booking/views/CustomerBookingForm').then((module) => ({
    default: module.CustomerBookingFormScreen,
  })),
);
const CustomerBookingReviewScreen = lazy(() =>
  import('./features/customer-booking/views/CustomerBookingReview').then((module) => ({
    default: module.CustomerBookingReviewScreen,
  })),
);
const CustomerBookingConfirmationScreen = lazy(() =>
  import('./features/customer-booking-confirmation/views/CustomerBookingConfirmation').then(
    (module) => ({
      default: module.CustomerBookingConfirmationScreen,
    }),
  ),
);
const CustomerBookingDetailScreen = lazy(() =>
  import('./features/customer-booking-detail/views/CustomerBookingDetail').then((module) => ({
    default: module.CustomerBookingDetailScreen,
  })),
);
const CustomerCalendarScreen = lazy(() =>
  import('./features/customer-calendar/views/CustomerCalendar').then((module) => ({
    default: module.CustomerCalendarScreen,
  })),
);
const CustomerCancelBookingScreen = lazy(() =>
  import('./features/customer-cancel-booking/views/CustomerCancelBooking').then((module) => ({
    default: module.CustomerCancelBookingScreen,
  })),
);
const CustomerCategoryScreen = lazy(() =>
  import('./features/customer-category/views/CustomerCategory').then((module) => ({
    default: module.CustomerCategoryScreen,
  })),
);
const CustomerExploreScreen = lazy(() =>
  import('./features/customer-explore/views/CustomerExplore').then((module) => ({
    default: module.CustomerExploreScreen,
  })),
);
const CustomerProviderProfileScreen = lazy(() =>
  import('./features/customer-provider-profile/views/CustomerProviderProfile').then(
    (module) => ({
      default: module.CustomerProviderProfileScreen,
    }),
  ),
);
const CustomerReportIssueScreen = lazy(() =>
  import('./features/customer-report-issue/views/CustomerReportIssue').then((module) => ({
    default: module.CustomerReportIssueScreen,
  })),
);
const CustomerServiceHistoryScreen = lazy(() =>
  import('./features/customer-service-history/views/CustomerServiceHistory').then(
    (module) => ({
      default: module.CustomerServiceHistoryScreen,
    }),
  ),
);
const CustomerSettingsScreen = lazy(() =>
  import('./features/customer-settings/views/CustomerSettings').then((module) => ({
    default: module.CustomerSettingsScreen,
  })),
);
const CustomerTermsScreen = lazy(() =>
  import('./features/customer-terms/views/CustomerTerms').then((module) => ({
    default: module.CustomerTermsScreen,
  })),
);
const CustomerTopProvidersScreen = lazy(() =>
  import('./features/customer-top-providers/views/CustomerTopProviders').then((module) => ({
    default: module.CustomerTopProvidersScreen,
  })),
);
const CustomerTrackProviderScreen = lazy(() =>
  import('./features/customer-track-provider/views/CustomerTrackProvider').then((module) => ({
    default: module.CustomerTrackProviderScreen,
  })),
);
const CustomerReferralScreen = lazy(() =>
  import('./features/customer-referral/views/CustomerReferral').then((module) => ({
    default: module.CustomerReferralScreen,
  })),
);
const CustomerPaymentMethodsScreen = lazy(() =>
  import('./features/customer-payment-methods/views/CustomerPaymentMethods').then((module) => ({
    default: module.CustomerPaymentMethodsScreen,
  })),
);
const CustomerProfileScreen = lazy(() =>
  import('./features/customer-profile/views/CustomerProfile').then((module) => ({
    default: module.CustomerProfileScreen,
  })),
);
const CustomerReservePaymentScreen = lazy(() =>
  import('./features/customer-reserve-payment/views/CustomerReservePayment').then((module) => ({
    default: module.CustomerReservePaymentScreen,
  })),
);
const CustomerManageBookingScreen = lazy(() =>
  import('./features/customer-manage-booking/views/CustomerManageBooking').then((module) => ({
    default: module.CustomerManageBookingScreen,
  })),
);
const HelpCenterScreen = lazy(() =>
  import('./features/help-center/views/HelpCenter').then((module) => ({
    default: module.HelpCenterScreen,
  })),
);
const MessagesScreen = lazy(() =>
  import('./features/messages/views/Messages').then((module) => ({
    default: module.MessagesScreen,
  })),
);
const NotificationsScreen = lazy(() =>
  import('./features/notifications/views/Notifications').then((module) => ({
    default: module.NotificationsScreen,
  })),
);
const ProviderBookingDetailScreen = lazy(() =>
  import('./features/provider-booking-detail/views/ProviderBookingDetail').then((module) => ({
    default: module.ProviderBookingDetailScreen,
  })),
);
const ProviderBookingsScreen = lazy(() =>
  import('./features/provider-bookings/views/ProviderBookings').then((module) => ({
    default: module.ProviderBookingsScreen,
  })),
);
const ProviderCancelBookingScreen = lazy(() =>
  import('./features/provider-cancel-booking/views/ProviderCancelBooking').then((module) => ({
    default: module.ProviderCancelBookingScreen,
  })),
);
const ProviderCalendarScreen = lazy(() =>
  import('./features/provider-calendar/views/ProviderCalendar').then((module) => ({
    default: module.ProviderCalendarScreen,
  })),
);
const ProviderEditProfileScreen = lazy(() =>
  import('./features/provider-edit-profile/views/ProviderEditProfile').then((module) => ({
    default: module.ProviderEditProfileScreen,
  })),
);
const ProviderHomeScreen = lazy(() =>
  import('./features/provider-home/views/ProviderHome').then((module) => ({
    default: module.ProviderHomeScreen,
  })),
);
const ProviderInsightsScreen = lazy(() =>
  import('./features/provider-insights/views/ProviderInsights').then((module) => ({
    default: module.ProviderInsightsScreen,
  })),
);
const ProviderMoreScreen = lazy(() =>
  import('./features/provider-more/views/ProviderMore').then((module) => ({
    default: module.ProviderMoreScreen,
  })),
);
const ProviderNavigationModeScreen = lazy(() =>
  import('./features/provider-navigation-mode/views/ProviderNavigationMode').then((module) => ({
    default: module.ProviderNavigationModeScreen,
  })),
);
const ProviderPayoutManagementScreen = lazy(() =>
  import('./features/provider-payout-management/views/ProviderPayoutManagement').then(
    (module) => ({
      default: module.ProviderPayoutManagementScreen,
    }),
  ),
);
const ProviderPortfolioScreen = lazy(() =>
  import('./features/provider-portfolio/views/ProviderPortfolio').then((module) => ({
    default: module.ProviderPortfolioScreen,
  })),
);
const ProviderProfileViewScreen = lazy(() =>
  import('./features/provider-profile-view/views/ProviderProfileView').then((module) => ({
    default: module.ProviderProfileViewScreen,
  })),
);
const ProviderReportIssueScreen = lazy(() =>
  import('./features/provider-report-issue/views/ProviderReportIssue').then((module) => ({
    default: module.ProviderReportIssueScreen,
  })),
);
const ProviderRequestPayoutScreen = lazy(() =>
  import('./features/provider-request-payout/views/ProviderRequestPayout').then((module) => ({
    default: module.ProviderRequestPayoutScreen,
  })),
);
const ProviderSecurityScreen = lazy(() =>
  import('./features/provider-security/views/ProviderSecurity').then((module) => ({
    default: module.ProviderSecurityScreen,
  })),
);
const ProviderCompleteServiceScreen = lazy(() =>
  import('./features/provider-complete-service/views/ProviderCompleteService').then((module) => ({
    default: module.ProviderCompleteServiceScreen,
  })),
);
const ProviderServiceCompletedScreen = lazy(() =>
  import('./features/provider-service-completed/views/ProviderServiceCompleted').then(
    (module) => ({
      default: module.ProviderServiceCompletedScreen,
    }),
  ),
);
const ProviderServiceInProgressScreen = lazy(() =>
  import('./features/provider-service-in-progress/views/ProviderServiceInProgress').then(
    (module) => ({
      default: module.ProviderServiceInProgressScreen,
    }),
  ),
);
const ProviderServiceReceiptScreen = lazy(() =>
  import('./features/provider-service-receipt/views/ProviderServiceReceipt').then((module) => ({
    default: module.ProviderServiceReceiptScreen,
  })),
);
const ProviderServicesScreen = lazy(() =>
  import('./features/provider-services/views/ProviderServices').then((module) => ({
    default: module.ProviderServicesScreen,
  })),
);
const ProviderStartServiceScreen = lazy(() =>
  import('./features/provider-start-service/views/ProviderStartService').then((module) => ({
    default: module.ProviderStartServiceScreen,
  })),
);
const ProviderSettingsScreen = lazy(() =>
  import('./features/provider-settings/views/ProviderSettings').then((module) => ({
    default: module.ProviderSettingsScreen,
  })),
);
const ProviderSetAvailabilityScreen = lazy(() =>
  import('./features/provider-set-availability/views/ProviderSetAvailability').then(
    (module) => ({
      default: module.ProviderSetAvailabilityScreen,
    }),
  ),
);

const TRACKING_STREAM_FALLBACK_DELAY_MS = 4000;
const TRACKING_FALLBACK_POLL_INTERVAL_MS = 3000;

export default function App() {
  const [route, setRoute] = useState<RouteState>({ role: null, screen: 'authGate' });
  const apiBaseUrl = useMemo(() => resolveGatewayBaseUrl(), []);
  const supabaseUrl = useMemo(
    () => process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    [],
  );
  const publishableKey = useMemo(
    () =>
      process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
      '',
    [],
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [signupFullName, setSignupFullName] = useState('');
  const [signupContactNumber, setSignupContactNumber] = useState('');
  const [signupAddress, setSignupAddress] = useState('');
  const [signupBusinessName, setSignupBusinessName] = useState('');
  const [signupServiceArea, setSignupServiceArea] = useState('');
  const [signupServiceDescription, setSignupServiceDescription] = useState('');
  const [profileFullName, setProfileFullName] = useState('');
  const [profileContactNumber, setProfileContactNumber] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [profileBusinessName, setProfileBusinessName] = useState('');
  const [customerAvatarUri, setCustomerAvatarUri] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [session, setSession] = useState<AuthSession | null>(null);
  const [profile, setProfile] = useState<CurrentUserProfile | null>(null);
  const [providerApplication, setProviderApplication] =
    useState<ProviderApplicationStatus | null>(null);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [services, setServices] = useState<CatalogServiceItem[]>([]);
  const [providers, setProviders] = useState<ProviderListing[]>([]);
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [payments, setPayments] = useState<PaymentSummary[]>([]);
  const [pendingCheckout, setPendingCheckout] = useState<{
    checkoutId: string;
    bookingId: string;
  } | null>(null);
  const [customerPaymentMethods, setCustomerPaymentMethods] = useState<
    CustomerPaymentMethodSummary[]
  >([]);
  const [payoutAccount, setPayoutAccount] = useState<PayoutAccountSummary | null>(null);
  const [payoutMethods, setPayoutMethods] = useState<PayoutMethodSummary[]>([]);
  const [providerPayouts, setProviderPayouts] = useState<PayoutSummary[]>([]);
  const [referralSummary, setReferralSummary] = useState<ReferralSummary | null>(null);
  const [userPreferences, setUserPreferences] =
    useState<UserPreferenceSummary | null>(null);
  const [activeSessions, setActiveSessions] = useState<
    CurrentUserSessionSummary[]
  >([]);
  const [reviews, setReviews] = useState<ReviewSummary[]>([]);
  const [selectedBookingServiceUpdates, setSelectedBookingServiceUpdates] = useState<
    BookingServiceUpdateSummary[]
  >([]);
  const [selectedBookingTimelineEvents, setSelectedBookingTimelineEvents] = useState<
    BookingTimelineEventSummary[]
  >([]);
  const [selectedBookingTracking, setSelectedBookingTracking] =
    useState<BookingTrackingSnapshot | null>(null);
  const [selectedBookingDirections, setSelectedBookingDirections] =
    useState<GeoDirectionsRoute | null>(null);
  const [selectedNavigationOrigin, setSelectedNavigationOrigin] =
    useState<GeoRouteLocation | null>(null);
  const [navigationRouteError, setNavigationRouteError] = useState<string | null>(null);
  const [navigationRouteLoading, setNavigationRouteLoading] = useState(false);
  const [customerTrackingSheetLevel, setCustomerTrackingSheetLevel] =
    useState<CustomerTrackingSheetLevel>('peek');
  const [providerNavigationSheetLevel, setProviderNavigationSheetLevel] =
    useState<ProviderNavigationSheetLevel>('peek');
  const [selectedProviderPortfolioMedia, setSelectedProviderPortfolioMedia] = useState<
    ProviderPortfolioMediaSummary[]
  >([]);
  const [providerPortfolioMedia, setProviderPortfolioMedia] = useState<
    ProviderPortfolioMediaSummary[]
  >([]);
  const [availability, setAvailability] =
    useState<ProviderAvailabilitySchedule | null>(null);
  const [selectedProviderAvailability, setSelectedProviderAvailability] =
    useState<ProviderAvailabilitySchedule | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [selectedProviderCalendarDate, setSelectedProviderCalendarDate] =
    useState(defaultScheduledAt.slice(0, 10));
  const [bookingFilter, setBookingFilter] = useState<'active' | 'completed'>('active');
  const [customerGuideStep, setCustomerGuideStep] = useState(0);
  const [customerGuideDismissed, setCustomerGuideDismissed] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState('5');
  const [cancelReason, setCancelReason] = useState('');
  const [providerBookingTab, setProviderBookingTab] =
    useState<ProviderBookingTab>('upcoming');
  const [providerSearchQuery, setProviderSearchQuery] = useState('');
  const [marketplaceSearchQuery, setMarketplaceSearchQuery] = useState('');
  const [providerProfileTab, setProviderProfileTab] =
    useState<CustomerProviderProfileTab>('About');
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const lastPushRegistrationKey = useRef<string | null>(null);
  const reconcilingCheckoutRef = useRef(false);
  const payoutIdempotencyKeyRef = useRef<string | null>(null);
  const [providerPortfolioPhotoUri, setProviderPortfolioPhotoUri] = useState<string | null>(null);
  const [providerPortfolioPhotoUrl, setProviderPortfolioPhotoUrl] = useState<string | null>(null);
  const [editingPortfolioCaptionId, setEditingPortfolioCaptionId] =
    useState<string | null>(null);
  const [portfolioCaptionDraft, setPortfolioCaptionDraft] = useState('');
  const [ownReviews, setOwnReviews] = useState<ReviewSummary[]>([]);
  const [reviewReplyText, setReviewReplyText] = useState('');
  const [replyingToReviewId, setReplyingToReviewId] = useState<string | null>(null);
  const [providerDashboard, setProviderDashboard] = useState<ProviderDashboardSummary | null>(null);
  const [ownedServices, setOwnedServices] = useState<ProviderOwnedServiceSummary[]>([]);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editServiceTitle, setEditServiceTitle] = useState('');
  const [editServicePrice, setEditServicePrice] = useState('');
  const [newServiceTitle, setNewServiceTitle] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServicePricingMode, setNewServicePricingMode] = useState<'flat' | 'hourly'>('flat');
  const [showAddServiceForm, setShowAddServiceForm] = useState(false);
  const [providerCancelReason, setProviderCancelReason] = useState('');
  const [requestPayoutAmount, setRequestPayoutAmount] = useState('');
  const [selectedPayoutMethodId, setSelectedPayoutMethodId] = useState<string | null>(
    null,
  );
  const [newPayoutMethodType, setNewPayoutMethodType] =
    useState<PayoutMethodType>('bank');
  const [newPayoutAccountLabel, setNewPayoutAccountLabel] = useState('');
  const [newPayoutAccountName, setNewPayoutAccountName] = useState('');
  const [newPayoutAccountLast4, setNewPayoutAccountLast4] = useState('');
  const [selectedCustomerPaymentMethodId, setSelectedCustomerPaymentMethodId] =
    useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [notice, setNotice] = useState('Welcome to ServEase.');
  const [nowTick, setNowTick] = useState(() => Date.now());

  const selectedService = services.find((service) => service.id === selectedServiceId);
  const selectedProvider = providers.find(
    (provider) => provider.providerId === selectedProviderId,
  );
  const selectedBooking = bookings.find((booking) => booking.id === selectedBookingId);
  const selectedPayment = selectedBooking
    ? payments.find((payment) => payment.bookingId === selectedBooking.id)
    : null;
  const selectedReview = selectedBooking
    ? reviews.find((review) => review.bookingId === selectedBooking.id)
    : null;
  const selectedCustomerPaymentMethod =
    customerPaymentMethods.find(
      (method) => method.id === selectedCustomerPaymentMethodId,
    ) ??
    customerPaymentMethods.find((method) => method.isDefault) ??
    customerPaymentMethods[0] ??
    null;
  const role = profile?.user.role ?? 'customer';
  const appRole: AppRole = role === 'provider' ? 'provider' : 'customer';
  const payoutTotal =
    payoutAccount?.availableBalance ?? providerPayoutTotal(payments);
  const canConfirmAccountDeletion =
    Boolean(profile?.user.email) && deleteConfirmText.trim() === profile?.user.email;
  const apiOptions = useMemo(
    () => ({
      baseUrl: apiBaseUrl,
      token: session?.accessToken,
    }),
    [apiBaseUrl, session?.accessToken],
  );
  const customerBookingFlow = useCustomerBookingFlowViewModel({
    apiOptions,
    hasSession: Boolean(session),
    onBookingCreated: (booking) => {
      setBookings((current) => [booking, ...current]);
      setSelectedBookingId(booking.id);
      void refreshBookingTimelineEvents(booking.id);
    },
    onRefreshProviderAvailability: (providerId) => {
      void refreshSelectedProviderAvailability(providerId);
    },
    selectedBooking: selectedBooking ?? null,
    selectedCustomerPaymentMethod,
    selectedProvider: selectedProvider ?? null,
    selectedService: selectedService ?? null,
    setBusyAction,
    setNotice,
    setRoute,
  });
  const messagesFlow = useMessagesFlowViewModel({
    apiOptions,
    appRole,
    hasSession: Boolean(session),
    isMessagesScreen: route.screen === 'messages',
    selectedBooking: selectedBooking ?? null,
    setBusyAction,
    setNotice,
    setRoute: (nextRoute) => setRoute(nextRoute),
    uploadMessageAttachment: (onUploaded) =>
      pickAndUploadImage('message_attachment', onUploaded),
  });
  const supportFlow = useSupportFlowViewModel({
    apiOptions,
    hasSession: Boolean(session),
    selectedBooking: selectedBooking ?? null,
    setBusyAction,
    setNotice,
    setRoute,
  });
  const providerLiveLocation = useProviderLiveLocation({
    enabled: Boolean(
      session?.accessToken &&
        selectedBookingId &&
        route.screen === 'providerNavigationMode',
    ),
    bookingId: selectedBookingId,
    apiOptions,
  });
  const loadCatalog = useStableCallback(loadCatalogImpl);
  const completeGoogleSignIn = useStableCallback(completeGoogleSignInImpl);
  const reconcilePendingCheckout = useStableCallback(
    reconcilePendingCheckoutImpl,
  );
  const routeFromNotificationPayload = useStableCallback(
    routeFromNotificationPayloadImpl,
  );
  const notificationsFlow = useNotificationsFlowViewModel({
    apiOptions,
    appRole,
    hasSession: Boolean(session),
    onRouteFromPayload: routeFromNotificationPayload,
    setBusyAction,
    setNotice,
  });
  const replaceNotifications = notificationsFlow.actions.replaceNotifications;
  const refreshBookingTracking = useStableCallback(refreshBookingTrackingImpl);
  const refreshProviderDirections = useStableCallback(
    refreshProviderDirectionsImpl,
  );
  const providerServiceFlow = useProviderServiceFlowViewModel({
    apiOptions,
    onBookingUpdated: replaceBooking,
    onRefreshBookingTimelineEvents: (bookingId) => {
      void refreshBookingTimelineEvents(bookingId);
    },
    onRefreshBookingTracking: (bookingId) => {
      void refreshBookingTracking(bookingId);
    },
    onServiceUpdateCreated: upsertBookingServiceUpdate,
    selectedBooking: selectedBooking ?? null,
    setBusyAction,
    setNotice,
    setProviderRoute: (screen) => setRoute({ role: 'provider', screen }),
    uploadProviderJobPhoto: (onUploaded) =>
      pickAndUploadImage('provider_progress', onUploaded),
  });

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    const liveLocation = providerLiveLocation.location;
    if (!selectedBookingId || !liveLocation) {
      return;
    }

    setSelectedNavigationOrigin({
      latitude: liveLocation.latitude,
      longitude: liveLocation.longitude,
    });
    setSelectedBookingTracking((current) =>
      current?.bookingId === selectedBookingId
        ? {
            ...current,
            providerLocation: liveLocation,
            lastUpdatedAt: liveLocation.updatedAt ?? current.lastUpdatedAt,
          }
        : current,
    );
  }, [selectedBookingId, providerLiveLocation.location]);

  useEffect(() => {
    payoutIdempotencyKeyRef.current = null;
  }, [requestPayoutAmount, selectedPayoutMethodId, session?.accessToken]);

  useEffect(() => {
    setProfileFullName(profile?.user.fullName ?? '');
    setProfileContactNumber(profile?.user.contactNumber ?? '');
    setProfileAddress(profile?.customerProfile?.address ?? '');
    setProfileBusinessName(profile?.providerProfile?.businessName ?? '');
  }, [profile]);

  useEffect(() => {
    if (route.screen !== 'providerServiceInProgress') {
      return undefined;
    }

    const timer = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [route.screen]);

  useEffect(() => {
    if (!session?.accessToken) {
      return undefined;
    }
    const tick = async () => {
      try {
        const [nextNotifications, nextBookings] = await Promise.all([
          listNotifications(apiOptions),
          appRole === 'provider'
            ? listProviderBookings(apiOptions)
            : listCustomerBookings(apiOptions),
        ]);
        replaceNotifications(nextNotifications);
        setBookings(nextBookings);
      } catch {
        // ignore poll errors to avoid noisy notices
      }
    };
    const interval = setInterval(() => void tick(), 30000);
    return () => clearInterval(interval);
  }, [session?.accessToken, appRole, apiOptions, replaceNotifications]);

  useEffect(() => {
    if (!session?.accessToken || !userPreferences) {
      return;
    }

    const registrationKey = `${session.accessToken}:${userPreferences.pushNotificationsEnabled}`;
    if (lastPushRegistrationKey.current === registrationKey) {
      return;
    }
    lastPushRegistrationKey.current = registrationKey;

    void syncExpoPushRegistration(
      userPreferences.pushNotificationsEnabled,
      apiOptions,
      Platform.OS,
    ).catch(() => {
      lastPushRegistrationKey.current = null;
    });
  }, [session?.accessToken, userPreferences, apiOptions]);

  useEffect(() => {
    const maybeExchangeGoogleCallback = (url?: string | null) => {
      if (!url?.startsWith('servease://auth/google/callback')) {
        return;
      }

      try {
        const callbackUrl = new URL(url);
        const error = callbackUrl.searchParams.get('error');
        const code = callbackUrl.searchParams.get('code');
        const state = callbackUrl.searchParams.get('state');
        if (error) {
          setNotice(`Google authorization failed: ${error}.`);
          return;
        }
        if (!code) {
          setNotice('Google authorization did not include a code.');
          return;
        }
        void completeGoogleSignIn(code, state);
      } catch {
        setNotice('Google authorization callback could not be read.');
      }
    };

    void Linking.getInitialURL().then(maybeExchangeGoogleCallback);
    const linkingSubscription = Linking.addEventListener('url', ({ url }) =>
      maybeExchangeGoogleCallback(url),
    );

    return () => {
      linkingSubscription.remove();
    };
  }, [completeGoogleSignIn]);

  useEffect(() => {
    if (!session?.accessToken || !pendingCheckout) {
      return undefined;
    }

    const maybeReconcile = (url?: string) => {
      if (
        !url ||
        url.includes('servease://payment/success') ||
        url.includes('servease://payment/cancel')
      ) {
        void reconcilePendingCheckout();
      }
    };

    const linkingSubscription = Linking.addEventListener('url', ({ url }) =>
      maybeReconcile(url),
    );
    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        maybeReconcile();
      }
    });

    return () => {
      linkingSubscription.remove();
      appStateSubscription.remove();
    };
  }, [session?.accessToken, pendingCheckout, reconcilePendingCheckout]);

  useEffect(() => {
    const trackingScreens: AppScreen[] = [
      'customerTrackServiceProvider',
      'providerNavigationMode',
    ];
    if (
      !session?.accessToken ||
      !selectedBookingId ||
      !trackingScreens.includes(route.screen)
    ) {
      return undefined;
    }
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
    let pollInterval: ReturnType<typeof setInterval> | null = null;
    let receivedStreamSnapshot = false;

    const startPollingFallback = () => {
      if (pollInterval) {
        return;
      }

      void refreshBookingTracking(selectedBookingId);
      pollInterval = setInterval(
        () => void refreshBookingTracking(selectedBookingId),
        TRACKING_FALLBACK_POLL_INTERVAL_MS,
      );
    };

    const subscription = subscribeBookingTrackingSnapshots(
      selectedBookingId,
      apiOptions,
      {
        onSnapshot: (snapshot) => {
          receivedStreamSnapshot = true;
          if (fallbackTimer) {
            clearTimeout(fallbackTimer);
            fallbackTimer = null;
          }
          if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
          }
          setSelectedBookingTracking(snapshot);
        },
        onError: startPollingFallback,
      },
    );

    fallbackTimer = setTimeout(() => {
      if (!receivedStreamSnapshot) {
        startPollingFallback();
      }
    }, TRACKING_STREAM_FALLBACK_DELAY_MS);

    return () => {
      subscription.close();
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [
    apiOptions,
    session?.accessToken,
    selectedBookingId,
    route.screen,
    refreshBookingTracking,
  ]);

  useEffect(() => {
    if (
      !session?.accessToken ||
      !selectedBookingId ||
      route.screen !== 'providerNavigationMode'
    ) {
      setSelectedBookingDirections(null);
      setSelectedNavigationOrigin(null);
      setNavigationRouteError(null);
      return;
    }

    void refreshProviderDirections(selectedBookingId);
  }, [
    session?.accessToken,
    selectedBookingId,
    route.screen,
    refreshProviderDirections,
  ]);

  async function loadCatalogImpl() {
    setBusyAction('catalog');
    try {
      const nextCategories = await listCatalogCategories({ baseUrl: apiBaseUrl });
      const firstCategoryId = nextCategories[0]?.id ?? null;
      setCategories(nextCategories);
      setSelectedCategoryId(firstCategoryId);
      await loadServices(firstCategoryId);
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function loadServices(categoryId: string | null) {
    const nextServices = await listCatalogServices(categoryId, { baseUrl: apiBaseUrl });
    const firstServiceId = nextServices[0]?.id ?? null;
    setServices(nextServices);
    setSelectedServiceId(firstServiceId);
    await loadProviders(firstServiceId);
  }

  async function loadProviders(serviceId: string | null) {
    const nextProviders = await listProviderListings(serviceId, { baseUrl: apiBaseUrl });
    setProviders(nextProviders);
    setSelectedProviderId(nextProviders[0]?.providerId ?? null);
    if (nextProviders[0]?.providerId) {
      await refreshProviderReviews(nextProviders[0].providerId);
      await refreshSelectedProviderAvailability(nextProviders[0].providerId);
      await refreshSelectedProviderPortfolio(nextProviders[0].providerId);
    } else {
      setSelectedProviderAvailability(null);
      setSelectedProviderPortfolioMedia([]);
    }
  }

  function selectProvider(provider: ProviderListing) {
    setSelectedProviderId(provider.providerId);
    setSelectedServiceId(provider.serviceId);
    void refreshProviderReviews(provider.providerId);
    void refreshSelectedProviderAvailability(provider.providerId);
    void refreshSelectedProviderPortfolio(provider.providerId);
  }

  async function refreshProviderReviews(providerId: string) {
    try {
      setReviews(await listProviderReviews(providerId, { baseUrl: apiBaseUrl }));
    } catch {
      setReviews([]);
    }
  }

  async function refreshSelectedProviderAvailability(providerId: string) {
    setSelectedProviderAvailability(null);
    try {
      setSelectedProviderAvailability(
        await getPublicProviderAvailability(providerId, { baseUrl: apiBaseUrl }),
      );
    } catch {
      setSelectedProviderAvailability(null);
    }
  }

  async function refreshSelectedProviderPortfolio(providerId: string) {
    try {
      setSelectedProviderPortfolioMedia(
        await listProviderPortfolioMedia(providerId, { baseUrl: apiBaseUrl }),
      );
    } catch {
      setSelectedProviderPortfolioMedia([]);
    }
  }

  async function signIn(intendedRole: AppRole) {
    if (!email.trim() || !password) {
      setNotice('Enter an email and password.');
      return;
    }

    setBusyAction('sign-in');
    try {
      const nextSession = await signInWithPassword({
        supabaseUrl,
        publishableKey,
        email,
        password,
      });
      const nextProfile = await getCurrentUser({
        baseUrl: apiBaseUrl,
        token: nextSession.accessToken,
      });
      const nextRole: AppRole = nextProfile.user.role === 'provider' ? 'provider' : 'customer';

      setSession(nextSession);
      setProfile(nextProfile);
      setPassword('');
      setRoute({
        role: nextRole,
        screen: nextRole === 'provider' ? 'home' : 'explore',
      });
      setNotice(
        intendedRole !== nextRole
          ? `Signed in as ${roleLabel(nextRole)}.`
          : `Welcome back, ${nextProfile.user.fullName ?? nextProfile.user.email}.`,
      );
      await refreshWorkspace(
        nextSession.accessToken,
        nextRole,
        nextProfile.providerProfile?.id ?? null,
      );
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function signUp(intendedRole: AppRole) {
    if (!email.trim() || !password || !signupFullName.trim()) {
      setNotice('Enter your name, email, and password.');
      return;
    }

    if (intendedRole === 'provider' && !signupBusinessName.trim()) {
      setNotice('Enter your business name.');
      return;
    }

    setBusyAction('sign-up');
    try {
      await registerAccount(
        {
          role: intendedRole,
          email: email.trim(),
          password,
          fullName: signupFullName.trim(),
          contactNumber: signupContactNumber.trim() || null,
          address: intendedRole === 'customer' ? signupAddress.trim() || null : null,
          businessName:
            intendedRole === 'provider'
              ? signupBusinessName.trim()
              : null,
          serviceArea:
            intendedRole === 'provider'
              ? signupServiceArea.trim() || null
              : null,
          serviceDescription:
            intendedRole === 'provider'
              ? signupServiceDescription.trim() || null
              : null,
        },
        { baseUrl: apiBaseUrl },
      );

      const nextSession = await signInWithPassword({
        supabaseUrl,
        publishableKey,
        email: email.trim(),
        password,
      });
      const nextProfile = await getCurrentUser({
        baseUrl: apiBaseUrl,
        token: nextSession.accessToken,
      });
      const nextRole: AppRole = nextProfile.user.role === 'provider' ? 'provider' : 'customer';

      setSession(nextSession);
      setProfile(nextProfile);
      setPassword('');
      setSignupFullName('');
      setSignupContactNumber('');
      setSignupAddress('');
      setSignupBusinessName('');
      setSignupServiceArea('');
      setSignupServiceDescription('');
      setRoute({
        role: nextRole,
        screen: nextRole === 'provider' ? 'home' : 'explore',
      });
      setNotice(`Welcome to ServEase, ${nextProfile.user.fullName ?? nextProfile.user.email}.`);
      await refreshWorkspace(
        nextSession.accessToken,
        nextRole,
        nextProfile.providerProfile?.id ?? null,
      );
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function sendPasswordReset() {
    if (!email.trim()) {
      setNotice('Enter your email address first.');
      return;
    }

    setBusyAction('password-reset');
    try {
      await requestPasswordReset(
        {
          email: email.trim(),
        },
        { baseUrl: apiBaseUrl },
      );
      setNotice('If an account exists, password reset instructions were sent.');
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function completeGoogleSignInImpl(code: string, state: string | null) {
    setBusyAction('google-auth');
    try {
      await exchangeGoogleCode(
        {
          code,
          redirectUri: 'servease://auth/google/callback',
        },
        { baseUrl: apiBaseUrl },
      );
      if (state === 'provider' || state === 'customer') {
        navigate(state === 'provider' ? 'providerLogin' : 'customerLogin', state);
      }
      setNotice(
        'Google account verified through APICenter. Continue with your ServEase password to finish signing in.',
      );
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function startGoogleSignIn(intendedRole: AppRole) {
    setBusyAction('google-auth');
    try {
      const authorization = await getGoogleAuthorizationUrl(
        {
          redirectUri: 'servease://auth/google/callback',
          state: intendedRole,
          scopes: ['openid', 'email', 'profile'],
          accessType: 'offline',
          prompt: 'consent',
          loginHint: email.trim() || undefined,
          includeGrantedScopes: true,
        },
        { baseUrl: apiBaseUrl },
      );
      await Linking.openURL(authorization.authorizationUrl);
      setNotice('Google authorization opened. Return to ServEase after signing in.');
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function requestPhoneOtp(target: string): Promise<string | null> {
    const normalized = target.trim();
    if (!normalized) {
      setNotice('Enter your phone number first.');
      return null;
    }

    setBusyAction('otp-generate');
    try {
      const otp = await generateOtp(
        {
          target: normalized,
          channel: 'sms',
          length: 6,
          expiresInSeconds: 300,
        },
        { baseUrl: apiBaseUrl },
      );
      setNotice(`OTP sent to ${otp.target}.`);
      return otp.otpId;
    } catch (error) {
      setNotice(readError(error));
      return null;
    } finally {
      setBusyAction(null);
    }
  }

  async function verifyPhoneOtp(otpId: string, code: string): Promise<boolean> {
    if (!code.trim()) {
      setNotice('Enter the OTP code first.');
      return false;
    }

    setBusyAction('otp-verify');
    try {
      const result = await verifyOtp(otpId, code.trim(), { baseUrl: apiBaseUrl });
      setNotice(
        result.valid
          ? 'Phone OTP verified. Continue with password login.'
          : 'Phone OTP was not accepted.',
      );
      return result.valid;
    } catch (error) {
      setNotice(readError(error));
      return false;
    } finally {
      setBusyAction(null);
    }
  }

  function signOut() {
    setSession(null);
    setProfile(null);
    setProviderApplication(null);
    setBookings([]);
    messagesFlow.actions.clear();
    setPayments([]);
    setCustomerPaymentMethods([]);
    setPayoutAccount(null);
    setPayoutMethods([]);
    setProviderPayouts([]);
    setReferralSummary(null);
    setUserPreferences(null);
    setActiveSessions([]);
    supportFlow.actions.clear();
    notificationsFlow.actions.clear();
    providerServiceFlow.actions.clear();
    setSelectedBookingServiceUpdates([]);
    setSelectedBookingTimelineEvents([]);
    setSelectedProviderPortfolioMedia([]);
    setProviderPortfolioMedia([]);
    setAvailability(null);
    setSelectedBookingId(null);
    setSelectedCustomerPaymentMethodId(null);
    setPendingCheckout(null);
    customerBookingFlow.actions.setAddress('');
    customerBookingFlow.actions.setPromoCode('');
    customerBookingFlow.actions.setPromotionValidation(null);
    setCurrentPassword('');
    setNewPassword('');
    setRoute({ role: null, screen: 'authGate' });
    setNotice('Signed out.');
  }

  async function deleteMyAccount() {
    if (!session) {
      setNotice('Sign in before deleting your account.');
      return;
    }

    setBusyAction('delete-account');
    try {
      await deleteCurrentUserAccount(apiOptions);
      signOut();
      setNotice('Account deleted.');
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function saveProfile() {
    if (!session) {
      setNotice('Sign in before updating your profile.');
      return;
    }

    if (!profileFullName.trim()) {
      setNotice('Enter your full name.');
      return;
    }

    if (appRole === 'provider' && !profileBusinessName.trim()) {
      setNotice('Enter your business name.');
      return;
    }

    setBusyAction('profile-update');
    try {
      const updatedProfile = await updateCurrentUserProfile(
        {
          fullName: profileFullName.trim(),
          contactNumber: profileContactNumber.trim() || null,
          address: appRole === 'customer' ? profileAddress.trim() || null : null,
          businessName:
            appRole === 'provider'
              ? profileBusinessName.trim()
              : null,
        },
        apiOptions,
      );
      setProfile(updatedProfile);
      setNotice('Profile updated.');
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function savePassword() {
    if (!session) {
      setNotice('Sign in before changing your password.');
      return;
    }

    if (!currentPassword || newPassword.length < 8) {
      setNotice('Enter your current password and a new password with at least 8 characters.');
      return;
    }

    if (currentPassword === newPassword) {
      setNotice('Choose a new password that is different from your current password.');
      return;
    }

    setBusyAction('password-change');
    try {
      await updateCurrentUserPassword(
        {
          currentPassword,
          newPassword,
        },
        apiOptions,
      );
      setCurrentPassword('');
      setNewPassword('');
      setNotice('Password updated.');
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function startTwoFactorSetup() {
    if (!session) {
      setNotice('Sign in before updating security settings.');
      return;
    }

    setBusyAction('two-factor-enable');
    try {
      const setup = await enableCurrentUserTwoFactor(apiOptions);
      setTwoFactorSecret(setup.secret);
      setNotice('Scan the QR code from a web account screen or enter the secret in your authenticator app.');
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function verifyTwoFactorSetup() {
    if (!twoFactorCode.trim()) {
      setNotice('Enter your 6-digit authenticator code.');
      return;
    }

    setBusyAction('two-factor-verify');
    try {
      const result = await verifyCurrentUserTwoFactor(twoFactorCode, apiOptions);
      setTwoFactorEnabled(result.enabled);
      setTwoFactorSecret('');
      setTwoFactorCode('');
      setNotice('Two-factor authentication enabled.');
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function disableTwoFactorSetup() {
    if (!twoFactorCode.trim()) {
      setNotice('Enter your current authenticator code.');
      return;
    }

    setBusyAction('two-factor-disable');
    try {
      await disableCurrentUserTwoFactor(twoFactorCode, apiOptions);
      setTwoFactorEnabled(false);
      setTwoFactorCode('');
      setNotice('Two-factor authentication disabled.');
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function savePreferences(
    patch: {
      pushNotificationsEnabled?: boolean;
      darkModeEnabled?: boolean;
      language?: 'en' | 'fil';
      notificationPreferences?: Record<string, unknown>;
    },
  ) {
    if (!session) {
      setNotice('Sign in before updating settings.');
      return;
    }

    setBusyAction('preferences');
    try {
      const updated = await updateUserPreferences(patch, apiOptions);
      setUserPreferences(updated);
      setPushNotificationsEnabled(updated.pushNotificationsEnabled);
      setDarkModeEnabled(updated.darkModeEnabled);
      setNotice('Settings updated.');
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function refreshWorkspace(
    token = session?.accessToken,
    nextRole = appRole,
    providerId = profile?.providerProfile?.id ?? null,
  ) {
    if (!token) {
      setNotice('Sign in before refreshing.');
      return;
    }

    setBusyAction('refresh');
    try {
      const options = { baseUrl: apiBaseUrl, token };
      const [
        nextBookings,
        nextConversations,
        nextPayments,
        nextCustomerPaymentMethods,
        nextTickets,
        nextNotifications,
        nextAvailability,
        nextPayoutAccount,
        nextPayoutMethods,
        nextProviderPayouts,
        nextProviderPortfolio,
        nextReferralSummary,
        nextUserPreferences,
        nextOwnReviews,
        nextProviderDashboard,
        nextOwnedServices,
        nextSessions,
        nextProviderApplication,
      ] = await Promise.all([
        nextRole === 'provider'
          ? listProviderBookings(options)
          : listCustomerBookings(options),
        listConversations(options),
        listPayments(options),
        nextRole === 'customer'
          ? listCustomerPaymentMethods(options).catch(() => [])
          : Promise.resolve([]),
        listSupportTickets(options),
        listNotifications(options),
        nextRole === 'provider'
          ? getProviderAvailability(options).catch(() => null)
          : Promise.resolve(null),
        nextRole === 'provider'
          ? getProviderPayoutAccount(options).catch(() => null)
          : Promise.resolve(null),
        nextRole === 'provider'
          ? listProviderPayoutMethods(options).catch(() => [])
          : Promise.resolve([]),
        nextRole === 'provider'
          ? listProviderPayouts(options).catch(() => [])
          : Promise.resolve([]),
        nextRole === 'provider' && providerId
          ? listProviderPortfolioMedia(providerId, options).catch(() => [])
          : Promise.resolve([]),
        nextRole === 'customer'
          ? getReferralSummary(options).catch(() => null)
          : Promise.resolve(null),
        getUserPreferences(options).catch(() => null),
        nextRole === 'provider' && providerId
          ? listProviderReviews(providerId, options).catch(() => [])
          : Promise.resolve([]),
        nextRole === 'provider'
          ? getProviderDashboard(options).catch(() => null)
          : Promise.resolve(null),
        nextRole === 'provider'
          ? listProviderOwnedServices(options).catch(() => [])
          : Promise.resolve([]),
        listCurrentUserSessions(options).catch(() => []),
        nextRole === 'provider'
          ? getMyProviderApplication(options).catch(() => null)
          : Promise.resolve(null),
      ]);

      setBookings(nextBookings);
      messagesFlow.actions.replaceConversations(nextConversations);
      setPayments(nextPayments);
      setCustomerPaymentMethods(nextCustomerPaymentMethods);
      setPayoutAccount(nextPayoutAccount);
      setPayoutMethods(nextPayoutMethods);
      setProviderPayouts(nextProviderPayouts);
      setReferralSummary(nextReferralSummary);
      setUserPreferences(nextUserPreferences);
      if (nextUserPreferences) {
        setPushNotificationsEnabled(nextUserPreferences.pushNotificationsEnabled);
        setDarkModeEnabled(nextUserPreferences.darkModeEnabled);
      }
      setProviderPortfolioMedia(nextProviderPortfolio);
      setOwnReviews(nextOwnReviews as ReviewSummary[]);
      setProviderDashboard(nextProviderDashboard as ProviderDashboardSummary | null);
      setOwnedServices(nextOwnedServices as ProviderOwnedServiceSummary[]);
      setActiveSessions(nextSessions);
      setProviderApplication(nextProviderApplication);
      setSelectedPayoutMethodId((current) => {
        if (current && nextPayoutMethods.some((method) => method.id === current)) {
          return current;
        }
        return (
          nextPayoutMethods.find((method) => method.isDefault)?.id ??
          nextPayoutMethods[0]?.id ??
          null
        );
      });
      setSelectedCustomerPaymentMethodId((current) => {
        if (
          current &&
          nextCustomerPaymentMethods.some((method) => method.id === current)
        ) {
          return current;
        }
        return (
          nextCustomerPaymentMethods.find((method) => method.isDefault)?.id ??
          nextCustomerPaymentMethods[0]?.id ??
          null
        );
      });
      supportFlow.actions.replaceTickets(nextTickets);
      notificationsFlow.actions.replaceNotifications(nextNotifications);
      setAvailability(nextAvailability);
      setSelectedBookingId((current) => current ?? nextBookings[0]?.id ?? null);
      setNotice(`${nextBookings.length} booking${nextBookings.length === 1 ? '' : 's'} loaded.`);
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function transitionSelectedBooking(
    nextStatus: BookingStatus,
    reason?: string | null,
  ) {
    if (!selectedBooking) {
      setNotice('Select a booking first.');
      return false;
    }

    setBusyAction(`booking-${nextStatus}`);
    try {
      const updated = await transitionBookingStatus(
        selectedBooking.id,
        buildBookingTransitionRequest(selectedBooking.status, nextStatus, reason),
        apiOptions,
      );
      replaceBooking(updated);
      void refreshBookingTimelineEvents(updated.id);
      void refreshBookingTracking(updated.id);
      setNotice(`Booking moved to ${statusLabel(updated.status)}.`);
      return true;
    } catch (error) {
      setNotice(readError(error));
      return false;
    } finally {
      setBusyAction(null);
    }
  }

  async function cancelSelectedProviderBooking() {
    const cancelled = await transitionSelectedBooking(
      'cancelled',
      providerCancelReason,
    );
    if (cancelled) {
      setProviderCancelReason('');
      setRoute({ role: 'provider', screen: 'bookings' });
    }
  }

  function mediaAttachmentFromUpload(upload: UploadSummary, caption?: string | null) {
    return {
      fileUrl: upload.publicUrl,
      fileName: upload.path.split('/').pop() ?? null,
      mimeType: upload.contentType,
      storagePath: upload.path,
      fileSize: upload.size,
      caption: caption ?? null,
    };
  }

  async function pickAndUploadImage(
    kind: UploadKind,
    onUploaded: (uri: string, upload: UploadSummary) => void | Promise<void>,
    options: { documentType?: string | null } = {},
  ) {
    if (!session) {
      setNotice('Sign in before uploading media.');
      setRoute({ role: null, screen: 'loginRole' });
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setNotice('Photo library permission is required to attach photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]?.uri) {
      return;
    }

    const asset = result.assets[0];
    const uri = asset.uri;
    const name = asset.fileName ?? uri.split('/').pop() ?? `servease-${kind}.jpg`;
    const contentType = asset.mimeType ?? 'image/jpeg';

    setBusyAction(`upload-${kind}`);
    try {
      const uploaded = await uploadMedia(
        {
          kind,
          uri,
          name,
          contentType,
          documentType: options.documentType ?? null,
        },
        apiOptions,
      );
      await onUploaded(uri, uploaded);
      setNotice('Media uploaded.');
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function uploadProviderGovernmentId() {
    await pickAndUploadImage(
      'provider_document',
      async () => {
        setProviderApplication(await getMyProviderApplication(apiOptions));
      },
      { documentType: 'government_id' },
    );
  }

  async function pickCustomerAvatar() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setNotice('Photo library permission is required to update your avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]?.uri) {
      return;
    }

    setCustomerAvatarUri(result.assets[0].uri);
    setNotice('Avatar updated on this device.');
  }

  function notifyMissingCustomerPhone() {
    setNotice('This booking does not include a customer phone number yet. Use Messages for now.');
  }

  async function callSelectedBookingCustomer() {
    if (!selectedBooking?.customerContactNumber) {
      notifyMissingCustomerPhone();
      return;
    }

    await Linking.openURL(`tel:${selectedBooking.customerContactNumber}`);
  }

  async function addSelectedBookingToCalendar() {
    if (!selectedBooking) {
      setNotice('Select a booking first.');
      return;
    }

    const calendarUrl = buildCalendarExportUrl({
      bookingReference: selectedBooking.bookingReference,
      serviceTitle: selectedBooking.serviceTitle,
      serviceAddress: selectedBooking.serviceAddress,
      scheduledAt: selectedBooking.scheduledAt,
    });

    if (!calendarUrl) {
      setNotice('This booking does not have a valid schedule yet.');
      return;
    }

    const canOpen = await Linking.canOpenURL(calendarUrl);
    if (!canOpen) {
      setNotice('No calendar app or browser is available for this booking.');
      return;
    }

    await Linking.openURL(calendarUrl);
  }

  async function reconcilePendingCheckoutImpl(
    checkout = pendingCheckout,
  ): Promise<void> {
    if (!checkout || !session?.accessToken || reconcilingCheckoutRef.current) {
      return;
    }

    reconcilingCheckoutRef.current = true;
    setBusyAction((current) => current ?? 'payment-status');
    try {
      const status = await getCheckoutStatus(checkout.checkoutId, apiOptions);
      const nextPayments = await listPayments(apiOptions).catch(() => payments);
      setPayments(nextPayments);

      const finalStatuses = [
        'paid',
        'failed',
        'cancelled',
        'expired',
        'refunded',
        'partially_refunded',
      ];
      if (finalStatuses.includes(status.status)) {
        setPendingCheckout((current) =>
          current?.checkoutId === checkout.checkoutId ? null : current,
        );
      }

      if (status.localPaymentStatus === 'paid' || status.status === 'paid') {
        setNotice('Checkout paid. Payment record updated.');
      } else if (status.status === 'created' || status.status === 'pending') {
        setNotice('Checkout is still pending.');
      } else {
        setNotice(`Checkout ${status.status}.`);
      }
    } catch (error) {
      setNotice(readError(error));
    } finally {
      reconcilingCheckoutRef.current = false;
      setBusyAction((current) => (current === 'payment-status' ? null : current));
    }
  }

  async function collectPayment() {
    if (!selectedBooking) {
      setNotice('Select a booking first.');
      return false;
    }

    setBusyAction('payment');
    try {
      const code = customerBookingFlow.data.promoCode.trim();
      let promoCodeForPayment: string | null = null;

      if (code) {
        const promotion = await validatePromotion(
          selectedBooking.id,
          code,
          apiOptions,
        );
        customerBookingFlow.actions.setPromotionValidation(promotion);

        if (!promotion.valid) {
          setNotice(promotion.message);
          return false;
        }

        promoCodeForPayment = promotion.code;
      }

      const methodType =
        selectedCustomerPaymentMethod?.methodType ?? 'cash_on_service';
      if (methodType !== 'cash_on_service') {
        const checkout = await createCheckoutSession(
          {
            bookingId: selectedBooking.id,
            successUrl: 'servease://payment/success',
            cancelUrl: 'servease://payment/cancel',
            promoCode: promoCodeForPayment,
            paymentMethods: [toSharedPaymentMethod(methodType)],
          },
          apiOptions,
        );
        setPendingCheckout({
          checkoutId: checkout.checkoutId,
          bookingId: selectedBooking.id,
        });
        await Linking.openURL(checkout.redirectUrl);
        setNotice('Secure checkout opened. Return after completing payment.');
      } else {
        const payment = await createPayment(
          {
            bookingId: selectedBooking.id,
            paymentMethod: methodType,
            promoCode: promoCodeForPayment,
          },
          apiOptions,
        );
        setPayments((current) => [
          payment,
          ...current.filter((item) => item.id !== payment.id),
        ]);
        setNotice(paymentNotice(payment));
      }
      return true;
    } catch (error) {
      setNotice(readError(error));
      return false;
    } finally {
      setBusyAction(null);
    }
  }

  async function submitProviderPayoutRequest() {
    const amount = Number(requestPayoutAmount);
    const methodId =
      selectedPayoutMethodId ??
      payoutMethods.find((method) => method.isDefault)?.id ??
      payoutMethods[0]?.id;

    if (!Number.isFinite(amount) || amount <= 0) {
      setNotice('Enter a valid payout amount.');
      return;
    }

    if (!methodId) {
      setNotice('Add a payout method before requesting a payout.');
      return;
    }

    if (payoutAccount && amount > payoutAccount.availableBalance) {
      setNotice('Amount exceeds available payout balance.');
      return;
    }

    setBusyAction('provider-payout');
    try {
      if (!payoutIdempotencyKeyRef.current) {
        payoutIdempotencyKeyRef.current = createProviderPayoutIdempotencyKey();
      }
      const payout = await requestProviderPayout(
        {
          amount,
          payoutMethodId: methodId,
        },
        {
          ...apiOptions,
          idempotencyKey: payoutIdempotencyKeyRef.current,
        },
      );
      setProviderPayouts((current) => [
        payout,
        ...current.filter((item) => item.id !== payout.id),
      ]);
      payoutIdempotencyKeyRef.current = null;
      setRequestPayoutAmount('');
      setNotice(`Payout ${payout.reference ?? payout.id.slice(0, 8)} requested.`);

      const [nextAccount, nextPayouts] = await Promise.all([
        getProviderPayoutAccount(apiOptions).catch(() => payoutAccount),
        listProviderPayouts(apiOptions).catch(() => [payout, ...providerPayouts]),
      ]);
      setPayoutAccount(nextAccount);
      setProviderPayouts(nextPayouts);
      setRoute({ role: 'provider', screen: 'providerPayoutManagement' });
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function saveNewPayoutMethod() {
    const label = newPayoutAccountLabel.trim();
    if (!label) {
      setNotice('Enter a payout method label.');
      return;
    }

    setBusyAction('save-payout-method');
    try {
      const method = await upsertProviderPayoutMethod(
        {
          methodType: newPayoutMethodType,
          accountLabel: label,
          accountName: newPayoutAccountName.trim() || null,
          accountNumberLast4: newPayoutAccountLast4.trim() || null,
          isDefault: payoutMethods.length === 0,
        },
        apiOptions,
      );
      const methods = await listProviderPayoutMethods(apiOptions).catch(
        () => [method, ...payoutMethods.filter((item) => item.id !== method.id)],
      );
      setPayoutMethods(methods);
      setSelectedPayoutMethodId(method.id);
      setNewPayoutAccountLabel('');
      setNewPayoutAccountName('');
      setNewPayoutAccountLast4('');
      setNotice(`${method.accountLabel} saved as payout method.`);
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function uploadProviderPortfolioMedia() {
    await pickAndUploadImage('provider_portfolio', async (uri, uploaded) => {
      const media = await addProviderPortfolioMedia(
        mediaAttachmentFromUpload(uploaded),
        apiOptions,
      );
      setProviderPortfolioPhotoUri(uri);
      setProviderPortfolioPhotoUrl(uploaded.publicUrl);
      setProviderPortfolioMedia((current) => [
        media,
        ...current.filter((item) => item.id !== media.id),
      ]);
      setSelectedProviderPortfolioMedia((current) => [
        media,
        ...current.filter((item) => item.id !== media.id),
      ]);
    });
  }

  async function removeProviderPortfolioMedia(mediaId: string) {
    setBusyAction(`portfolio-${mediaId}`);
    try {
      await deleteProviderPortfolioMedia(mediaId, apiOptions);
      setProviderPortfolioMedia((current) =>
        current.filter((item) => item.id !== mediaId),
      );
      setSelectedProviderPortfolioMedia((current) =>
        current.filter((item) => item.id !== mediaId),
      );
      setNotice('Portfolio media removed.');
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function saveProviderPortfolioCaption(media: ProviderPortfolioMediaSummary) {
    const caption = portfolioCaptionDraft.trim();
    setBusyAction(`portfolio-caption-${media.id}`);
    try {
      const updated = await updateProviderPortfolioMedia(
        media.id,
        {
          fileUrl: media.fileUrl,
          fileName: media.fileName,
          mimeType: media.mimeType,
          storagePath: media.storagePath,
          fileSize: media.fileSize,
          caption: caption || null,
        },
        apiOptions,
      );
      setProviderPortfolioMedia((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setSelectedProviderPortfolioMedia((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setEditingPortfolioCaptionId(null);
      setPortfolioCaptionDraft('');
      setNotice('Portfolio caption updated.');
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function moveProviderPortfolioMedia(mediaId: string, direction: -1 | 1) {
    const currentIndex = providerPortfolioMedia.findIndex((item) => item.id === mediaId);
    const targetIndex = currentIndex + direction;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= providerPortfolioMedia.length) {
      return;
    }

    const next = [...providerPortfolioMedia];
    const [moved] = next.splice(currentIndex, 1);
    next.splice(targetIndex, 0, moved);
    const items = next.map((item, index) => ({ id: item.id, sortOrder: index }));
    setProviderPortfolioMedia(next.map((item, index) => ({ ...item, sortOrder: index })));
    setBusyAction(`portfolio-order-${mediaId}`);
    try {
      const reordered = await reorderProviderPortfolio(items, apiOptions);
      setProviderPortfolioMedia(reordered);
      setNotice('Portfolio order updated.');
    } catch (error) {
      setProviderPortfolioMedia((current) =>
        [...current].sort(
          (left, right) =>
            left.sortOrder - right.sortOrder ||
            (left.createdAt ?? '').localeCompare(right.createdAt ?? ''),
        ),
      );
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function removeBookingAttachment(attachmentId: string) {
    if (!selectedBooking) {
      setNotice('Select a booking first.');
      return;
    }

    setBusyAction(`attachment-${attachmentId}`);
    try {
      await deleteBookingAttachment(selectedBooking.id, attachmentId, apiOptions);
      replaceBooking({
        ...selectedBooking,
        attachments: (selectedBooking.attachments ?? []).filter(
          (attachment) => attachment.id !== attachmentId,
        ),
      });
      setNotice('Booking attachment removed.');
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function reservePayment() {
    const reserved = selectedPayment ? true : await collectPayment();
    if (reserved && selectedBooking) {
      setRoute({ role: 'customer', screen: 'customerBookingConfirmation' });
    }
  }

  async function saveCustomerPaymentMethod(
    methodType: CustomerPaymentMethodType,
  ) {
    const existing = customerPaymentMethods.find(
      (method) => method.methodType === methodType,
    );
    const defaults: Record<
      CustomerPaymentMethodType,
      { label: string; brand: string | null; last4: string | null }
    > = {
      cash_on_service: {
        label: 'Cash on service',
        brand: 'Cash',
        last4: null,
      },
      card: {
        label: 'Card ending 4242',
        brand: 'Visa',
        last4: '4242',
      },
      gcash: {
        label: 'GCash wallet',
        brand: 'GCash',
        last4: null,
      },
      paymaya: {
        label: 'PayMaya wallet',
        brand: 'PayMaya',
        last4: null,
      },
    };

    setBusyAction(`customer-payment-${methodType}`);
    try {
      const method = await upsertCustomerPaymentMethod(
        {
          methodId: existing?.id ?? null,
          methodType,
          ...defaults[methodType],
          isDefault: true,
        },
        apiOptions,
      );
      const methods = await listCustomerPaymentMethods(apiOptions).catch(() => [
        method,
      ]);
      setCustomerPaymentMethods(methods);
      setSelectedCustomerPaymentMethodId(method.id);
      setNotice(`${method.label} selected.`);
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function removeCustomerPaymentMethod(methodId: string) {
    setBusyAction(`delete-customer-payment-${methodId}`);
    try {
      await deleteCustomerPaymentMethod(methodId, apiOptions);
      const methods = await listCustomerPaymentMethods(apiOptions);
      setCustomerPaymentMethods(methods);
      setSelectedCustomerPaymentMethodId(
        methods.find((method) => method.isDefault)?.id ?? methods[0]?.id ?? null,
      );
      setNotice('Payment method removed.');
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  function toSharedPaymentMethod(
    methodType: CustomerPaymentMethodType,
  ): SharedPaymentMethod {
    if (methodType === 'paymaya') {
      return 'maya';
    }
    if (methodType === 'gcash') {
      return 'gcash';
    }
    return 'card';
  }

  async function submitReview() {
    if (!selectedBooking) {
      setNotice('Select a completed booking first.');
      return;
    }

    setBusyAction('review');
    try {
      const review = await createReview(
        {
          bookingId: selectedBooking.id,
          rating: Number(rating) || 5,
          reviewText: reviewText.trim() || null,
        },
        apiOptions,
      );
      setReviews((current) => [review, ...current.filter((item) => item.id !== review.id)]);
      setReviewText('');
      setNotice('Review submitted.');
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function submitReviewReply() {
    if (!replyingToReviewId || !reviewReplyText.trim()) {
      setNotice('Select a review and enter a reply.');
      return;
    }
    setBusyAction('review-reply');
    try {
      await replyToReview(replyingToReviewId, reviewReplyText.trim(), apiOptions);
      setReviewReplyText('');
      setReplyingToReviewId(null);
      setNotice('Reply submitted.');
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function submitFlagReview(reviewId: string) {
    setBusyAction(`flag-review-${reviewId}`);
    try {
      await flagReview(reviewId, 'inappropriate', apiOptions);
      setNotice('Review flagged for admin review.');
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function saveOwnedServiceEdit() {
    if (!editingServiceId) return;
    const current = ownedServices.find((s) => s.id === editingServiceId);
    if (!current) return;
    setBusyAction('service-edit');
    try {
      const updated: ProviderOwnedServiceInput[] = ownedServices.map((s) =>
        s.id === editingServiceId
          ? { ...s, title: editServiceTitle.trim() || s.title, price: Number(editServicePrice) || s.price }
          : s,
      );
      const saved = await replaceProviderServices(updated, apiOptions);
      setOwnedServices(saved);
      setEditingServiceId(null);
      setNotice('Service updated.');
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function addOwnedService() {
    const title = newServiceTitle.trim();
    const priceValue = Number(newServicePrice);
    if (!title) {
      setNotice('Service title is required.');
      return;
    }
    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      setNotice('Enter a valid price.');
      return;
    }
    setBusyAction('service-add');
    try {
      const existing: ProviderOwnedServiceInput[] = ownedServices.map((s) => ({
        id: s.id,
        serviceId: s.serviceId ?? null,
        title: s.title,
        description: s.description ?? null,
        price: s.price,
        pricingMode: s.pricingMode,
        isActive: s.isActive,
      }));
      const newService: ProviderOwnedServiceInput = {
        title,
        price: priceValue,
        pricingMode: newServicePricingMode,
        isActive: true,
      };
      const saved = await replaceProviderServices([...existing, newService], apiOptions);
      setOwnedServices(saved);
      setNewServiceTitle('');
      setNewServicePrice('');
      setNewServicePricingMode('flat');
      setShowAddServiceForm(false);
      setNotice('Service added.');
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function toggleOwnedServiceActive(serviceId: string) {
    setBusyAction(`service-toggle-${serviceId}`);
    try {
      const updated: ProviderOwnedServiceInput[] = ownedServices.map((s) =>
        s.id === serviceId ? { ...s, isActive: !s.isActive } : s,
      );
      const saved = await replaceProviderServices(updated, apiOptions);
      setOwnedServices(saved);
      setNotice('Service updated.');
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function removeOwnedService(serviceId: string) {
    setBusyAction(`service-remove-${serviceId}`);
    try {
      const remaining: ProviderOwnedServiceInput[] = ownedServices
        .filter((s) => s.id !== serviceId)
        .map((s) => ({
          id: s.id,
          serviceId: s.serviceId ?? null,
          title: s.title,
          description: s.description ?? null,
          price: s.price,
          pricingMode: s.pricingMode,
          isActive: s.isActive,
        }));
      const saved = await replaceProviderServices(remaining, apiOptions);
      setOwnedServices(saved);
      setNotice('Service removed.');
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  function routeFromNotificationPayloadImpl(input: {
    type?: string | null;
    metadata?: Record<string, unknown> | null;
    data?: Record<string, unknown> | null;
  }) {
    const intent = resolveNotificationRoute({
      role: appRole,
      type: input.type,
      metadata: input.metadata,
      data: input.data,
    });

    if (intent.ticketId) {
      supportFlow.actions.openTicketFromNotification(intent.ticketId);
    }

    if (intent.conversationId) {
      void messagesFlow.actions.openConversationById(intent.conversationId);
    }

    if (intent.bookingId) {
      setSelectedBookingId(intent.bookingId);
      void refreshBookingServiceUpdates(intent.bookingId);
      void refreshBookingTimelineEvents(intent.bookingId);
      void refreshBookingTracking(intent.bookingId);
      if (!bookings.some((booking) => booking.id === intent.bookingId)) {
        void refreshWorkspace();
      }
    }

    navigate(intent.screen, intent.role);
  }

  function replaceBooking(booking: BookingSummary) {
    setBookings((current) =>
      current.map((item) => (item.id === booking.id ? booking : item)),
    );
  }

  async function refreshBookingServiceUpdates(bookingId: string) {
    try {
      setSelectedBookingServiceUpdates(
        await listBookingServiceUpdates(bookingId, apiOptions),
      );
    } catch {
      setSelectedBookingServiceUpdates([]);
    }
  }

  async function refreshBookingTimelineEvents(bookingId: string) {
    try {
      setSelectedBookingTimelineEvents(
        await listBookingTimelineEvents(bookingId, apiOptions),
      );
    } catch {
      setSelectedBookingTimelineEvents([]);
    }
  }

  async function refreshBookingTrackingImpl(bookingId: string) {
    try {
      setSelectedBookingTracking(
        await getBookingTrackingSnapshot(bookingId, apiOptions),
      );
    } catch {
      setSelectedBookingTracking(null);
    }
  }

  async function getCurrentNavigationLocation(): Promise<GeoRouteLocation> {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== Location.PermissionStatus.GRANTED) {
      throw new Error('location_permission_denied');
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  }

  async function refreshProviderDirectionsImpl(bookingId: string) {
    setNavigationRouteLoading(true);
    setNavigationRouteError(null);

    try {
      const tracking = await getBookingTrackingSnapshot(bookingId, apiOptions);
      setSelectedBookingTracking(tracking);

      if (!tracking.destinationLocation) {
        throw new Error('destination_unavailable');
      }

      const origin =
        providerLiveLocation.location ??
        tracking.providerLocation ??
        (await getCurrentNavigationLocation());
      setSelectedNavigationOrigin(origin);
      setSelectedBookingDirections(
        await getDirections(
          {
            origin,
            destination: tracking.destinationLocation,
            profile: 'driving-car',
            language: 'en',
          },
          apiOptions,
        ),
      );
    } catch (error) {
      setSelectedBookingDirections(null);
      setNavigationRouteError(
        error instanceof Error && error.message === 'location_permission_denied'
          ? 'Location permission is required for in-app directions.'
          : 'Directions are temporarily unavailable.',
      );
    } finally {
      setNavigationRouteLoading(false);
    }
  }

  function upsertBookingServiceUpdate(update: BookingServiceUpdateSummary) {
    setSelectedBookingServiceUpdates((current) => [
      update,
      ...current.filter((item) => item.id !== update.id),
    ]);
  }

  function navigate(screen: AppScreen, nextRole = route.role) {
    setNotice('');
    setRoute({ role: nextRole, screen });
  }

  function openBooking(booking: BookingSummary, screen: AppScreen) {
    setSelectedBookingId(booking.id);
    void refreshBookingServiceUpdates(booking.id);
    void refreshBookingTimelineEvents(booking.id);
    void refreshBookingTracking(booking.id);
    navigate(screen, appRole);
  }

  function renderAuth() {
    return (
      <AuthScreens
        screen={route.screen}
        email={email}
        password={password}
        signupFullName={signupFullName}
        signupContactNumber={signupContactNumber}
        signupAddress={signupAddress}
        signupBusinessName={signupBusinessName}
        signupServiceArea={signupServiceArea}
        signupServiceDescription={signupServiceDescription}
        notice={notice}
        busyAction={busyAction}
        setEmail={setEmail}
        setPassword={setPassword}
        setSignupFullName={setSignupFullName}
        setSignupContactNumber={setSignupContactNumber}
        setSignupAddress={setSignupAddress}
        setSignupBusinessName={setSignupBusinessName}
        setSignupServiceArea={setSignupServiceArea}
        setSignupServiceDescription={setSignupServiceDescription}
        setNotice={setNotice}
        navigate={navigate}
        signIn={signIn}
        signUp={signUp}
        requestPasswordReset={sendPasswordReset}
        startGoogleSignIn={startGoogleSignIn}
        requestPhoneOtp={requestPhoneOtp}
        verifyPhoneOtp={verifyPhoneOtp}
      />
    );
  }

  function renderCustomerExplore() {
    return (
      <CustomerExploreScreen
        bookings={bookings}
        categories={categories}
        customerGuideDismissed={customerGuideDismissed}
        customerGuideStep={customerGuideStep}
        profile={profile}
        providers={providers}
        selectedCategoryId={selectedCategoryId}
        selectedProviderId={selectedProviderId}
        selectedServiceId={selectedServiceId}
        services={services}
        unreadCount={notificationsFlow.data.unreadCount}
        onDismissGuide={() => setCustomerGuideDismissed(true)}
        onNextGuideStep={() =>
          setCustomerGuideStep((current) => (current + 1) % 3)
        }
        onOpenBooking={(booking) => openBooking(booking, 'customerBookingDetail')}
        onSearch={() => navigate('customerSearchResults', 'customer')}
        onSelectCategory={(category) => {
          setSelectedCategoryId(category.id);
          void loadServices(category.id);
          navigate('customerCategory', 'customer');
        }}
        onSelectProvider={(provider) => {
          selectProvider(provider);
          navigate('customerProviderProfile', 'customer');
        }}
        onSelectService={(service) => {
          setSelectedServiceId(service.id);
          void loadProviders(service.id);
          navigate('customerTopProviders', 'customer');
        }}
        onShowNotifications={() => navigate('customerNotifications', 'customer')}
        onShowRecentBookings={() => {
          setBookingFilter('completed');
          navigate('bookings', 'customer');
        }}
        onViewAllServices={() => navigate('customerAllServices', 'customer')}
        onViewTopProviders={() => navigate('customerTopProviders', 'customer')}
      />
    );
  }

  function renderBookingReview() {
    if (!selectedProvider) {
      return <MissingSelection onBack={() => navigate('customerTopProviders', 'customer')} />;
    }

    return (
      <CustomerBookingReviewScreen
        provider={selectedProvider}
        selectedService={selectedService ?? null}
        hoursRequired={customerBookingFlow.data.hoursRequired}
        scheduledAt={customerBookingFlow.data.scheduledAt}
        address={customerBookingFlow.data.address}
        notes={customerBookingFlow.data.notes}
        bookingReferencePhotoUrl={customerBookingFlow.data.bookingReferencePhotoUrl}
        pricingQuote={customerBookingFlow.data.pricingQuote}
        promotionValidation={customerBookingFlow.data.promotionValidation}
        promoCode={customerBookingFlow.data.promoCode}
        busyAction={busyAction}
        onBack={() => navigate('customerBookingForm', 'customer')}
        onViewProvider={() => navigate('customerProviderProfile', 'customer')}
        onConfirm={() => void customerBookingFlow.actions.submitBooking()}
        onPreviewEstimate={() => void customerBookingFlow.actions.previewPricingQuote()}
        onEditBooking={() => navigate('customerBookingForm', 'customer')}
      />
    );
  }

  function renderCustomerCategory() {
    return (
      <CustomerCategoryScreen
        categories={categories}
        providers={providers}
        selectedCategoryId={selectedCategoryId}
        services={services}
        onBack={() => navigate('explore', 'customer')}
        onOpenService={(service) => {
          setSelectedServiceId(service.id);
          void loadProviders(service.id);
          navigate('customerTopProviders', 'customer');
        }}
      />
    );
  }

  function renderCustomerAllServices(title: string) {
    return (
      <CustomerAllServicesScreen
        title={title}
        services={services}
        marketplaceSearchQuery={marketplaceSearchQuery}
        onBack={() => navigate('explore', 'customer')}
        onSearchQueryChange={setMarketplaceSearchQuery}
        onOpenService={(service) => {
          setSelectedServiceId(service.id);
          void loadProviders(service.id);
          navigate('customerTopProviders', 'customer');
        }}
      />
    );
  }

  function renderCustomerTopProviders() {
    return (
      <CustomerTopProvidersScreen
        providers={providers}
        marketplaceSearchQuery={marketplaceSearchQuery}
        onBack={() => navigate('explore', 'customer')}
        onSearchQueryChange={setMarketplaceSearchQuery}
        onOpenProvider={(provider) => {
          selectProvider(provider);
          navigate('customerProviderProfile', 'customer');
        }}
      />
    );
  }

  function renderCustomerProviderProfile() {
    if (!selectedProvider) {
      return <MissingSelection onBack={() => navigate('customerTopProviders', 'customer')} />;
    }

    return (
      <CustomerProviderProfileScreen
        provider={selectedProvider}
        portfolioMedia={selectedProviderPortfolioMedia}
        availability={selectedProviderAvailability}
        reviews={reviews}
        selectedTab={providerProfileTab}
        isAuthenticated={Boolean(session)}
        busyAction={busyAction}
        onBack={() => navigate('customerTopProviders', 'customer')}
        onBook={() => navigate('customerBookingForm', 'customer')}
        onMessage={() => void messagesFlow.actions.openSelectedBookingConversation()}
        onTabChange={setProviderProfileTab}
        onFlagReview={(reviewId) => void submitFlagReview(reviewId)}
      />
    );
  }

  function renderCustomerBookingForm() {
    if (!selectedProvider) {
      return <MissingSelection onBack={() => navigate('customerTopProviders', 'customer')} />;
    }

    return (
      <CustomerBookingFormScreen
        provider={selectedProvider}
        providerAvailability={selectedProviderAvailability}
        scheduledAt={customerBookingFlow.data.scheduledAt}
        hoursRequired={customerBookingFlow.data.hoursRequired}
        timeSlots={bookingTimeSlots}
        bookingSlotError={customerBookingFlow.data.bookingSlotError}
        defaultScheduledAt={defaultScheduledAt}
        address={customerBookingFlow.data.address}
        addressGeoResult={customerBookingFlow.data.addressGeoResult}
        notes={customerBookingFlow.data.notes}
        bookingReferencePhotoUri={customerBookingFlow.data.bookingReferencePhotoUri}
        bookingReferencePhotoUrl={customerBookingFlow.data.bookingReferencePhotoUrl}
        busyAction={busyAction}
        onBack={() => navigate('customerProviderProfile', 'customer')}
        onContinue={() => navigate('customerBookingReview', 'customer')}
        onBackToProvider={() => navigate('customerProviderProfile', 'customer')}
        onScheduledAtChange={customerBookingFlow.actions.setScheduledAt}
        onBookingSlotErrorChange={customerBookingFlow.actions.setBookingSlotError}
        onUnavailableSlotPress={() =>
          setNotice('That time is outside the provider schedule.')
        }
        onAddressChange={customerBookingFlow.actions.setAddress}
        onHoursRequiredChange={customerBookingFlow.actions.setHoursRequired}
        onNotesChange={customerBookingFlow.actions.setNotes}
        onUseCurrentLocation={() =>
          void customerBookingFlow.actions.useCurrentServiceLocation()
        }
        onVerifyAddress={() => void customerBookingFlow.actions.verifyServiceAddress()}
        onUploadReferencePhoto={() =>
          void pickAndUploadImage('booking_reference', (uri, uploaded) => {
            customerBookingFlow.actions.setBookingReferenceUploadResult(
              uri,
              uploaded,
            );
          })
        }
      />
    );
  }

  function renderReservePayment() {
    if (!selectedBooking) {
      return <MissingSelection onBack={() => navigate('bookings', 'customer')} />;
    }

    return (
      <CustomerReservePaymentScreen
        customerPaymentMethods={customerPaymentMethods}
        selectedMethodId={selectedCustomerPaymentMethod?.id ?? null}
        selectedPayment={selectedPayment ?? null}
        promotionValidation={customerBookingFlow.data.promotionValidation}
        promoCode={customerBookingFlow.data.promoCode}
        busyAction={busyAction}
        onBack={() => navigate('customerBookingDetail', 'customer')}
        onSelectPaymentMethod={setSelectedCustomerPaymentMethodId}
        onSavePaymentMethod={saveCustomerPaymentMethod}
        onPromoCodeChange={(value) => {
          customerBookingFlow.actions.setPromoCode(value.toUpperCase());
          customerBookingFlow.actions.setPromotionValidation(null);
        }}
        onApplyPromotionCode={customerBookingFlow.actions.applyPromotionCode}
        onReservePayment={reservePayment}
      />
    );
  }

  function renderBookingConfirmation() {
    return (
      <CustomerBookingConfirmationScreen
        selectedBooking={selectedBooking ?? null}
        selectedProvider={selectedProvider}
        selectedPayment={selectedPayment ?? null}
        timelineEvents={
          <BookingTimelineEventsSection events={selectedBookingTimelineEvents} />
        }
        navigate={navigate}
        addSelectedBookingToCalendar={addSelectedBookingToCalendar}
        onMissingProvider={() => setNotice('Provider profile still loading.')}
      />
    );
  }

  function renderBookings() {
    return (
      <BookingsScreen
        bookings={bookings}
        bookingFilter={bookingFilter}
        role={appRole}
        busyAction={busyAction}
        setBookingFilter={setBookingFilter}
        refreshWorkspace={refreshWorkspace}
        openBooking={(booking) => openBooking(booking, 'customerBookingDetail')}
      />
    );
  }

  function renderCustomerCalendar() {
    return (
      <CustomerCalendarScreen
        bookings={bookings}
        onRefresh={refreshWorkspace}
        openBooking={(booking) => openBooking(booking, 'customerBookingDetail')}
      />
    );
  }

  function renderCustomerBookingDetail() {
    if (!selectedBooking) {
      return <MissingSelection onBack={() => navigate('bookings', 'customer')} />;
    }
    return (
      <CustomerBookingDetailScreen
        booking={selectedBooking}
        selectedProvider={selectedProvider ?? null}
        selectedPayment={selectedPayment ?? null}
        timelineEvents={
          <BookingTimelineEventsSection events={selectedBookingTimelineEvents} />
        }
        bookingMedia={
          <BookingMediaSection
            booking={selectedBooking}
            onRemoveAttachment={(attachmentId) =>
              void removeBookingAttachment(attachmentId)
            }
          />
        }
        serviceUpdates={
          <BookingServiceUpdatesSection updates={selectedBookingServiceUpdates} />
        }
        selectedReview={selectedReview ?? null}
        rating={rating}
        reviewText={reviewText}
        busyAction={busyAction}
        onBack={() => navigate('bookings', 'customer')}
        onViewProviderProfile={() => navigate('customerProviderProfile', 'customer')}
        onProviderProfileUnavailable={() => setNotice('Provider profile still loading.')}
        onTrackProvider={() => {
          void refreshBookingTracking(selectedBooking.id);
          navigate('customerTrackServiceProvider', 'customer');
        }}
        onManageBooking={() => navigate('customerBookingManage', 'customer')}
        onMessage={() => void messagesFlow.actions.openSelectedBookingConversation()}
        onReservePayment={() => navigate('customerReservePayment', 'customer')}
        onRatingChange={setRating}
        onReviewTextChange={setReviewText}
        onSubmitReview={() => void submitReview()}
      />
    );
  }

  function renderCustomerTrackServiceProvider(): ReactNode {
    if (!selectedBooking) {
      return <MissingSelection onBack={() => navigate('bookings', 'customer')} />;
    }

    return (
      <CustomerTrackProviderScreen
        booking={selectedBooking}
        trackingSnapshot={selectedBookingTracking ?? null}
        sheetLevel={customerTrackingSheetLevel}
        onSheetLevelChange={setCustomerTrackingSheetLevel}
        onClose={() => navigate('customerBookingDetail', 'customer')}
        onRefresh={() => void refreshBookingTracking(selectedBooking.id)}
        onMessage={() => void messagesFlow.actions.openSelectedBookingConversation()}
      />
    );
  }

  function renderManageBooking() {
    return (
      <CustomerManageBookingScreen
        status={selectedBooking?.status}
        onBack={() => navigate('customerBookingDetail', 'customer')}
        onMessage={() => void messagesFlow.actions.openSelectedBookingConversation()}
        onTrack={() => {
          if (selectedBooking) {
            void refreshBookingTracking(selectedBooking.id);
          }
          navigate('customerTrackServiceProvider', 'customer');
        }}
        onViewPayment={() => navigate('customerReservePayment', 'customer')}
        onReportIssue={() => navigate('customerBookingReport', 'customer')}
        onCancel={() => navigate('customerBookingCancel', 'customer')}
      />
    );
  }

  function renderCancelBooking() {
    return (
      <CustomerCancelBookingScreen
        cancelReason={cancelReason}
        selectedBookingStatus={selectedBooking?.status}
        appRole={appRole}
        onBack={() => navigate('customerBookingManage', 'customer')}
        onReasonChange={setCancelReason}
        onCancelBooking={async () => {
          await transitionSelectedBooking('cancelled', cancelReason);
          navigate('bookings', 'customer');
        }}
        onKeepBooking={() => navigate('customerBookingDetail', 'customer')}
      />
    );
  }

  function renderReportIssue() {
    return (
      <CustomerReportIssueScreen
        bookingReference={selectedBooking?.bookingReference ?? 'No booking selected'}
        busyAction={busyAction}
        desiredResolution={supportFlow.data.desiredResolution}
        reportEvidencePhotoUri={supportFlow.data.reportEvidencePhotoUri}
        reportEvidencePhotoUrl={supportFlow.data.reportEvidencePhotoUrl}
        supportMessage={supportFlow.data.supportMessage}
        supportSubject={supportFlow.data.supportSubject}
        onBack={() => navigate('customerBookingManage', 'customer')}
        onDesiredResolutionChange={supportFlow.actions.setDesiredResolution}
        onPickEvidence={() =>
          void pickAndUploadImage('support_evidence', (uri, uploaded) => {
            supportFlow.actions.setReportEvidenceUploadResult(uri, uploaded);
          })
        }
        onSubmitIssue={supportFlow.actions.submitCustomerIssue}
        onSupportMessageChange={supportFlow.actions.setSupportMessage}
        onIssueTypeChange={supportFlow.actions.setSupportSubject}
      />
    );
  }

  function renderMessages() {
    return (
      <MessagesScreen
        conversations={messagesFlow.data.conversations}
        bookings={bookings}
        messages={messagesFlow.data.messages}
        selectedConversationId={messagesFlow.data.selectedConversationId}
        appRole={appRole}
        apiOptions={apiOptions}
        messageDraft={messagesFlow.data.messageDraft}
        busyAction={busyAction}
        hasSession={Boolean(session)}
        onMessageDraftChange={messagesFlow.actions.setMessageDraft}
        onAttachImage={messagesFlow.actions.attachAndSendMessageImage}
        onMessagesLoaded={messagesFlow.actions.setMessages}
        onNotice={setNotice}
        onSelectConversation={messagesFlow.actions.setSelectedConversationId}
        onDeselectConversation={() => messagesFlow.actions.setSelectedConversationId(null)}
        onSendMessage={messagesFlow.actions.sendMessage}
      />
    );
  }

  function renderMore() {
    return (
      <>
        <TopBar title="More" />
        <CustomerMoreScreen
          profile={profile}
          navigate={navigate}
          signOut={signOut}
          unreadNotificationCount={notificationsFlow.data.unreadCount}
        />
      </>
    );
  }

  function renderCustomerProfile() {
    return (
      <CustomerProfileScreen
        profile={profile}
        customerAvatarUri={customerAvatarUri}
        profileFullName={profileFullName}
        profileContactNumber={profileContactNumber}
        profileAddress={profileAddress}
        busyAction={busyAction}
        navigate={navigate}
        setProfileFullName={setProfileFullName}
        setProfileContactNumber={setProfileContactNumber}
        setProfileAddress={setProfileAddress}
        pickCustomerAvatar={pickCustomerAvatar}
        saveProfile={saveProfile}
      />
    );
  }

  function renderCustomerPaymentMethods() {
    return (
      <CustomerPaymentMethodsScreen
        customerPaymentMethods={customerPaymentMethods}
        selectedMethodId={selectedCustomerPaymentMethod?.id ?? null}
        busyAction={busyAction}
        navigate={navigate}
        setSelectedCustomerPaymentMethodId={setSelectedCustomerPaymentMethodId}
        saveCustomerPaymentMethod={saveCustomerPaymentMethod}
        removeCustomerPaymentMethod={removeCustomerPaymentMethod}
      />
    );
  }

  function renderCustomerSettings() {
    return (
      <CustomerSettingsScreen
        userPreferences={userPreferences}
        pushNotificationsEnabled={pushNotificationsEnabled}
        darkModeEnabled={darkModeEnabled}
        activeSessions={activeSessions}
        profileEmail={profile?.user.email}
        currentPassword={currentPassword}
        newPassword={newPassword}
        twoFactorEnabled={twoFactorEnabled}
        twoFactorSecret={twoFactorSecret}
        twoFactorCode={twoFactorCode}
        deleteConfirmText={deleteConfirmText}
        busyAction={busyAction}
        navigate={navigate}
        setNotice={setNotice}
        setCurrentPassword={setCurrentPassword}
        setNewPassword={setNewPassword}
        setTwoFactorCode={setTwoFactorCode}
        setDeleteConfirmText={setDeleteConfirmText}
        savePreferences={savePreferences}
        savePassword={savePassword}
        startTwoFactorSetup={startTwoFactorSetup}
        verifyTwoFactorSetup={verifyTwoFactorSetup}
        disableTwoFactorSetup={disableTwoFactorSetup}
        deleteMyAccount={deleteMyAccount}
      />
    );
  }

  function renderCustomerHelp() {
    return (
      <HelpCenterScreen
        role="customer"
        navigate={navigate}
        supportPanel={supportPanel}
      />
    );
  }

  function renderCustomerServiceHistory() {
    return (
      <CustomerServiceHistoryScreen
        bookings={bookings}
        setBookingFilter={setBookingFilter}
        navigateToBookings={() => navigate('bookings', 'customer')}
        openBooking={(booking) => openBooking(booking, 'customerBookingDetail')}
      />
    );
  }

  function renderProviderNotifications() {
    return renderNotificationsScreen('provider');
  }

  function renderProviderHelp() {
    return (
      <HelpCenterScreen
        role="provider"
        navigate={navigate}
        supportPanel={supportPanel}
      />
    );
  }

  function renderProviderInsights() {
    return (
      <ProviderInsightsScreen
        providerDashboard={providerDashboard}
        bookings={bookings}
        navigate={navigate}
        refreshWorkspace={refreshWorkspace}
      />
    );
  }

  function renderCustomerNotifications() {
    return renderNotificationsScreen('customer');
  }

  function renderNotificationsScreen(role: AppRole) {
    return (
      <NotificationsScreen
        role={role}
        notifications={notificationsFlow.data.notifications}
        navigate={navigate}
        openNotification={notificationsFlow.actions.openNotification}
      />
    );
  }

  function renderCustomerReferral() {
    return (
      <CustomerReferralScreen
        apiOptions={apiOptions}
        referralSummary={referralSummary}
        navigate={navigate}
        onReferralSummaryLoaded={setReferralSummary}
        onNotice={setNotice}
        readError={readError}
      />
    );
  }

  function renderCustomerTerms() {
    return <CustomerTermsScreen navigate={navigate} />;
  }

  function renderProviderHome() {
    return (
      <ProviderHomeScreen
        profile={profile}
        bookings={bookings}
        payments={payments}
        providerDashboard={providerDashboard}
        providerApplication={providerApplication}
        payoutTotal={payoutTotal}
        unreadCount={notificationsFlow.data.unreadCount}
        navigate={navigate}
        openBooking={openBooking}
        busyAction={busyAction}
        onRefreshProviderApplication={async () => {
          setBusyAction('provider-application');
          try {
            setProviderApplication(await getMyProviderApplication(apiOptions));
            setNotice('Provider application status refreshed.');
          } catch (error) {
            setNotice(readError(error));
          } finally {
            setBusyAction(null);
          }
        }}
        onUploadGovernmentId={() => void uploadProviderGovernmentId()}
      />
    );
  }

  function renderProviderBookings() {
    return (
      <ProviderBookingsScreen
        bookings={bookings}
        providerBookingTab={providerBookingTab}
        providerSearchQuery={providerSearchQuery}
        setProviderBookingTab={setProviderBookingTab}
        setProviderSearchQuery={setProviderSearchQuery}
        refreshWorkspace={refreshWorkspace}
        openBooking={(booking) => openBooking(booking, 'providerBookingDetail')}
      />
    );
  }

  function renderProviderBookingDetail(): ReactNode {
    if (!selectedBooking) {
      return <MissingSelection onBack={() => navigate('bookings', 'provider')} />;
    }

    return (
      <ProviderBookingDetailScreen
        booking={selectedBooking}
        selectedPayment={selectedPayment ?? null}
        busyAction={busyAction}
        timelineEvents={
          <BookingTimelineEventsSection events={selectedBookingTimelineEvents} />
        }
        bookingMedia={
          <BookingMediaSection
            booking={selectedBooking}
            onRemoveAttachment={(attachmentId) =>
              void removeBookingAttachment(attachmentId)
            }
          />
        }
        serviceUpdates={
          <BookingServiceUpdatesSection updates={selectedBookingServiceUpdates} />
        }
        onBack={() => navigate('bookings', 'provider')}
        onCallCustomer={callSelectedBookingCustomer}
        onMessage={messagesFlow.actions.openSelectedBookingConversation}
        onStatusAction={(action) => {
          switch (action) {
            case 'confirm':
              void transitionSelectedBooking('confirmed');
              break;
            case 'decline':
              void transitionSelectedBooking('rejected');
              break;
            case 'startNavigation':
              void refreshBookingTracking(selectedBooking.id);
              navigate('providerNavigationMode', 'provider');
              break;
            case 'startService':
              navigate('providerStartService', 'provider');
              break;
            case 'cancel':
              navigate('providerCancelBooking', 'provider');
              break;
            case 'continueService':
              navigate('providerServiceInProgress', 'provider');
              break;
            case 'completeService':
              navigate('providerCompleteService', 'provider');
              break;
            case 'viewReceipt':
              navigate('providerServiceReceipt', 'provider');
              break;
            case 'reportIssue':
              navigate('providerReportIssue', 'provider');
              break;
            default:
              break;
          }
        }}
      />
    );
  }

  function renderProviderNavigationMode(): ReactNode {
    if (!selectedBooking) {
      return <MissingSelection onBack={() => navigate('bookings', 'provider')} />;
    }
    return (
      <ProviderNavigationModeScreen
        booking={selectedBooking}
        directions={selectedBookingDirections}
        fallbackOrigin={selectedNavigationOrigin}
        liveLocation={providerLiveLocation}
        navigationRouteError={navigationRouteError}
        navigationRouteLoading={navigationRouteLoading}
        sheetLevel={providerNavigationSheetLevel}
        trackingSnapshot={selectedBookingTracking ?? null}
        onArrived={() => navigate('providerStartService', 'provider')}
        onCall={() => void callSelectedBookingCustomer()}
        onClose={() => navigate('providerBookingDetail', 'provider')}
        onMessage={() => void messagesFlow.actions.openSelectedBookingConversation()}
        onRefreshRoute={() => void refreshProviderDirections(selectedBooking.id)}
        onSheetLevelChange={setProviderNavigationSheetLevel}
      />
    );
  }

  function renderProviderStartService(): ReactNode {
    if (!selectedBooking) {
      return <MissingSelection onBack={() => navigate('bookings', 'provider')} />;
    }
    return (
      <ProviderStartServiceScreen
        booking={selectedBooking}
        checklist={providerServiceFlow.data.providerChecklist}
        photoCaption={providerServiceFlow.data.providerPhotoCaption}
        beforePhotoUri={providerServiceFlow.data.providerBeforePhotoUri}
        beforePhotoUrl={providerServiceFlow.data.providerBeforePhotoUrl}
        busyAction={busyAction}
        onBack={() => navigate('providerBookingDetail', 'provider')}
        onToggleChecklist={providerServiceFlow.actions.toggleChecklist}
        onPickBeforePhoto={() =>
          void providerServiceFlow.actions.pickProviderPhoto('before')
        }
        onPhotoCaptionChange={providerServiceFlow.actions.setProviderPhotoCaption}
        onStartService={providerServiceFlow.actions.startSelectedService}
      />
    );
  }

  function renderProviderServiceInProgress(): ReactNode {
    if (!selectedBooking) {
      return <MissingSelection onBack={() => navigate('bookings', 'provider')} />;
    }
    return (
      <ProviderServiceInProgressScreen
        booking={selectedBooking}
        busyAction={busyAction}
        nowTick={nowTick}
        progressMessage={providerServiceFlow.data.providerProgressMessage}
        progressPhotoUri={providerServiceFlow.data.providerProgressPhotoUri}
        progressPhotoUrl={providerServiceFlow.data.providerProgressPhotoUrl}
        timelineEvents={selectedBookingTimelineEvents}
        onBack={() => navigate('providerBookingDetail', 'provider')}
        onCompleteService={() => navigate('providerCompleteService', 'provider')}
        onPickProgressPhoto={() =>
          void providerServiceFlow.actions.pickProviderPhoto('progress')
        }
        onProgressMessageChange={providerServiceFlow.actions.setProviderProgressMessage}
        onReportIssue={() => navigate('providerReportIssue', 'provider')}
        onSendProgressUpdate={providerServiceFlow.actions.submitProviderProgressUpdate}
      />
    );
  }

  function renderProviderCompleteService(): ReactNode {
    if (!selectedBooking) {
      return <MissingSelection onBack={() => navigate('bookings', 'provider')} />;
    }
    return (
      <ProviderCompleteServiceScreen
        booking={selectedBooking}
        busyAction={busyAction}
        completionNotes={providerServiceFlow.data.completionNotes}
        completionPhotoUri={providerServiceFlow.data.providerCompletionPhotoUri}
        completionPhotoUrl={providerServiceFlow.data.providerCompletionPhotoUrl}
        payment={selectedPayment ?? null}
        onBack={() => navigate('providerServiceInProgress', 'provider')}
        onCompleteService={providerServiceFlow.actions.completeSelectedService}
        onCompletionNotesChange={providerServiceFlow.actions.setCompletionNotes}
        onPickCompletionPhoto={() =>
          void providerServiceFlow.actions.pickProviderPhoto('completion')
        }
      />
    );
  }

  function renderProviderServiceCompleted(): ReactNode {
    if (!selectedBooking) {
      return <MissingSelection onBack={() => navigate('bookings', 'provider')} />;
    }
    return (
      <ProviderServiceCompletedScreen
        booking={selectedBooking}
        payment={selectedPayment ?? null}
        onBackToBookings={() => navigate('bookings', 'provider')}
        onViewReceipt={() => navigate('providerServiceReceipt', 'provider')}
      />
    );
  }

  function renderProviderCancelBooking(): ReactNode {
    if (!selectedBooking) {
      return <MissingSelection onBack={() => navigate('bookings', 'provider')} />;
    }

    return (
      <ProviderCancelBookingScreen
        bookingReference={selectedBooking.bookingReference}
        busyAction={busyAction}
        selectedReason={providerCancelReason}
        onBack={() => navigate('providerBookingDetail', 'provider')}
        onCancelBooking={cancelSelectedProviderBooking}
        onKeepBooking={() => navigate('providerBookingDetail', 'provider')}
        onReasonChange={setProviderCancelReason}
      />
    );
  }

  function renderProviderReportIssue(): ReactNode {
    if (!selectedBooking) {
      return <MissingSelection onBack={() => navigate('bookings', 'provider')} />;
    }
    return (
      <ProviderReportIssueScreen
        bookingReference={selectedBooking.bookingReference}
        busyAction={busyAction}
        providerReportDetails={supportFlow.data.providerReportDetails}
        providerReportReason={supportFlow.data.providerReportReason}
        reportEvidencePhotoUri={supportFlow.data.reportEvidencePhotoUri}
        reportEvidencePhotoUrl={supportFlow.data.reportEvidencePhotoUrl}
        onBack={() => navigate('providerBookingDetail', 'provider')}
        onPickEvidence={() =>
          void pickAndUploadImage('support_evidence', (uri, uploaded) => {
            supportFlow.actions.setReportEvidenceUploadResult(uri, uploaded);
          })
        }
        onProviderReportDetailsChange={supportFlow.actions.setProviderReportDetails}
        onProviderReportReasonChange={supportFlow.actions.setProviderReportReason}
        onSubmitReport={supportFlow.actions.submitProviderIssue}
      />
    );
  }

  function renderProviderServiceReceipt(): ReactNode {
    if (!selectedBooking) {
      return <MissingSelection onBack={() => navigate('bookings', 'provider')} />;
    }
    return (
      <ProviderServiceReceiptScreen
        booking={selectedBooking}
        payment={selectedPayment ?? null}
        onBack={() => navigate('providerBookingDetail', 'provider')}
        onBackToBookings={() => navigate('bookings', 'provider')}
      />
    );
  }

  function renderProviderCalendar() {
    return (
      <ProviderCalendarScreen
        availability={availability}
        bookings={bookings}
        apiOptions={apiOptions}
        onScheduleLoaded={setAvailability}
        onSelectDate={(date) => {
          setSelectedProviderCalendarDate(date);
          navigate('providerSetAvailability', 'provider');
        }}
        openBooking={(booking) => openBooking(booking, 'providerBookingDetail')}
      />
    );
  }

  function renderProviderSetAvailability() {
    return (
      <ProviderSetAvailabilityScreen
        selectedDate={selectedProviderCalendarDate}
        availability={availability}
        apiOptions={apiOptions}
        onScheduleUpdated={setAvailability}
        onBack={() => navigate('calendar', 'provider')}
      />
    );
  }

  function renderProviderProfileView() {
    return (
      <ProviderProfileViewScreen
        profile={profile}
        providerPortfolioMedia={providerPortfolioMedia}
        ownReviews={ownReviews}
        replyingToReviewId={replyingToReviewId}
        reviewReplyText={reviewReplyText}
        busyAction={busyAction}
        onBack={() => navigate('more', 'provider')}
        onEditProfile={() => navigate('providerEditProfile', 'provider')}
        onManagePortfolio={() => navigate('providerPortfolio', 'provider')}
        onStartReviewReply={setReplyingToReviewId}
        onReviewReplyTextChange={setReviewReplyText}
        onCancelReviewReply={() => {
          setReplyingToReviewId(null);
          setReviewReplyText('');
        }}
        onSubmitReviewReply={() => void submitReviewReply()}
      />
    );
  }

  function renderProviderEditProfile() {
    return (
      <ProviderEditProfileScreen
        profile={profile}
        busyAction={busyAction}
        profileFullName={profileFullName}
        profileContactNumber={profileContactNumber}
        profileBusinessName={profileBusinessName}
        onBack={() => navigate('providerProfileView', 'provider')}
        onFullNameChange={setProfileFullName}
        onContactNumberChange={setProfileContactNumber}
        onBusinessNameChange={setProfileBusinessName}
        onSaveProfile={() => void saveProfile()}
      />
    );
  }

  function renderProviderPortfolio() {
    return (
      <ProviderPortfolioScreen
        providerPortfolioMedia={providerPortfolioMedia}
        providerPortfolioPhotoUri={providerPortfolioPhotoUri}
        hasUploadedPortfolioPhoto={Boolean(providerPortfolioPhotoUrl)}
        editingPortfolioCaptionId={editingPortfolioCaptionId}
        portfolioCaptionDraft={portfolioCaptionDraft}
        busyAction={busyAction}
        onBack={() => navigate('providerProfileView', 'provider')}
        onRefresh={() => void refreshWorkspace()}
        onUploadPortfolioMedia={() => void uploadProviderPortfolioMedia()}
        onPortfolioCaptionDraftChange={setPortfolioCaptionDraft}
        onSavePortfolioCaption={(item) => void saveProviderPortfolioCaption(item)}
        onCancelPortfolioCaption={() => {
          setEditingPortfolioCaptionId(null);
          setPortfolioCaptionDraft('');
        }}
        onStartPortfolioCaptionEdit={(item) => {
          setEditingPortfolioCaptionId(item.id);
          setPortfolioCaptionDraft(item.caption ?? '');
        }}
        onMovePortfolioMedia={(mediaId, direction) =>
          void moveProviderPortfolioMedia(mediaId, direction)
        }
        onRemovePortfolioMedia={(mediaId) => void removeProviderPortfolioMedia(mediaId)}
      />
    );
  }

  function renderProviderPayoutManagement() {
    return (
      <ProviderPayoutManagementScreen
        payoutAccount={payoutAccount}
        payoutTotal={payoutTotal}
        payoutMethods={payoutMethods}
        providerPayouts={providerPayouts}
        payments={payments}
        selectedPayoutMethodId={selectedPayoutMethodId}
        newPayoutMethodType={newPayoutMethodType}
        newPayoutAccountLabel={newPayoutAccountLabel}
        newPayoutAccountName={newPayoutAccountName}
        newPayoutAccountLast4={newPayoutAccountLast4}
        busyAction={busyAction}
        onBack={() => navigate('more', 'provider')}
        onRefresh={() => void refreshWorkspace()}
        onRequestPayout={() => navigate('providerRequestPayout', 'provider')}
        onSelectPayoutMethod={setSelectedPayoutMethodId}
        onPayoutMethodTypeChange={setNewPayoutMethodType}
        onPayoutAccountLabelChange={setNewPayoutAccountLabel}
        onPayoutAccountNameChange={setNewPayoutAccountName}
        onPayoutAccountLast4Change={setNewPayoutAccountLast4}
        onSavePayoutMethod={() => void saveNewPayoutMethod()}
      />
    );
  }

  function renderProviderRequestPayout() {
    return (
      <ProviderRequestPayoutScreen
        payoutAccount={payoutAccount}
        payoutMethods={payoutMethods}
        selectedPayoutMethodId={selectedPayoutMethodId}
        requestPayoutAmount={requestPayoutAmount}
        busyAction={busyAction}
        onBack={() => navigate('providerPayoutManagement', 'provider')}
        onAmountChange={setRequestPayoutAmount}
        onSelectPayoutMethod={setSelectedPayoutMethodId}
        onSubmitPayoutRequest={() => void submitProviderPayoutRequest()}
      />
    );
  }

  function renderProviderMore() {
    return <ProviderMoreScreen navigate={navigate} />;
  }

  function renderProviderServices() {
    return (
      <ProviderServicesScreen
        ownedServices={ownedServices}
        editingServiceId={editingServiceId}
        editServiceTitle={editServiceTitle}
        editServicePrice={editServicePrice}
        newServiceTitle={newServiceTitle}
        newServicePrice={newServicePrice}
        newServicePricingMode={newServicePricingMode}
        showAddServiceForm={showAddServiceForm}
        busyAction={busyAction}
        onBack={() => navigate('more', 'provider')}
        onEditServiceTitleChange={setEditServiceTitle}
        onEditServicePriceChange={setEditServicePrice}
        onStartEditService={(service) => {
          setEditingServiceId(service.id);
          setEditServiceTitle(service.title);
          setEditServicePrice(service.price != null ? String(service.price) : '');
        }}
        onCancelEditService={() => setEditingServiceId(null)}
        onSaveOwnedServiceEdit={() => void saveOwnedServiceEdit()}
        onToggleOwnedServiceActive={(serviceId) =>
          void toggleOwnedServiceActive(serviceId)
        }
        onRemoveOwnedService={(serviceId) => void removeOwnedService(serviceId)}
        onNewServiceTitleChange={setNewServiceTitle}
        onNewServicePriceChange={setNewServicePrice}
        onNewServicePricingModeChange={setNewServicePricingMode}
        onSaveNewService={() => void addOwnedService()}
        onShowAddServiceForm={() => setShowAddServiceForm(true)}
        onCancelAddService={() => {
          setShowAddServiceForm(false);
          setNewServiceTitle('');
          setNewServicePrice('');
        }}
      />
    );
  }

  function renderProviderSecurity() {
    return (
      <ProviderSecurityScreen
        busyAction={busyAction}
        navigate={navigate}
        twoFactorCode={twoFactorCode}
        twoFactorEnabled={twoFactorEnabled}
        twoFactorSecret={twoFactorSecret}
        setTwoFactorCode={setTwoFactorCode}
        startTwoFactorSetup={startTwoFactorSetup}
        verifyTwoFactorSetup={verifyTwoFactorSetup}
        disableTwoFactorSetup={disableTwoFactorSetup}
      />
    );
  }

  function renderProviderSettings() {
    return (
      <ProviderSettingsScreen
        profile={profile}
        deleteConfirmText={deleteConfirmText}
        busyAction={busyAction}
        canConfirmAccountDeletion={canConfirmAccountDeletion}
        supportPanel={supportPanel}
        navigate={navigate}
        setDeleteConfirmText={setDeleteConfirmText}
        signOut={signOut}
        deleteMyAccount={deleteMyAccount}
      />
    );
  }

  const supportPanel = (
    <SupportPanel
      busyAction={busyAction}
      currentUserId={profile?.user.id ?? null}
      expandedTicketId={supportFlow.data.expandedSupportTicketId}
      isSignedIn={Boolean(session)}
      supportMessage={supportFlow.data.supportMessage}
      supportReplies={supportFlow.data.supportReplies}
      supportReplyDraft={supportFlow.data.supportReplyDraft}
      supportSubject={supportFlow.data.supportSubject}
      supportTickets={supportFlow.data.supportTickets}
      onMessageChange={supportFlow.actions.setSupportMessage}
      onOpenTicket={() => void supportFlow.actions.submitSupportTicket()}
      onReplyDraftChange={supportFlow.actions.setSupportReplyDraft}
      onSubmitReply={(ticketId) => void supportFlow.actions.submitSupportReply(ticketId)}
      onSubjectChange={supportFlow.actions.setSupportSubject}
      onToggleTicket={supportFlow.actions.toggleSupportTicket}
    />
  );

  const routeRenderers: AppRouterRenderers = {
    auth: renderAuth,
    customer: {
      bookingConfirmation: renderBookingConfirmation,
      bookingDetail: renderCustomerBookingDetail,
      bookingForm: renderCustomerBookingForm,
      bookingReview: renderBookingReview,
      bookings: renderBookings,
      calendar: renderCustomerCalendar,
      cancelBooking: renderCancelBooking,
      category: renderCustomerCategory,
      customerAllServices: () => renderCustomerAllServices('All Services'),
      customerExplore: renderCustomerExplore,
      customerProviderProfile: renderCustomerProviderProfile,
      customerTopProviders: renderCustomerTopProviders,
      help: renderCustomerHelp,
      manageBooking: renderManageBooking,
      messages: renderMessages,
      more: renderMore,
      notifications: renderCustomerNotifications,
      paymentMethods: renderCustomerPaymentMethods,
      profile: renderCustomerProfile,
      referral: renderCustomerReferral,
      reportIssue: renderReportIssue,
      reservePayment: renderReservePayment,
      serviceHistory: renderCustomerServiceHistory,
      settings: renderCustomerSettings,
      terms: renderCustomerTerms,
      trackServiceProvider: renderCustomerTrackServiceProvider,
    },
    customerAllServices: renderCustomerAllServices,
    provider: {
      bookingDetail: renderProviderBookingDetail,
      bookings: renderProviderBookings,
      calendar: renderProviderCalendar,
      cancelBooking: renderProviderCancelBooking,
      completeService: renderProviderCompleteService,
      editProfile: renderProviderEditProfile,
      help: renderProviderHelp,
      home: renderProviderHome,
      insights: renderProviderInsights,
      messages: renderMessages,
      more: renderProviderMore,
      navigationMode: renderProviderNavigationMode,
      notifications: renderProviderNotifications,
      payoutManagement: renderProviderPayoutManagement,
      portfolio: renderProviderPortfolio,
      profileView: renderProviderProfileView,
      reportIssue: renderProviderReportIssue,
      requestPayout: renderProviderRequestPayout,
      security: renderProviderSecurity,
      serviceCompleted: renderProviderServiceCompleted,
      serviceInProgress: renderProviderServiceInProgress,
      serviceReceipt: renderProviderServiceReceipt,
      services: renderProviderServices,
      setAvailability: renderProviderSetAvailability,
      settings: renderProviderSettings,
      startService: renderProviderStartService,
    },
  };

  return (
    <AppShell busyAction={busyAction} notice={notice}>
      <AppRouter
        appRole={appRole}
        navigate={navigate}
        renderers={routeRenderers}
        route={route}
        session={session}
        unreadCount={notificationsFlow.data.unreadCount}
      />
    </AppShell>
  );
}

export const legacyAppStyles = StyleSheet.create({
  profileHero: {
    alignItems: 'center',
  },
  profileAvatarLarge: {
    alignItems: 'center',
    backgroundColor: palette.mint,
    borderRadius: radius.pill,
    height: 96,
    justifyContent: 'center',
    position: 'relative',
    width: 96,
  },
  profileAvatarImage: {
    borderRadius: radius.pill,
    height: 96,
    width: 96,
  },
  profileAvatarLargeText: {
    color: palette.white,
    fontSize: 40,
    fontWeight: '900',
  },
  cameraBadge: {
    alignItems: 'center',
    backgroundColor: palette.mint,
    borderColor: palette.white,
    borderRadius: radius.pill,
    borderWidth: 4,
    bottom: 0,
    height: 34,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 34,
  },
  profileInfoRow: {
    alignItems: 'center',
    borderColor: palette.line,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 62,
    padding: spacing.base,
  },
  profileInfoValue: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  settingsSection: {
    gap: spacing.md,
  },
  settingsSectionTitle: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  settingsSectionBody: {
    borderTopColor: palette.lineSoft,
    borderTopWidth: 1,
  },
  settingsRow: {
    alignItems: 'center',
    borderBottomColor: palette.lineSoft,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingVertical: spacing.base,
  },
  settingsRowLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  settingsRowRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  methodCard: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: radius.md,
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 64,
    padding: spacing.base,
  },
  methodCardSelected: {
    backgroundColor: '#F0FFF4',
    borderColor: palette.mint,
  },
  deleteOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(220,38,38,0.88)',
    borderRadius: radius.pill,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.sm,
    top: spacing.sm,
    width: 32,
  },
  switchTrack: {
    backgroundColor: palette.line,
    borderRadius: radius.pill,
    height: 28,
    justifyContent: 'center',
    paddingHorizontal: 2,
    width: 48,
  },
  switchTrackOn: {
    backgroundColor: palette.mint,
  },
  switchThumb: {
    backgroundColor: palette.white,
    borderRadius: radius.pill,
    height: 24,
    width: 24,
  },
  switchThumbOn: {
    transform: [{ translateX: 20 }],
  },
  helpHeader: {
    backgroundColor: palette.mint,
  },
  helpSearch: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
    marginHorizontal: spacing.xl,
    paddingLeft: spacing.base,
  },
  faqCard: {
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: 14,
    borderWidth: 2,
    gap: spacing.md,
    padding: spacing.base,
    boxShadow: '0 4px 8px rgba(0,0,0,0.04)',
  },
  faqCardOpen: {
    backgroundColor: '#FAFFFE',
    borderColor: palette.mint,
  },
  faqIcon: {
    alignItems: 'center',
    backgroundColor: '#EFF7FE',
    borderRadius: radius.sm,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  faqCategory: {
    alignSelf: 'flex-start',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.sm,
    color: palette.mint,
    fontSize: 11,
    fontWeight: '800',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  notificationCard: {
    backgroundColor: palette.white,
    borderColor: 'transparent',
    borderRadius: radius.lg,
    borderWidth: 2,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.base,
    boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
  },
  notificationCardUnread: {
    backgroundColor: '#F0FFF4',
    borderColor: '#D6F5E4',
  },
  notificationIcon: {
    alignItems: 'center',
    backgroundColor: palette.mint,
    borderRadius: radius.pill,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  notificationUnreadDot: {
    backgroundColor: palette.mint,
    borderRadius: radius.pill,
    height: 8,
    position: 'absolute',
    right: spacing.base,
    top: spacing.base,
    width: 8,
  },
  roleCard: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: radius.lg,
    borderWidth: 2,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
  },
  roleIcon: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.md,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  roleMark: {
    color: palette.mint,
    fontSize: 22,
    fontWeight: '900',
  },
  chevron: {
    color: palette.faint,
    fontSize: 22,
    fontWeight: '800',
  },
  customerHero: {
    backgroundColor: palette.mint,
    gap: spacing.base,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.base,
  },
  providerHero: {
    backgroundColor: palette.mint,
    paddingBottom: 84,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  heroRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroIdentity: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  heroAvatar: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 14,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  heroMuted: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    fontWeight: '700',
  },
  heroName: {
    color: palette.white,
    fontSize: 24,
    fontWeight: '900',
  },
  notificationButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.24)',
    borderColor: 'rgba(255,255,255,0.32)',
    borderRadius: radius.lg,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    position: 'relative',
    width: 44,
  },
  heroUnreadDot: {
    backgroundColor: palette.coral,
    borderColor: 'rgba(86,196,144,0.8)',
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 9,
    position: 'absolute',
    right: 9,
    top: 8,
    width: 9,
  },
  notificationText: {
    color: palette.white,
    fontWeight: '900',
  },
  searchBar: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: spacing.base,
    boxShadow: '0 6px 16px rgba(44,90,60,0.12)',
  },
  searchText: {
    color: palette.faint,
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    gap: spacing.lg,
    padding: spacing.xl,
  },
  guideHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  guideIcon: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.md,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  guideDismissButton: {
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  guideDismissText: {
    color: palette.faint,
    fontSize: 13,
    fontWeight: '900',
  },
  guideFooterRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  guideDots: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  guideDot: {
    backgroundColor: palette.line,
    borderRadius: radius.pill,
    height: 8,
    width: 8,
  },
  guideDotActive: {
    backgroundColor: palette.mint,
    width: 22,
  },
  guideNextButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xxs,
    minHeight: 44,
  },
  overlapContent: {
    gap: spacing.md,
    marginTop: -64,
    paddingHorizontal: spacing.xl,
  },
  withBottomNav: {
    backgroundColor: palette.cream,
    flexGrow: 1,
    paddingBottom: 108,
  },
  withStickyFooter: {
    backgroundColor: palette.white,
    flexGrow: 1,
    paddingBottom: 132,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  supportRepliesBlock: {
    borderTopColor: palette.lineSoft,
    borderTopWidth: 1,
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  dateRailWrap: {
    position: 'relative',
  },
  dateRailCue: {
    alignItems: 'center',
    backgroundColor: 'rgba(240,255,244,0.94)',
    borderRadius: radius.pill,
    height: 36,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    top: 22,
    width: 36,
  },
  bookAgainRailWrap: {
    position: 'relative',
  },
  bookAgainRailCue: {
    alignItems: 'center',
    backgroundColor: 'rgba(240,255,244,0.96)',
    borderRadius: radius.pill,
    height: 36,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    top: 20,
    width: 36,
  },
  dateChip: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    minWidth: 68,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  dateChipSelected: {
    backgroundColor: palette.mint,
    borderColor: palette.mint,
  },
  dateChipDisabled: {
    backgroundColor: palette.lineSoft,
    borderColor: palette.lineSoft,
  },
  dateChipDow: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  dateChipDowSelected: {
    color: palette.white,
  },
  dateChipDay: {
    color: palette.ink,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  dateChipDaySelected: {
    color: palette.white,
  },
  dateChipMonth: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  dateChipTextDisabled: {
    color: palette.faint,
  },
  calendarLegendRow: {
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  calendarLegendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  calendarPartialDot: {
    backgroundColor: palette.amber,
    borderRadius: radius.pill,
    height: 6,
    width: 6,
  },
  calendarLegendLabel: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  timeTile: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: radius.md,
    borderWidth: 1,
    flexBasis: '31%',
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  timeTileSelected: {
    backgroundColor: palette.mint,
    borderColor: palette.mint,
  },
  timeTileDisabled: {
    backgroundColor: palette.lineSoft,
    borderColor: palette.lineSoft,
  },
  timeTileText: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  timeTileTextSelected: {
    color: palette.white,
  },
  timeTileTextDisabled: {
    color: palette.faint,
  },
  timeTileUnavailableText: {
    color: palette.faint,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  weekdayChip: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: 44,
    minWidth: 64,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  weekdayChipSelected: {
    backgroundColor: palette.mint,
    borderColor: palette.mintDark,
  },
  weekdayChipText: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  weekdayChipTextSelected: {
    color: palette.white,
  },
  horizontalRail: {
    gap: spacing.md,
    paddingRight: spacing.sm,
  },
  bookAgainCard: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderRadius: 20,
    flexDirection: 'row',
    gap: spacing.md,
    minWidth: 250,
    paddingBottom: spacing.md,
    paddingLeft: spacing.md,
    paddingRight: spacing.base,
    paddingTop: spacing.md,
    boxShadow: '0 6px 16px rgba(0,0,0,0.07)',
  },
  bookAgainAvatar: {
    alignItems: 'center',
    backgroundColor: palette.mintDark,
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  bookAgainInitial: {
    color: palette.white,
    fontSize: 18,
    fontWeight: '900',
  },
  bookAgainTitle: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  categoryGrid: {
    gap: spacing.md,
  },
  categoryTile: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.lineSoft,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.base,
    boxShadow: '0 5px 10px rgba(0,0,0,0.05)',
  },
  categoryTileSelected: {
    borderColor: palette.mint,
    backgroundColor: palette.mintSoft,
  },
  categoryIcon: {
    alignItems: 'center',
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  categoryTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  categorySub: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
    marginTop: spacing.xs,
  },
  marketSearchShell: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderColor: palette.line,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingLeft: spacing.base,
  },
  serviceListItem: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderColor: palette.lineSoft,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    boxShadow: '0 3px 6px rgba(0,0,0,0.04)',
  },
  serviceThumb: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.md,
    height: 90,
    justifyContent: 'center',
    width: 90,
  },
  serviceThumbText: {
    color: palette.mint,
    fontSize: 30,
    fontWeight: '900',
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.base,
  },
  serviceTile: {
    backgroundColor: palette.white,
    borderRadius: radius.md,
    gap: spacing.sm,
    padding: spacing.md,
    boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
    width: '47.5%',
  },
  serviceImageMock: {
    alignItems: 'center',
    aspectRatio: 1.2,
    backgroundColor: palette.mintSoft,
    borderRadius: radius.md,
    justifyContent: 'center',
    width: '100%',
  },
  serviceImageInitial: {
    color: palette.mint,
    fontSize: 38,
    fontWeight: '900',
  },
  ratingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  providerListItem: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.lineSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.base,
    boxShadow: '0 4px 8px rgba(0,0,0,0.07)',
  },
  providerListAvatar: {
    alignItems: 'center',
    backgroundColor: palette.mint,
    borderRadius: radius.pill,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  providerListAvatarText: {
    color: palette.white,
    fontSize: 20,
    fontWeight: '900',
  },
  providerMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  providerCover: {
    backgroundColor: palette.mint,
    height: 160,
    width: '100%',
  },
  providerProfileBody: {
    gap: spacing.lg,
    marginTop: -50,
    padding: spacing.xl,
  },
  providerProfileAvatar: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.white,
    borderRadius: radius.pill,
    borderWidth: 4,
    height: 100,
    justifyContent: 'center',
    boxShadow: '0 5px 10px rgba(0,0,0,0.12)',
    width: 100,
  },
  providerProfileAvatarText: {
    color: palette.mint,
    fontSize: 40,
    fontWeight: '900',
  },
  profileName: {
    color: palette.ink,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
  },
  profileStatsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  profileActionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  portfolioTile: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.md,
    gap: spacing.xs,
    height: 150,
    justifyContent: 'center',
    overflow: 'hidden',
    width: '47%',
  },
  portfolioImage: {
    height: '100%',
    width: '100%',
  },
  portfolioText: {
    backgroundColor: 'rgba(255,255,255,0.88)',
    bottom: spacing.xs,
    color: palette.mint,
    fontSize: 13,
    fontWeight: '900',
    left: spacing.xs,
    paddingHorizontal: spacing.xs,
    position: 'absolute',
    right: spacing.xs,
  },
  portfolioActions: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: radius.sm,
    flexDirection: 'row',
    gap: spacing.sm,
    left: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    position: 'absolute',
    right: spacing.xs,
    top: spacing.xs,
  },
  portfolioEditor: {
    backgroundColor: palette.white,
    bottom: spacing.xs,
    gap: spacing.xs,
    left: spacing.xs,
    padding: spacing.xs,
    position: 'absolute',
    right: spacing.xs,
    top: spacing.xs,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  flex: {
    flex: 1,
  },
  cardTitle: {
    ...type.section,
    color: palette.ink,
  },
  cardBody: {
    ...type.body,
    color: palette.body,
  },
  cardMeta: {
    ...type.caption,
    color: palette.muted,
  },
  monoText: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
  },
  label: {
    color: palette.body,
    fontSize: 14,
    fontWeight: '700',
  },
  priceText: {
    color: palette.mint,
    fontSize: 14,
    fontWeight: '900',
  },
  linkText: {
    color: palette.mint,
    fontSize: 13,
    fontWeight: '900',
  },
  profileLinkRow: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: spacing.xxs,
    minHeight: 44,
    paddingVertical: spacing.xs,
  },
  detailTitle: {
    ...type.title,
    color: palette.ink,
  },
  bookingReference: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  providerSummaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  providerPhoto: {
    alignItems: 'center',
    backgroundColor: palette.mint,
    borderRadius: radius.pill,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  providerPhotoText: {
    color: palette.white,
    fontSize: 22,
    fontWeight: '900',
  },
  customerAvatar: {
    alignItems: 'center',
    backgroundColor: palette.mint,
    borderRadius: radius.pill,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  circleButton: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.pill,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  infoRow: {
    alignItems: 'center',
    borderBottomColor: palette.lineSoft,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    minHeight: 48,
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    color: palette.faint,
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  infoValue: {
    color: palette.ink,
    flex: 1.4,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
  },
  totalRow: {
    alignItems: 'center',
    borderTopColor: palette.lineSoft,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
  },
  totalLabel: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  totalValue: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  noticeBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: radius.md,
    padding: spacing.base,
  },
  stickyFooter: {
    backgroundColor: palette.white,
    borderTopColor: palette.lineSoft,
    borderTopWidth: 1,
    bottom: 0,
    gap: spacing.sm,
    left: 0,
    maxWidth: 393,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    position: 'absolute',
    right: 0,
    width: '100%',
    alignSelf: 'center',
  },
  footerTotalRow: {
    alignItems: 'center',
    borderBottomColor: palette.lineSoft,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
  },
  footerTotalLabel: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  footerTotalValue: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  footerLink: {
    color: palette.mint,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  footerHomeIndicator: {
    alignSelf: 'center',
    backgroundColor: palette.ink,
    borderRadius: radius.pill,
    height: 5,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
    width: 134,
  },
  paymentMethodSelected: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderColor: palette.mint,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.base,
  },
  paymentMethodOption: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.lineSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.base,
  },
  inlineActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
    gap: spacing.xs,
  },
  smallAction: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.xxs,
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  smallActionText: {
    color: palette.mint,
    fontSize: 12,
    fontWeight: '900',
  },
  faded: {
    opacity: 0.5,
  },
  geoResult: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: -spacing.xs,
  },
  iconAction: {
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: radius.pill,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  confirmationContent: {
    gap: spacing.lg,
    padding: spacing.xl,
    paddingTop: spacing.xxl,
  },
  successCircle: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: palette.mint,
    borderRadius: radius.pill,
    height: 88,
    justifyContent: 'center',
    width: 88,
  },
  confirmationTitle: {
    color: palette.ink,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
    textAlign: 'center',
  },
  twoButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  manageCopy: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  optionList: {
    borderTopColor: palette.lineSoft,
    borderTopWidth: 1,
  },
  optionRow: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderBottomColor: palette.lineSoft,
    borderBottomWidth: 1,
    borderRadius: radius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.base,
  },
  optionRowDanger: {
    backgroundColor: '#FEF2F2',
  },
  optionLabel: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: '600',
  },
  optionLabelDanger: {
    color: palette.red,
    fontSize: 16,
    fontWeight: '800',
  },
  pageCopy: {
    ...type.body,
    color: palette.muted,
    textAlign: 'center',
  },
  helperText: {
    ...type.caption,
    color: palette.muted,
    textAlign: 'center',
  },
  sorryTitle: {
    color: palette.ink,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  radioGroup: {
    gap: spacing.base,
  },
  radioRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  radioOuter: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.mint,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  radioOuterSelected: {
    borderColor: palette.mint,
  },
  radioInner: {
    backgroundColor: palette.mint,
    borderRadius: radius.pill,
    height: 10,
    width: 10,
  },
  radioLabel: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '600',
  },
  policyCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.base,
  },
  keepBox: {
    backgroundColor: palette.mintSoft,
    borderColor: '#C7F0D8',
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.base,
  },
  promoAppliedBox: {
    backgroundColor: palette.mintSoft,
    borderColor: '#C7F0D8',
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.base,
  },
  promoRejectedBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.base,
  },
  lockedField: {
    gap: spacing.sm,
  },
  lockedInput: {
    backgroundColor: '#F9FAFB',
    borderColor: palette.lineSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.base,
  },
  uploadBox: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderColor: palette.line,
    borderRadius: radius.md,
    borderStyle: 'dashed',
    borderWidth: 2,
    gap: spacing.sm,
    minHeight: 160,
    paddingVertical: spacing.xxl,
  },
  uploadPreview: {
    borderRadius: radius.md,
    height: 120,
    width: '100%',
  },
  actions: {
    gap: spacing.md,
  },
  updateChecklist: {
    marginTop: spacing.sm,
  },
  navigationScreen: {
    backgroundColor: palette.white,
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  mapCanvas: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#DDEFE4',
  },
  mapCloseButton: {
    alignSelf: 'flex-end',
    backgroundColor: palette.white,
    borderRadius: radius.pill,
    marginRight: spacing.xl,
    marginTop: spacing.xl,
    minHeight: 44,
    minWidth: 64,
    justifyContent: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 5,
    boxShadow: '0 8px 18px rgba(17,24,39,0.14)',
  },
  mapCloseText: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  providerGuidanceBanner: {
    alignItems: 'center',
    backgroundColor: '#102A5C',
    borderRadius: radius.lg,
    boxShadow: '0 14px 30px rgba(15,23,42,0.24)',
    flexDirection: 'row',
    gap: spacing.md,
    left: spacing.base,
    padding: spacing.md,
    position: 'absolute',
    right: 100,
    top: spacing.xl,
    zIndex: 4,
  },
  providerGuidanceIcon: {
    alignItems: 'center',
    backgroundColor: palette.mint,
    borderRadius: radius.md,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  providerGuidanceIconText: {
    color: palette.white,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 32,
  },
  providerGuidanceDistance: {
    color: palette.white,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 28,
  },
  providerGuidanceInstruction: {
    color: palette.white,
    fontSize: 13,
    fontWeight: '800',
  },
  providerGuidanceNext: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 12,
    fontWeight: '700',
    marginTop: spacing.xxs,
  },
  navBottomSheet: {
    backgroundColor: palette.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    gap: spacing.md,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.base,
    paddingBottom: spacing.xl,
    position: 'absolute',
    right: 0,
    zIndex: 4,
    boxShadow: '0 -12px 28px rgba(17,24,39,0.14)',
  },
  navBottomSheetPeek: {
    maxHeight: '34%',
  },
  navBottomSheetHalf: {
    maxHeight: '43%',
  },
  navBottomSheetExpanded: {
    maxHeight: '49%',
  },
  navigationSheetHeader: {
    gap: spacing.sm,
  },
  dragHandleButton: {
    alignItems: 'center',
    minHeight: 20,
    justifyContent: 'center',
  },
  sheetLevelControls: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.xxs,
    padding: 3,
  },
  sheetLevelButton: {
    borderRadius: radius.pill,
    minHeight: 28,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  sheetLevelButtonActive: {
    backgroundColor: palette.mint,
  },
  sheetLevelButtonText: {
    color: palette.mint,
    fontSize: 11,
    fontWeight: '900',
  },
  sheetLevelButtonTextActive: {
    color: palette.white,
  },
  routeInstructionList: {
    gap: spacing.sm,
  },
  routeInstructionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  routeInstructionNumber: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.pill,
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
  routeInstructionNumberText: {
    color: palette.mintDark,
    fontSize: 12,
    fontWeight: '900',
  },
  providerDriveStats: {
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  providerDriveStat: {
    backgroundColor: palette.white,
    borderRadius: radius.sm,
    flex: 1,
    minHeight: 56,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  providerDriveStatValue: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  providerDriveStatLabel: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: '800',
    marginTop: spacing.xxs,
  },
  dragHandle: {
    alignSelf: 'center',
    backgroundColor: palette.line,
    borderRadius: radius.pill,
    height: 5,
    width: 48,
  },
  operationalTitle: {
    color: palette.ink,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
  },
  checklistRow: {
    alignItems: 'center',
    borderBottomColor: palette.lineSoft,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 52,
  },
  checkboxBox: {
    alignItems: 'center',
    borderColor: palette.line,
    borderRadius: radius.sm,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  checkboxBoxChecked: {
    backgroundColor: palette.mint,
    borderColor: palette.mint,
  },
  timerCard: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    gap: spacing.sm,
    padding: spacing.xl,
    boxShadow: '0 6px 14px rgba(0,0,0,0.08)',
  },
  timerText: {
    color: palette.ink,
    fontSize: 36,
    fontWeight: '900',
  },
  messageBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5F5F5',
    borderRadius: radius.md,
    gap: spacing.xs,
    marginBottom: spacing.sm,
    maxWidth: '86%',
    padding: spacing.md,
  },
  messageBubbleMine: {
    alignSelf: 'flex-end',
    backgroundColor: palette.mintSoft,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  requestBanner: {
    alignItems: 'center',
    backgroundColor: palette.mint,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.base,
  },
  requestBannerMuted: {
    backgroundColor: palette.mintSoft,
  },
  bannerTitle: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '900',
  },
  bannerTitleMuted: {
    color: palette.ink,
  },
  bannerCopy: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    fontWeight: '700',
  },
  bannerCopyMuted: {
    color: palette.muted,
  },
  bannerArrow: {
    color: palette.white,
    fontSize: 24,
    fontWeight: '900',
  },
  providerBookingRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bookingCardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  bookingCardFooter: {
    alignItems: 'center',
    borderTopColor: palette.lineSoft,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    paddingTop: spacing.md,
  },
  providerName: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '800',
    marginTop: spacing.xxs,
  },
  bookingActionButton: {
    backgroundColor: palette.mint,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  bookingActionText: {
    color: palette.white,
    fontSize: 13,
    fontWeight: '800',
  },
  providerBookingCol: {
    flex: 1,
    gap: spacing.xs,
  },
  tableLabel: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  tableValue: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: '800',
  },
  quickAction: {
    backgroundColor: palette.white,
    borderRadius: radius.md,
    flex: 1,
    gap: spacing.sm,
    padding: spacing.base,
    boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
  },
  quickIcon: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  quickIconText: {
    color: palette.mint,
    fontSize: 18,
    fontWeight: '900',
  },
  noticeText: {
    ...type.caption,
    color: palette.muted,
    textAlign: 'center',
  },
});
