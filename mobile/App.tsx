import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import {
  Bell,
  BriefcaseBusiness,
  Calendar,
  Camera,
  ChevronRight,
  CheckCircle,
  Clock,
  CreditCard,
  FolderKanban,
  Gift,
  Globe,
  Image as ImageIcon,
  Lock,
  Mail,
  Moon,
  Navigation,
  Home,
  Menu,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Upload,
  User,
  Wallet,
} from 'lucide-react-native';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Image,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Badge,
  BottomNavigation,
  Card,
  EmptyState,
  Field,
  MetricCard,
  PhoneFrame,
  Pill,
  PrimaryButton,
  Section,
  StatusStrip,
  StatusTimeline,
  TopBar,
} from './src/components/DesignKit';
import {
  CategoryTile,
  InfoRow,
  MissingSelection,
  ProfileInfoRow,
  BookingCard,
  ProviderBookingRow,
  ProviderListItem,
  QuickAction,
  ServiceListItem,
  SettingsRow,
  SettingsSection,
} from './src/components/AppDisplay';
import {
  activeBookingCount,
  bookingStatusChip,
  buildCalendarExportUrl,
  buildBookingTransitionRequest,
  buildProviderBookingSlots,
  completedBookingCount,
  formatBookingDuration,
  formatDateTime,
  formatMoney,
  nextActionLabel,
  nextBookingStatuses,
  pricingModeLabel,
  providerPayoutTotal,
  roleLabel,
  statusLabel,
  summarizeMonthlyEarnings,
  timelineEventLabel,
  toManilaBookingIso,
} from './src/domain/booking';
import {
  bookingTimeSlots,
  customerCancelReasons,
  customerHelpCategories,
  customerHelpFaqs,
  providerHelpCategories,
  providerHelpFaqs,
  customerIssueTypes,
  customerResolutionOptions,
  dayLabels,
  dayOrder,
  defaultScheduledAt,
  hiddenProviderBottomNavScreens,
  providerCancelReasons,
  providerProfileTabs,
  type ProviderBookingTab,
} from './src/constants/appContent';
import {
  getCustomerTab,
  getProviderTab,
  readError,
  timelineForStatus,
} from './src/navigation/routeHelpers';
import { resolveNotificationRoute } from './src/navigation/notificationRouting';
import { AuthScreens } from './src/screens/AuthScreens';
import { CustomerMoreScreen } from './src/screens/CustomerMoreScreen';
import { ProviderBookingsScreen } from './src/screens/ProviderBookingsScreen';
import {
  AddressVerificationPreview,
  TrackingMapPreview,
} from './src/tracking/TrackingMapPreview';
import { useProviderLiveLocation } from './src/tracking/useProviderLiveLocation';
import { AppRole, AppScreen, RouteState } from './src/navigation/types';
import { palette, radius, spacing, type } from './src/theme/serveaseDesign';
import {
  AvailabilityWindowInput,
  BookingStatus,
  BookingSummary,
  BookingServiceUpdateSummary,
  BookingTimelineEventSummary,
  BookingTrackingLocation,
  BookingTrackingSnapshot,
  CatalogCategory,
  CatalogServiceItem,
  ConversationMessage,
  ConversationMessageAttachment,
  ConversationSummary,
  CurrentUserProfile,
  CreateBookingRequest,
  CustomerPaymentMethodSummary,
  CustomerPaymentMethodType,
  DayOfWeek,
  NotificationSummary,
  PaymentSummary,
  PromotionValidationSummary,
  PayoutAccountSummary,
  PayoutMethodSummary,
  PayoutMethodType,
  PayoutSummary,
  ReferralSummary,
  CurrentUserSessionSummary,
  UserPreferenceSummary,
  ProviderAvailabilitySchedule,
  ProviderApplicationStatus,
  ProviderListing,
  ProviderPortfolioMediaSummary,
  ReviewSummary,
  SupportTicketReplySummary,
  SupportTicketSummary,
  UploadKind,
  UploadSummary,
  addProviderPortfolioMedia,
  addProviderDayOff,
  createBooking,
  createBookingAttachment,
  createBookingServiceUpdate,
  createCheckoutSession,
  createConversationMessage,
  createPayment,
  createProviderPayoutIdempotencyKey,
  createReview,
  createSupportTicket,
  createSupportTicketReply,
  deleteBookingAttachment,
  deleteCurrentUserAccount,
  disableCurrentUserTwoFactor,
  enableCurrentUserTwoFactor,
  exchangeGoogleCode,
  listSupportTicketReplies,
  replyToReview,
  flagReview,
  getMyProviderApplication,
  getProviderDashboard,
  getCheckoutStatus,
  getDirections,
  getGoogleAuthorizationUrl,
  geocodeAddress,
  generateOtp,
  listProviderOwnedServices,
  replaceProviderServices,
  ProviderDashboardSummary,
  ProviderOwnedServiceSummary,
  ProviderOwnedServiceInput,
  deleteCustomerPaymentMethod,
  deleteProviderPortfolioMedia,
  getCurrentUser,
  getBookingTrackingSnapshot,
  getProviderPayoutAccount,
  getReferralSummary,
  getUserPreferences,
  getPublicProviderAvailability,
  getProviderAvailability,
  listCatalogCategories,
  listCatalogServices,
  listConversations,
  listConversationMessages,
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
  markNotificationRead,
  openConversation,
  registerAccount,
  removeProviderDayOff,
  replaceProviderAvailabilityWindows,
  raiseBookingDispute,
  reorderProviderPortfolio,
  requestPasswordReset,
  requestProviderPayout,
  reverseGeocode,
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
  type GeoAddressResult,
  type GeoDirectionsRoute,
  type GeoDirectionsStep,
  type GeoRouteLocation,
  type SharedPaymentMethod,
} from './services/serveaseApi';
import { resolveGatewayBaseUrl } from './services/gatewayConfig';
import { AuthSession, signInWithPassword } from './services/supabaseAuth';
import { syncExpoPushRegistration } from './services/pushRegistration';

function isInternalTestNotification(notification: NotificationSummary): boolean {
  const text = `${notification.title ?? ''} ${notification.body ?? ''}`.toLowerCase();
  const metadata = notification.metadata;
  const markedTestOnly =
    metadata &&
    !Array.isArray(metadata) &&
    typeof metadata === 'object' &&
    (metadata as Record<string, unknown>).testOnly === true;

  return (
    markedTestOnly ||
    text.includes('test broadcast') ||
    text.includes('live integration test') ||
    text.includes('smoke verification')
  );
}

function completedRebookOptions(bookings: BookingSummary[]): BookingSummary[] {
  const seen = new Set<string>();

  return bookings.filter((booking) => {
    if (booking.status !== 'completed') {
      return false;
    }

    const key = `${booking.serviceId ?? booking.serviceTitle ?? booking.id}:${
      booking.providerId
    }`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

type NavigationSheetLevel = 'peek' | 'half' | 'expanded';

const navigationSheetLevels: NavigationSheetLevel[] = ['peek', 'half', 'expanded'];

interface ProviderNavigationGuidance {
  instruction: string;
  nextInstruction: string | null;
  distanceLabel: string;
  maneuverSymbol: string;
}

export default function App() {
  const [route, setRoute] = useState<RouteState>({ role: null, screen: 'authGate' });
  const [apiBaseUrl, setApiBaseUrl] = useState(resolveGatewayBaseUrl());
  const [supabaseUrl, setSupabaseUrl] = useState(
    process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  );
  const [publishableKey, setPublishableKey] = useState(
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
      '',
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
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
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
  const [supportTickets, setSupportTickets] = useState<SupportTicketSummary[]>([]);
  const [notifications, setNotifications] = useState<NotificationSummary[]>([]);
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
    useState<NavigationSheetLevel>('peek');
  const [providerNavigationSheetLevel, setProviderNavigationSheetLevel] =
    useState<NavigationSheetLevel>('peek');
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
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    null,
  );
  const [bookingFilter, setBookingFilter] = useState<'active' | 'completed'>('active');
  const [address, setAddress] = useState('Unit 12B Greenfield Residences');
  const [scheduledAt, setScheduledAt] = useState(defaultScheduledAt);
  const [hoursRequired, setHoursRequired] = useState('2');
  const [notes, setNotes] = useState('');
  const [bookingReferencePhotoUri, setBookingReferencePhotoUri] = useState<string | null>(null);
  const [bookingReferencePhotoUrl, setBookingReferencePhotoUrl] = useState<string | null>(null);
  const [bookingReferenceUpload, setBookingReferenceUpload] = useState<UploadSummary | null>(null);
  const [addressGeoResult, setAddressGeoResult] = useState<GeoAddressResult | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [promotionValidation, setPromotionValidation] =
    useState<PromotionValidationSummary | null>(null);
  const [messageDraft, setMessageDraft] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState('5');
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [expandedSupportTicketId, setExpandedSupportTicketId] = useState<string | null>(null);
  const [supportReplies, setSupportReplies] = useState<
    Record<string, SupportTicketReplySummary[]>
  >({});
  const [supportReplyDraft, setSupportReplyDraft] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [desiredResolution, setDesiredResolution] = useState('');
  const [reportEvidencePhotoUri, setReportEvidencePhotoUri] = useState<string | null>(null);
  const [reportEvidencePhotoUrl, setReportEvidencePhotoUrl] = useState<string | null>(null);
  const [reportEvidenceUpload, setReportEvidenceUpload] = useState<UploadSummary | null>(null);
  const [providerBookingTab, setProviderBookingTab] =
    useState<ProviderBookingTab>('upcoming');
  const [providerSearchQuery, setProviderSearchQuery] = useState('');
  const [marketplaceSearchQuery, setMarketplaceSearchQuery] = useState('');
  const [providerProfileTab, setProviderProfileTab] = useState<
    'About' | 'Services' | 'Portfolio' | 'Reviews' | 'Availability'
  >('About');
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [helpQuery, setHelpQuery] = useState('');
  const [helpCategory, setHelpCategory] = useState('all');
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null);
  const [windowDay, setWindowDay] = useState<DayOfWeek>('monday');
  const [windowStart, setWindowStart] = useState('09:00');
  const [windowEnd, setWindowEnd] = useState('17:00');
  const [dayOffDate, setDayOffDate] = useState('');
  const [dayOffReason, setDayOffReason] = useState('');
  const [providerChecklist, setProviderChecklist] = useState({
    scopeConfirmed: false,
    toolsReady: false,
    instructionsReviewed: false,
  });
  const lastPushRegistrationKey = useRef<string | null>(null);
  const handledPushNotificationIds = useRef<Set<string>>(new Set());
  const reconcilingCheckoutRef = useRef(false);
  const payoutIdempotencyKeyRef = useRef<string | null>(null);
  const [providerPhotoCaption, setProviderPhotoCaption] = useState('');
  const [providerBeforePhotoUri, setProviderBeforePhotoUri] = useState<string | null>(null);
  const [providerBeforePhotoUrl, setProviderBeforePhotoUrl] = useState<string | null>(null);
  const [providerProgressPhotoUri, setProviderProgressPhotoUri] = useState<string | null>(null);
  const [providerProgressPhotoUrl, setProviderProgressPhotoUrl] = useState<string | null>(null);
  const [providerCompletionPhotoUri, setProviderCompletionPhotoUri] = useState<string | null>(null);
  const [providerCompletionPhotoUrl, setProviderCompletionPhotoUrl] = useState<string | null>(null);
  const [providerPortfolioPhotoUri, setProviderPortfolioPhotoUri] = useState<string | null>(null);
  const [providerPortfolioPhotoUrl, setProviderPortfolioPhotoUrl] = useState<string | null>(null);
  const [editingPortfolioCaptionId, setEditingPortfolioCaptionId] =
    useState<string | null>(null);
  const [portfolioCaptionDraft, setPortfolioCaptionDraft] = useState('');
  const [providerProgressMessage, setProviderProgressMessage] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
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
  const [providerReportReason, setProviderReportReason] = useState('');
  const [providerReportDetails, setProviderReportDetails] = useState('');
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
  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedConversationId,
  );
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
  const visibleNotifications = notifications.filter(
    (notification) => !isInternalTestNotification(notification),
  );
  const unreadCount = visibleNotifications.filter((notification) => !notification.isRead).length;
  const role = profile?.user.role ?? 'customer';
  const appRole: AppRole = role === 'provider' ? 'provider' : 'customer';
  const activeCount = activeBookingCount(bookings.map((booking) => booking.status));
  const completedCount = completedBookingCount(bookings.map((booking) => booking.status));
  const payoutTotal =
    payoutAccount?.availableBalance ?? providerPayoutTotal(payments);
  const canConfirmAccountDeletion =
    Boolean(profile?.user.email) && deleteConfirmText.trim() === profile?.user.email;
  const providerBookingSlots = useMemo(
    () =>
      buildProviderBookingSlots(
        selectedProviderAvailability,
        Number(hoursRequired) || 1,
        bookingTimeSlots,
      ),
    [hoursRequired, selectedProviderAvailability],
  );

  const apiOptions = useMemo(
    () => ({
      baseUrl: apiBaseUrl,
      token: session?.accessToken,
    }),
    [apiBaseUrl, session?.accessToken],
  );
  const providerLiveLocation = useProviderLiveLocation({
    enabled: Boolean(
      session?.accessToken &&
        selectedBookingId &&
        route.screen === 'providerNavigationMode',
    ),
    bookingId: selectedBookingId,
    apiOptions,
  });

  useEffect(() => {
    void loadCatalog();
  }, []);

  useEffect(() => {
    setPromoCode('');
    setPromotionValidation(null);
  }, [selectedBookingId]);

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
        setNotifications(nextNotifications);
        setBookings(nextBookings);
      } catch {
        // ignore poll errors to avoid noisy notices
      }
    };
    const interval = setInterval(() => void tick(), 30000);
    return () => clearInterval(interval);
  }, [session?.accessToken, appRole, apiOptions]);

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
  }, [apiBaseUrl]);

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
  }, [session?.accessToken, pendingCheckout, apiOptions]);

  useEffect(() => {
    if (!session?.accessToken || !appRole) {
      return undefined;
    }

    let isMounted = true;
    const subscriptions: Array<{ remove: () => void }> = [];

    const handleResponse = (response: unknown) => {
      const data =
        (response as {
          notification?: {
            request?: {
              content?: {
                data?: Record<string, unknown>;
              };
            };
          };
        })?.notification?.request?.content?.data ?? {};
      const notificationId =
        typeof data.notificationId === 'string' ? data.notificationId : null;

      if (
        notificationId &&
        handledPushNotificationIds.current.has(notificationId)
      ) {
        return;
      }
      if (notificationId) {
        handledPushNotificationIds.current.add(notificationId);
        void markRead(notificationId);
      }

      routeFromNotificationPayload(data);
    };

    void import('expo-notifications')
      .then(async (notifications) => {
        if (!isMounted) {
          return;
        }
        notifications.setNotificationHandler?.({
          handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: false,
            shouldSetBadge: true,
          }),
        });

        subscriptions.push(
          notifications.addNotificationResponseReceivedListener(handleResponse),
        );
        if (notifications.addNotificationReceivedListener) {
          subscriptions.push(
            notifications.addNotificationReceivedListener(() => {
              void listNotifications(apiOptions)
                .then(setNotifications)
                .catch(() => undefined);
            }),
          );
        }

        const initialResponse =
          notifications.getLastNotificationResponse?.() ??
          (await notifications.getLastNotificationResponseAsync?.());
        if (initialResponse && isMounted) {
          handleResponse(initialResponse);
          notifications.clearLastNotificationResponse?.();
        }
      })
      .catch(() => {
        // Notification listeners are best-effort on unsupported runtimes.
      });

    return () => {
      isMounted = false;
      subscriptions.forEach((subscription) => subscription.remove());
    };
  }, [session?.accessToken, appRole, apiOptions]);

  useEffect(() => {
    if (!session?.accessToken || route.screen !== 'messages') {
      return undefined;
    }
    const tick = async () => {
      try {
        const nextConversations = await listConversations(apiOptions);
        setConversations(nextConversations);
        if (selectedConversationId) {
          const nextMessages = await listConversationMessages(
            selectedConversationId,
            apiOptions,
          );
          setMessages(nextMessages);
        }
      } catch {
        // swallow poll errors
      }
    };
    const interval = setInterval(() => void tick(), 8000);
    return () => clearInterval(interval);
  }, [session?.accessToken, route.screen, selectedConversationId, apiOptions]);

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
    const tick = () => void refreshBookingTracking(selectedBookingId);
    const interval = setInterval(tick, 5000);
    return () => clearInterval(interval);
  }, [session?.accessToken, selectedBookingId, route.screen]);

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
  }, [session?.accessToken, selectedBookingId, route.screen]);

  async function loadCatalog() {
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

  async function completeGoogleSignIn(code: string, state: string | null) {
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
    setConversations([]);
    setMessages([]);
    setPayments([]);
    setCustomerPaymentMethods([]);
    setPayoutAccount(null);
    setPayoutMethods([]);
    setProviderPayouts([]);
    setReferralSummary(null);
    setUserPreferences(null);
    setActiveSessions([]);
    setSupportTickets([]);
    setNotifications([]);
    setSelectedBookingServiceUpdates([]);
    setSelectedBookingTimelineEvents([]);
    setSelectedProviderPortfolioMedia([]);
    setProviderPortfolioMedia([]);
    setAvailability(null);
    setSelectedBookingId(null);
    setSelectedConversationId(null);
    setSelectedCustomerPaymentMethodId(null);
    setPendingCheckout(null);
    setAddressGeoResult(null);
    setPromoCode('');
    setPromotionValidation(null);
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

  function getNotificationCategoryEnabled(category: string): boolean {
    const prefs = userPreferences?.notificationPreferences;
    if (!prefs || typeof prefs !== 'object') {
      return true;
    }
    const value = (prefs as Record<string, unknown>)[category];
    if (typeof value === 'boolean') {
      return value;
    }
    return true;
  }

  async function toggleNotificationCategory(category: string) {
    const current =
      (userPreferences?.notificationPreferences as
        | Record<string, unknown>
        | undefined) ?? {};
    const next = {
      ...current,
      [category]: !getNotificationCategoryEnabled(category),
    };
    await savePreferences({ notificationPreferences: next });
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
      setConversations(nextConversations);
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
      setSupportTickets(nextTickets);
      setNotifications(nextNotifications);
      setAvailability(nextAvailability);
      setSelectedBookingId((current) => current ?? nextBookings[0]?.id ?? null);
      setSelectedConversationId(
        (current) => current ?? nextConversations[0]?.id ?? null,
      );
      setNotice(`${nextBookings.length} booking${nextBookings.length === 1 ? '' : 's'} loaded.`);
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function submitBooking() {
    if (!session) {
      setNotice('Sign in before creating a booking.');
      setRoute({ role: null, screen: 'loginRole' });
      return;
    }

    const scheduledAtIso = toManilaBookingIso(scheduledAt);

    if (!selectedProvider || !address.trim() || !scheduledAtIso) {
      setNotice('Choose a service provider, address, and schedule.');
      return;
    }

    setBusyAction('create-booking');
    try {
      const request: CreateBookingRequest = {
        providerId: selectedProvider.providerId,
        serviceId: selectedService?.id ?? selectedProvider.serviceId,
        serviceTitle: selectedProvider.title,
        serviceName: selectedService?.name ?? selectedProvider.title,
        serviceDescription: selectedProvider.description,
        serviceAddress: address.trim(),
        scheduledAt: scheduledAtIso,
        hoursRequired: Number(hoursRequired) || 1,
        serviceAmount: selectedProvider.price ?? selectedService?.price ?? 0,
        pricingMode: selectedProvider.pricingMode,
        paymentMethod: selectedCustomerPaymentMethod?.methodType ?? 'cash_on_service',
        customerNotes: notes.trim() || null,
        attachments: bookingReferenceUpload
          ? [
              {
                ...mediaAttachmentFromUpload(bookingReferenceUpload),
                mediaKind: 'booking_reference',
              },
            ]
          : [],
      };
      const booking = await createBooking(request, apiOptions);
      setBookings((current) => [booking, ...current]);
      setSelectedBookingId(booking.id);
      void refreshBookingTimelineEvents(booking.id);
      setBookingReferencePhotoUri(null);
      setBookingReferencePhotoUrl(null);
      setBookingReferenceUpload(null);
      setRoute({ role: 'customer', screen: 'customerBookingConfirmation' });
      setNotice(`Booking ${booking.bookingReference} created.`);
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

  async function openSelectedConversation() {
    if (!selectedBooking) {
      setNotice('Select a booking first.');
      return null;
    }

    setBusyAction('open-conversation');
    try {
      const conversation = await openConversation(selectedBooking.id, apiOptions);
      upsertConversation(conversation);
      setSelectedConversationId(conversation.id);
      setMessages(await listConversationMessages(conversation.id, apiOptions));
      setRoute({ role: appRole, screen: 'messages' });
      setNotice('Conversation opened.');
      return conversation;
    } catch (error) {
      setNotice(readError(error));
      return null;
    } finally {
      setBusyAction(null);
    }
  }

  async function startSelectedService() {
    if (!selectedBooking) {
      setNotice('Select a booking first.');
      return;
    }

    setBusyAction('service-start');
    try {
      const update = await createBookingServiceUpdate(
        selectedBooking.id,
        {
          updateType: 'checklist',
          message: providerPhotoCaption.trim() || 'Pre-service checklist completed.',
          checklist: providerChecklist,
        },
        apiOptions,
      );
      upsertBookingServiceUpdate(update);
      if (selectedBooking.status !== 'in_progress') {
        const updated = await transitionBookingStatus(
          selectedBooking.id,
          {
            currentStatus: selectedBooking.status,
            nextStatus: 'in_progress',
          },
          apiOptions,
        );
        replaceBooking(updated);
        void refreshBookingTracking(updated.id);
        void refreshBookingTimelineEvents(updated.id);
      }
      setNotice('Service started.');
      setRoute({ role: 'provider', screen: 'providerServiceInProgress' });
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function completeSelectedService() {
    if (!selectedBooking) {
      setNotice('Select a booking first.');
      return;
    }

    setBusyAction('service-complete');
    try {
      const update = await createBookingServiceUpdate(
        selectedBooking.id,
        {
          updateType: 'completion',
          message: completionNotes.trim() || 'Service marked completed.',
        },
        apiOptions,
      );
      upsertBookingServiceUpdate(update);
      const updated = await transitionBookingStatus(
        selectedBooking.id,
        {
          currentStatus: selectedBooking.status,
          nextStatus: 'completed',
        },
        apiOptions,
      );
      replaceBooking(updated);
      void refreshBookingTracking(updated.id);
      setCompletionNotes('');
      setNotice('Service completed.');
      setRoute({ role: 'provider', screen: 'providerServiceCompleted' });
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function submitProviderProgressUpdate() {
    if (!selectedBooking) {
      setNotice('Select a booking first.');
      return;
    }

    const message = providerProgressMessage.trim();
    if (!message) {
      setNotice('Write a progress update first.');
      return;
    }

    setBusyAction('service-progress');
    try {
      const update = await createBookingServiceUpdate(
        selectedBooking.id,
        {
          updateType: 'progress',
          message,
        },
        apiOptions,
      );
      upsertBookingServiceUpdate(update);
      setProviderProgressMessage('');
      setNotice('Progress update sent.');
    } catch (error) {
      setNotice(readError(error));
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

  async function submitProviderIssue() {
    if (!selectedBooking) {
      setNotice('Select a booking first.');
      return;
    }
    const reason = providerReportReason.trim();
    const details = providerReportDetails.trim();
    if (!reason || !details) {
      setNotice('Enter the issue subject and details.');
      return;
    }

    setBusyAction('dispute');
    try {
      const dispute = await raiseSelectedBookingDispute(reason, details);
      await submitSupportTicket(
        reason,
        [
          `Booking: ${selectedBooking.bookingReference}`,
          details,
          `Dispute: ${dispute?.id}`,
        ]
          .filter(Boolean)
          .join('\n\n'),
        reportEvidenceUpload ? [mediaAttachmentFromUpload(reportEvidenceUpload)] : [],
      );
      setProviderReportReason('');
      setProviderReportDetails('');
      setReportEvidencePhotoUri(null);
      setReportEvidencePhotoUrl(null);
      setReportEvidenceUpload(null);
      setRoute({ role: 'provider', screen: 'providerBookingDetail' });
      setNotice('Dispute submitted.');
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function pickProviderPhoto(
    kind: 'before' | 'progress' | 'completion',
  ) {
    if (!selectedBooking) {
      setNotice('Select a booking before attaching job photos.');
      return;
    }

    await pickAndUploadImage('provider_progress', async (uri, uploaded) => {
      const attachment = await createBookingAttachment(
        selectedBooking?.id ?? '',
        {
          ...mediaAttachmentFromUpload(uploaded, providerPhotoCaption),
          mediaKind: 'provider_progress',
        },
        apiOptions,
      );
      if (selectedBooking) {
        replaceBooking({
          ...selectedBooking,
          attachments: [attachment, ...(selectedBooking.attachments ?? [])],
        });
      }
      const update = await createBookingServiceUpdate(
        selectedBooking.id,
        {
          updateType:
            kind === 'before'
              ? 'checklist'
              : kind === 'completion'
                ? 'completion'
                : 'progress',
          message:
            kind === 'before'
              ? providerPhotoCaption.trim() || 'Starting condition photo added.'
              : kind === 'completion'
                ? 'Completion photo added.'
                : 'Progress photo added.',
          attachmentId: attachment.id,
        },
        apiOptions,
      );
      upsertBookingServiceUpdate(update);
      if (kind === 'before') {
        setProviderBeforePhotoUri(uri);
        setProviderBeforePhotoUrl(uploaded.publicUrl);
      } else if (kind === 'progress') {
        setProviderProgressPhotoUri(uri);
        setProviderProgressPhotoUrl(uploaded.publicUrl);
      } else {
        setProviderCompletionPhotoUri(uri);
        setProviderCompletionPhotoUrl(uploaded.publicUrl);
      }
    });
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

  async function sendMessage(attachment?: ConversationMessageAttachment | null) {
    const trimmed = messageDraft.trim();
    if (!trimmed && !attachment) {
      setNotice('Write a message or attach an image before sending.');
      return;
    }

    const conversation =
      selectedConversation ??
      conversations.find((item) => item.bookingId === selectedBooking?.id) ??
      (await openSelectedConversation());

    if (!conversation) {
      return;
    }

    setBusyAction('send-message');
    try {
      const message = await createConversationMessage(
        conversation.id,
        trimmed || (attachment ? 'Sent an attachment' : ''),
        attachment ?? null,
        apiOptions,
      );
      setMessages((current) => [...current, message]);
      setMessageDraft('');
      setNotice('Message sent.');
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function attachAndSendMessageImage() {
    await pickAndUploadImage('message_attachment', async (_uri, uploaded) => {
      await sendMessage({
        fileUrl: uploaded.publicUrl,
        fileName: uploaded.path.split('/').pop() ?? null,
        mimeType: uploaded.contentType,
        storagePath: uploaded.path,
        fileSize: uploaded.size,
      });
    });
  }

  async function applyPromotionCode() {
    if (!selectedBooking) {
      setNotice('Select a booking first.');
      return false;
    }

    const code = promoCode.trim();
    if (!code) {
      setPromotionValidation(null);
      setNotice('Enter a promo code first.');
      return false;
    }

    setBusyAction('promo');
    try {
      const promotion = await validatePromotion(
        selectedBooking.id,
        code,
        apiOptions,
      );
      setPromotionValidation(promotion);
      setNotice(
        promotion.valid
          ? `Promo applied: ${formatMoney(promotion.discountAmount)} off.`
          : promotion.message,
      );
      return promotion.valid;
    } catch (error) {
      setNotice(readError(error));
      return false;
    } finally {
      setBusyAction(null);
    }
  }

  async function verifyServiceAddress(): Promise<void> {
    const trimmed = address.trim();
    if (!trimmed) {
      setNotice('Enter a service address first.');
      return;
    }

    setBusyAction('geo-address');
    try {
      const result = await geocodeAddress(trimmed, {
        ...apiOptions,
        language: 'en',
        region: 'PH',
      });
      setAddress(result.formattedAddress);
      setAddressGeoResult(result);
      setNotice(
        `Address verified near ${result.latitude.toFixed(4)}, ${result.longitude.toFixed(4)}.`,
      );
    } catch (error) {
      setAddressGeoResult(null);
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function useCurrentServiceLocation(): Promise<void> {
    setBusyAction('geo-current-location');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== Location.PermissionStatus.GRANTED) {
        setNotice('Location permission is required to use your current address.');
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const result = await reverseGeocode(
        position.coords.latitude,
        position.coords.longitude,
        {
          ...apiOptions,
          language: 'en',
        },
      );

      setAddress(result.formattedAddress);
      setAddressGeoResult(result);
      setNotice('Current location added as your service address.');
    } catch (error) {
      setAddressGeoResult(null);
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function reconcilePendingCheckout(
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
      const code = promoCode.trim();
      let promoCodeForPayment: string | null = null;

      if (code) {
        const promotion = await validatePromotion(
          selectedBooking.id,
          code,
          apiOptions,
        );
        setPromotionValidation(promotion);

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
        setNotice(`Payment ${payment.status} for ${formatMoney(payment.amount)}.`);
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

  function paymentMethodMeta(method: CustomerPaymentMethodSummary) {
    if (method.methodType === 'cash_on_service') {
      return method.isDefault ? 'Default method' : 'Available method';
    }

    const suffix = method.last4 ? ` ending ${method.last4}` : '';
    const label = method.brand ?? method.methodType.toUpperCase();
    return `${label}${suffix}${method.isDefault ? ' · Default' : ''}`;
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

  async function submitSupportTicket(
    subject = supportSubject,
    body = supportMessage,
    attachments = reportEvidenceUpload ? [mediaAttachmentFromUpload(reportEvidenceUpload)] : [],
  ) {
    if (!subject.trim()) {
      setNotice('Enter a support subject.');
      return false;
    }

    setBusyAction('support');
    try {
      const ticket = await createSupportTicket(
        {
          subject: subject.trim(),
          message: body.trim() || null,
          category: 'booking',
          attachments,
        },
        apiOptions,
      );
      setSupportTickets((current) => [ticket, ...current]);
      setSupportSubject('');
      setSupportMessage('');
      setReportEvidencePhotoUri(null);
      setReportEvidencePhotoUrl(null);
      setNotice('Support ticket opened.');
      return true;
    } catch (error) {
      setNotice(readError(error));
      return false;
    } finally {
      setBusyAction(null);
    }
  }

  async function raiseSelectedBookingDispute(
    category: string,
    reason: string,
    description?: string | null,
  ) {
    if (!selectedBooking) {
      setNotice('Select a booking first.');
      return null;
    }

    return raiseBookingDispute(
      selectedBooking.id,
      {
        category,
        reason,
        description: description?.trim() || null,
      },
      apiOptions,
    );
  }

  async function submitCustomerIssue() {
    const subject = supportSubject.trim();
    const body = supportMessage.trim();

    if (!subject || !body || !desiredResolution) {
      setNotice('Choose an issue type, description, and desired resolution.');
      return;
    }

    setBusyAction('dispute');
    try {
      const dispute = await raiseSelectedBookingDispute(
        subject,
        body,
        `Desired resolution: ${desiredResolution}`,
      );
      await submitSupportTicket(
        subject,
        [
          body,
          `Desired resolution: ${desiredResolution}`,
          dispute ? `Dispute: ${dispute.id}` : null,
        ]
          .filter(Boolean)
          .join('\n\n'),
      );
      setDesiredResolution('');
      setRoute({ role: 'customer', screen: 'customerBookingDetail' });
      setNotice('Dispute submitted.');
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function markRead(notificationId: string) {
    setBusyAction(`notification-${notificationId}`);
    try {
      const notification = await markNotificationRead(notificationId, apiOptions);
      setNotifications((current) =>
        current.map((item) => (item.id === notification.id ? notification : item)),
      );
      setNotice('Notification marked read.');
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function openNotification(notification: NotificationSummary) {
    if (!notification.isRead) {
      void markRead(notification.id);
    }
    routeFromNotificationPayload({
      type: notification.type,
      metadata: metadataRecord(notification.metadata),
    });
  }

  function routeFromNotificationPayload(input: {
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
      setExpandedSupportTicketId(intent.ticketId);
      setSupportReplyDraft('');
      if (!supportReplies[intent.ticketId]) {
        void loadSupportTicketReplies(intent.ticketId);
      }
    }

    if (intent.conversationId) {
      setSelectedConversationId(intent.conversationId);
      void listConversationMessages(intent.conversationId, apiOptions)
        .then(setMessages)
        .catch((error) => setNotice(readError(error)));
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

  function metadataRecord(value: unknown): Record<string, unknown> | null {
    if (!value || Array.isArray(value) || typeof value !== 'object') {
      return null;
    }
    return value as Record<string, unknown>;
  }

  async function saveAvailabilityWindow() {
    const existingWindows = availability?.windows ?? [];
    const windows: AvailabilityWindowInput[] = [
      ...existingWindows
        .filter((window) => window.dayOfWeek !== windowDay)
        .map((window) => ({
          dayOfWeek: window.dayOfWeek,
          startTime: window.startTime,
          endTime: window.endTime,
          isActive: window.isActive,
        })),
      {
        dayOfWeek: windowDay,
        startTime: windowStart,
        endTime: windowEnd,
        isActive: true,
      },
    ];

    setBusyAction('availability-window');
    try {
      setAvailability(await replaceProviderAvailabilityWindows(windows, apiOptions));
      setNotice('Availability saved.');
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function addDayOff() {
    if (!dayOffDate.trim()) {
      setNotice('Enter a day-off date.');
      return;
    }

    setBusyAction('day-off');
    try {
      setAvailability(
        await addProviderDayOff(
          {
            offDate: dayOffDate.trim(),
            reason: dayOffReason.trim() || null,
          },
          apiOptions,
        ),
      );
      setDayOffDate('');
      setDayOffReason('');
      setNotice('Day off added.');
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function deleteDayOff(offDate: string) {
    setBusyAction(`day-off-${offDate}`);
    try {
      setAvailability(await removeProviderDayOff(offDate, apiOptions));
      setNotice('Day off removed.');
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
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

  async function refreshBookingTracking(bookingId: string) {
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

  async function refreshProviderDirections(bookingId: string) {
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

  function upsertConversation(conversation: ConversationSummary) {
    setConversations((current) => [
      conversation,
      ...current.filter((item) => item.id !== conversation.id),
    ]);
  }

  function navigate(screen: AppScreen, nextRole = route.role) {
    setNotice('');
    setRoute({ role: nextRole, screen });
  }

  function bookingForConversation(
    conversation: ConversationSummary,
  ): BookingSummary | undefined {
    return bookings.find((booking) => booking.id === conversation.bookingId);
  }

  function conversationTitle(
    conversation: ConversationSummary,
    booking?: BookingSummary,
  ): string {
    const serviceTitle = booking?.serviceTitle ?? 'Booking conversation';
    const counterparty = conversationCounterpartyName(conversation, booking);
    return counterparty ? `${serviceTitle} - ${counterparty}` : serviceTitle;
  }

  function conversationCounterpartyName(
    conversation?: ConversationSummary,
    booking?: BookingSummary,
  ): string | null {
    if (appRole === 'provider') {
      return booking?.customerFullName ?? conversation?.customerId?.slice(0, 8) ?? null;
    }

    return (
      booking?.providerBusinessName ??
      booking?.bookingReference ??
      conversation?.bookingId?.slice(0, 8) ??
      null
    );
  }

  function messageSenderLabel(senderRole: AppRole): string {
    if (senderRole === appRole) {
      return 'You';
    }

    return (
      conversationCounterpartyName(selectedConversation, bookingForSelectedConversation()) ??
      roleLabel(senderRole)
    );
  }

  function bookingForSelectedConversation(): BookingSummary | undefined {
    return selectedConversation
      ? bookingForConversation(selectedConversation)
      : undefined;
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

  function renderCustomer() {
    const activeTab = getCustomerTab(route.screen);
    return (
      <PhoneFrame>
        <StatusStrip />
        {route.screen === 'customerBookingDetail' ? renderCustomerBookingDetail() : null}
        {route.screen === 'customerBookingReview' ? renderBookingReview() : null}
        {route.screen === 'customerReservePayment' ? renderReservePayment() : null}
        {route.screen === 'customerBookingConfirmation' ? renderBookingConfirmation() : null}
        {route.screen === 'customerBookingManage' ? renderManageBooking() : null}
        {route.screen === 'customerBookingCancel' ? renderCancelBooking() : null}
        {route.screen === 'customerBookingReport' ? renderReportIssue() : null}
        {route.screen === 'customerTrackServiceProvider' ? renderCustomerTrackServiceProvider() : null}
        {route.screen === 'customerCategory' ? renderCustomerCategory() : null}
        {route.screen === 'customerAllServices' ? renderCustomerAllServices('All Services') : null}
        {route.screen === 'customerRecommendedServices' ? renderCustomerAllServices('Recommended Services') : null}
        {route.screen === 'customerTopProviders' ? renderCustomerTopProviders() : null}
        {route.screen === 'customerProviderProfile' ? renderCustomerProviderProfile() : null}
        {route.screen === 'customerBookingForm' ? renderCustomerBookingForm() : null}
        {route.screen === 'customerSearchResults' ? renderCustomerAllServices('Search Results') : null}
        {route.screen === 'customerProfile' ? renderCustomerProfile() : null}
        {route.screen === 'customerSettings' ? renderCustomerSettings() : null}
        {route.screen === 'customerPaymentMethods' ? renderCustomerPaymentMethods() : null}
        {route.screen === 'customerHelp' ? renderCustomerHelp() : null}
        {route.screen === 'customerServiceHistory' ? renderCustomerServiceHistory() : null}
        {route.screen === 'customerNotifications' ? renderCustomerNotifications() : null}
        {route.screen === 'customerReferral' ? renderCustomerReferral() : null}
        {route.screen === 'customerTerms' ? renderCustomerTerms() : null}
        {activeTab === 'explore' && route.screen === 'explore' ? renderExplore() : null}
        {activeTab === 'bookings' && route.screen === 'bookings' ? renderBookings() : null}
        {activeTab === 'messages' && route.screen === 'messages' ? renderMessages() : null}
        {activeTab === 'more' && route.screen === 'more' ? renderMore() : null}
        <BottomNavigation
          tabs={[
            {
              key: 'explore',
              label: 'Explore',
              icon: <Search color={activeTab === 'explore' ? palette.mint : '#B0A89E'} size={20} strokeWidth={2.4} />,
            },
            {
              key: 'bookings',
              label: 'Bookings',
              icon: <FolderKanban color={activeTab === 'bookings' ? palette.mint : '#B0A89E'} size={20} strokeWidth={2.4} />,
            },
            {
              key: 'messages',
              label: 'Messages',
              icon: <MessageCircle color={activeTab === 'messages' ? palette.mint : '#B0A89E'} size={20} strokeWidth={2.4} />,
            },
            {
              key: 'more',
              label: 'More',
              icon: <Menu color={activeTab === 'more' ? palette.mint : '#B0A89E'} size={20} strokeWidth={2.4} />,
            },
          ]}
          active={activeTab}
          unreadCount={unreadCount}
          onChange={(tab) => navigate(tab, 'customer')}
        />
      </PhoneFrame>
    );
  }

  function renderProvider() {
    const activeTab = getProviderTab(route.screen);
    const hideBottomNav = hiddenProviderBottomNavScreens.includes(route.screen);
    return (
      <PhoneFrame>
        <StatusStrip />
        {route.screen === 'providerBookingDetail' ? renderProviderBookingDetail() : null}
        {route.screen === 'providerNavigationMode' ? renderProviderNavigationMode() : null}
        {route.screen === 'providerStartService' ? renderProviderStartService() : null}
        {route.screen === 'providerServiceInProgress' ? renderProviderServiceInProgress() : null}
        {route.screen === 'providerCompleteService' ? renderProviderCompleteService() : null}
        {route.screen === 'providerServiceCompleted' ? renderProviderServiceCompleted() : null}
        {route.screen === 'providerCancelBooking' ? renderProviderCancelBooking() : null}
        {route.screen === 'providerReportIssue' ? renderProviderReportIssue() : null}
        {route.screen === 'providerServiceReceipt' ? renderProviderServiceReceipt() : null}
        {route.screen === 'providerProfileView' ? renderProviderProfileView() : null}
        {route.screen === 'providerEditProfile' ? renderProviderEditProfile() : null}
        {route.screen === 'providerPortfolio' ? renderProviderPortfolio() : null}
        {route.screen === 'providerPayoutManagement' ? renderProviderPayoutManagement() : null}
        {route.screen === 'providerRequestPayout' ? renderProviderRequestPayout() : null}
        {route.screen === 'providerNotifications' ? renderProviderNotifications() : null}
        {route.screen === 'providerInsights' ? renderProviderInsights() : null}
        {route.screen === 'providerHelp' ? renderProviderHelp() : null}
        {route.screen === 'providerServices' ? renderProviderServices() : null}
        {route.screen === 'providerSecurity' ? renderProviderSecurity() : null}
        {route.screen === 'providerSettings' ? renderProviderSettings() : null}
        {activeTab === 'home' && route.screen === 'home' ? renderProviderHome() : null}
        {activeTab === 'bookings' && route.screen === 'bookings' ? renderProviderBookings() : null}
        {activeTab === 'calendar' && route.screen === 'calendar' ? renderProviderCalendar() : null}
        {activeTab === 'messages' && route.screen === 'messages' ? renderMessages() : null}
        {activeTab === 'more' && route.screen === 'more' ? renderProviderMore() : null}
        {hideBottomNav ? null : (
          <BottomNavigation
          tabs={[
            {
              key: 'home',
              label: 'Home',
              icon: <Home color={activeTab === 'home' ? palette.mint : '#B0A89E'} size={20} strokeWidth={2.4} />,
            },
            {
              key: 'bookings',
              label: 'Bookings',
              icon: <Calendar color={activeTab === 'bookings' ? palette.mint : '#B0A89E'} size={20} strokeWidth={2.4} />,
            },
            {
              key: 'calendar',
              label: 'Calendar',
              icon: <Clock color={activeTab === 'calendar' ? palette.mint : '#B0A89E'} size={20} strokeWidth={2.4} />,
            },
            {
              key: 'messages',
              label: 'Messages',
              icon: <MessageCircle color={activeTab === 'messages' ? palette.mint : '#B0A89E'} size={20} strokeWidth={2.4} />,
            },
            {
              key: 'more',
              label: 'More',
              icon: <Menu color={activeTab === 'more' ? palette.mint : '#B0A89E'} size={20} strokeWidth={2.4} />,
            },
          ]}
          active={activeTab}
          unreadCount={unreadCount}
          onChange={(tab) => navigate(tab, 'provider')}
        />
        )}
      </PhoneFrame>
    );
  }

  function renderExplore() {
    const rebookOptions = completedRebookOptions(bookings);

    return (
      <ScrollView contentContainerStyle={styles.withBottomNav}>
        <View style={styles.customerHero}>
          <View style={styles.heroRow}>
            <View style={styles.heroIdentity}>
              <View style={styles.heroAvatar}>
                <User color={palette.white} size={20} strokeWidth={2.4} />
              </View>
              <View>
                <Text style={styles.heroMuted}>Good Afternoon</Text>
                <Text style={styles.heroName}>{profile?.user.fullName ?? 'Kisshia'}</Text>
              </View>
            </View>
            <Pressable
              style={styles.notificationButton}
              onPress={() => navigate('customerNotifications', 'customer')}
              accessibilityRole="button"
              accessibilityLabel={
                unreadCount > 0
                  ? `Notifications, ${unreadCount} unread`
                  : 'Notifications'
              }
            >
              <Bell color={palette.white} size={20} strokeWidth={2.2} />
              {unreadCount > 0 ? <View style={styles.heroUnreadDot} /> : null}
            </Pressable>
          </View>
          <Pressable style={styles.searchBar} onPress={() => navigate('customerSearchResults', 'customer')}>
            <Search color={palette.faint} size={18} strokeWidth={2.2} />
            <Text style={styles.searchText}>
              Search for services...
            </Text>
          </Pressable>
        </View>

        <View style={styles.content}>
          <Section
            title="Book it again"
            action={
              <Text
                style={styles.linkText}
                onPress={() => {
                  setBookingFilter('completed');
                  navigate('bookings', 'customer');
                }}
              >
                Recent
              </Text>
            }
          >
            <View style={styles.bookAgainRailWrap}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalRail}
              >
                {rebookOptions
                  .slice(0, 5)
                  .map((booking) => (
                    <Pressable
                      key={booking.id}
                      style={styles.bookAgainCard}
                      onPress={() => openBooking(booking, 'customerBookingDetail')}
                      accessibilityRole="button"
                    >
                      <View style={styles.bookAgainAvatar}>
                        <Text style={styles.bookAgainInitial}>
                          {(booking.serviceTitle ?? 'S').slice(0, 1)}
                        </Text>
                      </View>
                      <View style={styles.flex}>
                        <Text style={styles.bookAgainTitle} numberOfLines={1}>
                          {booking.serviceTitle ?? 'Service booking'}
                        </Text>
                        <Text style={styles.cardMeta} numberOfLines={1}>
                          {booking.providerBusinessName ?? formatDateTime(booking.scheduledAt)}
                        </Text>
                      </View>
                      <ChevronRight color={palette.faint} size={18} />
                    </Pressable>
                  ))}
                {!rebookOptions.length ? (
                  <View style={styles.bookAgainCard}>
                    <View style={styles.bookAgainAvatar}>
                      <Sparkles color={palette.white} size={18} />
                    </View>
                    <View style={styles.flex}>
                      <Text style={styles.bookAgainTitle}>No completed bookings yet</Text>
                      <Text style={styles.cardMeta}>Completed services appear here</Text>
                    </View>
                  </View>
                ) : null}
              </ScrollView>
              {rebookOptions.length > 1 ? (
                <View pointerEvents="none" style={styles.bookAgainRailCue}>
                  <ChevronRight color={palette.mint} size={20} strokeWidth={2.6} />
                </View>
              ) : null}
            </View>
          </Section>

          <Section
            title="Browse categories"
            action={<Text style={styles.linkText} onPress={() => navigate('customerAllServices', 'customer')}>View all</Text>}
          >
            <View style={styles.categoryGrid}>
              {categories.map((category) => (
                <CategoryTile
                  key={category.id}
                  title={category.name}
                  subtitle={category.description ?? 'Tap to view services'}
                  selected={category.id === selectedCategoryId}
                  onPress={() => {
                    setSelectedCategoryId(category.id);
                    void loadServices(category.id);
                    navigate('customerCategory', 'customer');
                  }}
                />
              ))}
            </View>
          </Section>

          <Section
            title="Popular services"
            action={<Text style={styles.linkText} onPress={() => navigate('customerAllServices', 'customer')}>View all</Text>}
          >
            {services.map((service) => (
              <Card
                key={service.id}
                selected={service.id === selectedServiceId}
                onPress={() => {
                  setSelectedServiceId(service.id);
                  void loadProviders(service.id);
                  navigate('customerTopProviders', 'customer');
                }}
              >
                <View style={styles.rowBetween}>
                  <Text style={styles.cardTitle}>{service.name}</Text>
                  <Text style={styles.priceText}>{formatMoney(service.price)}</Text>
                </View>
                <Text style={styles.cardBody}>{service.description ?? 'Bookable service'}</Text>
              </Card>
            ))}
          </Section>

          <Section
            title="Top service providers"
            action={<Text style={styles.linkText} onPress={() => navigate('customerTopProviders', 'customer')}>View all</Text>}
          >
            {providers.map((provider) => (
              <Card
                key={provider.id}
                selected={provider.providerId === selectedProviderId}
                onPress={() => {
                  selectProvider(provider);
                  navigate('customerProviderProfile', 'customer');
                }}
              >
                <View style={styles.rowBetween}>
                  <View style={styles.flex}>
                    <Text style={styles.cardTitle}>{provider.title}</Text>
                    <Text style={styles.cardMeta}>{provider.providerBusinessName ?? 'Service provider'}</Text>
                  </View>
                  <Badge
                    label={provider.verificationStatus}
                    tone={provider.verificationStatus === 'approved' ? 'success' : 'warning'}
                  />
                </View>
                <Text style={styles.cardBody}>{provider.description ?? 'Ready to book.'}</Text>
                <View style={styles.rowBetween}>
                  <Text style={styles.priceText}>{formatMoney(provider.price)}</Text>
                  <Text style={styles.cardMeta}>
                    {provider.averageRating.toFixed(1)} rating · {provider.reviewCount} reviews
                  </Text>
                </View>
              </Card>
            ))}
          </Section>
        </View>
      </ScrollView>
    );
  }

  function renderBookingReview() {
    if (!selectedProvider) {
      return <MissingSelection onBack={() => navigate('customerTopProviders', 'customer')} />;
    }

    const baseAmount = selectedProvider?.price ?? selectedService?.price ?? 0;
    const duration = Number(hoursRequired) || 1;
    const subtotal = selectedProvider?.pricingMode === 'hourly' ? baseAmount * duration : baseAmount;
    const processingFee = Math.max(25, Math.round(subtotal * 0.05));
    const bookingCost = subtotal + processingFee;
    const scheduledAtIso = toManilaBookingIso(scheduledAt);

    return (
      <>
        <TopBar
          title="Review booking"
          subtitle="Step 2 of 2 · Confirm and send"
          onBack={() => navigate('customerBookingForm', 'customer')}
        />
        <ScrollView contentContainerStyle={styles.withStickyFooter}>
          <View style={styles.content}>
            <Card>
              <View style={styles.providerSummaryRow}>
                <View style={styles.providerPhoto}>
                  <Text style={styles.providerPhotoText}>
                    {(selectedProvider?.providerBusinessName ?? selectedProvider?.title ?? 'S').slice(0, 1)}
                  </Text>
                </View>
                <View style={styles.flex}>
                  <Text style={styles.cardTitle}>
                    {selectedProvider.providerBusinessName ?? selectedProvider.title}
                  </Text>
                  <Text style={styles.cardMeta}>
                    {selectedProvider.averageRating.toFixed(1)} rating · {selectedProvider.reviewCount} reviews
                  </Text>
                  <Pressable
                    style={styles.profileLinkRow}
                    onPress={() => navigate('customerProviderProfile', 'customer')}
                    accessibilityRole="button"
                    accessibilityLabel="View provider profile"
                  >
                    <Text style={styles.linkText}>View Profile</Text>
                    <ChevronRight color={palette.mint} size={18} />
                  </Pressable>
                </View>
              </View>
            </Card>

            <Section title="Service details">
              <InfoRow label="Service" value={selectedService?.name ?? selectedProvider.title} />
              <InfoRow label="Date and time" value={formatDateTime(scheduledAtIso)} />
              <InfoRow label="Estimated duration" value={formatBookingDuration(duration)} />
              <InfoRow label="Pricing" value={pricingModeLabel(selectedProvider.pricingMode)} />
              <InfoRow label="Address" value={address || 'Address required'} />
              <InfoRow label="Reference photo" value={bookingReferencePhotoUrl ? 'Attached' : 'None'} />
            </Section>

            <Section title="Special instructions">
              <InfoRow label="Your notes" value={notes.trim() || 'None provided'} />
            </Section>

            <Section title="Price breakdown">
              <InfoRow label="Sub-total" value={formatMoney(subtotal)} />
              <InfoRow label="Processing fee" value={formatMoney(processingFee)} />
              <InfoRow
                label="Promo code"
                value={
                  promotionValidation?.valid
                    ? `${promotionValidation.code} applied`
                    : promoCode.trim()
                      ? 'Enter on payment step'
                      : 'No promo applied'
                }
              />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Booking Cost</Text>
                <Text style={styles.totalValue}>{formatMoney(bookingCost)}</Text>
              </View>
            </Section>

            <View style={styles.noticeBox}>
              <Text style={styles.noticeText}>You won't be charged until the service is completed.</Text>
            </View>
          </View>
        </ScrollView>
        <View style={styles.stickyFooter}>
          <PrimaryButton
            label={busyAction === 'create-booking' ? 'Creating...' : 'Confirm Booking'}
            onPress={() => void submitBooking()}
            disabled={busyAction === 'create-booking' || !address.trim() || !scheduledAtIso}
          />
          <Text style={styles.footerLink} onPress={() => navigate('customerBookingForm', 'customer')}>
            Edit booking
          </Text>
          <View style={styles.footerHomeIndicator} />
        </View>
      </>
    );
  }

  function renderCustomerCategory() {
    const categoryName =
      categories.find((category) => category.id === selectedCategoryId)?.name ?? 'Services';

    return (
      <>
        <TopBar
          title={categoryName}
          subtitle={`${services.length} services available`}
          onBack={() => navigate('explore', 'customer')}
        />
        <ScrollView contentContainerStyle={styles.withBottomNav}>
          <View style={styles.content}>
            <Text style={styles.detailTitle}>{categoryName}</Text>
            <Text style={styles.cardMeta}>{services.length} services available</Text>
            {services.map((service) => (
              <ServiceListItem
                key={service.id}
                service={service}
                onPress={() => {
                  setSelectedServiceId(service.id);
                  void loadProviders(service.id);
                  navigate('customerTopProviders', 'customer');
                }}
              />
            ))}
            {!services.length ? (
              <EmptyState title="No services found" body="Try another category." />
            ) : null}
          </View>
        </ScrollView>
      </>
    );
  }

  function renderCustomerAllServices(title: string) {
    const query = marketplaceSearchQuery.trim().toLowerCase();
    const visibleServices = services.filter((service) => {
      if (!query) {
        return true;
      }
      return [service.name, service.description ?? ''].some((value) =>
        value.toLowerCase().includes(query),
      );
    });

    return (
      <>
        <TopBar title={title} onBack={() => navigate('explore', 'customer')} />
        <ScrollView contentContainerStyle={styles.withBottomNav}>
          <View style={styles.content}>
            <View style={styles.marketSearchShell}>
              <Search color={palette.faint} size={20} />
              <Field
                label=""
                value={marketplaceSearchQuery}
                onChangeText={setMarketplaceSearchQuery}
                placeholder="Search for services..."
              />
            </View>
            <View style={styles.serviceGrid}>
              {visibleServices.map((service) => (
                <Pressable
                  key={service.id}
                  style={styles.serviceTile}
                  onPress={() => {
                    setSelectedServiceId(service.id);
                    void loadProviders(service.id);
                    navigate('customerTopProviders', 'customer');
                  }}
                >
                  <View style={styles.serviceImageMock}>
                    <Text style={styles.serviceImageInitial}>{service.name.slice(0, 1)}</Text>
                  </View>
                  <Text style={styles.cardTitle} numberOfLines={1}>{service.name}</Text>
                  <Text style={styles.cardMeta} numberOfLines={2}>
                    {service.description ?? 'Bookable service'}
                  </Text>
                  <View style={styles.ratingRow}>
                    <Star color="#FFC107" fill="#FFC107" size={13} />
                    <Text style={styles.cardMeta}>4.8</Text>
                  </View>
                  <Text style={styles.priceText}>From {formatMoney(service.price)}</Text>
                </Pressable>
              ))}
            </View>
            {!visibleServices.length ? (
              <EmptyState title="No services found" body="Try searching with different keywords." />
            ) : null}
          </View>
        </ScrollView>
      </>
    );
  }

  function renderCustomerTopProviders() {
    const query = marketplaceSearchQuery.trim().toLowerCase();
    const visibleProviders = providers.filter((provider) => {
      if (!query) {
        return true;
      }
      return [
        provider.providerBusinessName ?? '',
        provider.title,
        provider.description ?? '',
      ].some((value) => value.toLowerCase().includes(query));
    });

    return (
      <>
        <TopBar title="Top-rated Providers" onBack={() => navigate('explore', 'customer')} />
        <ScrollView contentContainerStyle={styles.withBottomNav}>
          <View style={styles.content}>
            <View style={styles.marketSearchShell}>
              <Search color={palette.faint} size={20} />
              <Field
                label=""
                value={marketplaceSearchQuery}
                onChangeText={setMarketplaceSearchQuery}
                placeholder="Search by name or service..."
              />
            </View>
            {visibleProviders.map((provider) => (
              <ProviderListItem
                key={provider.id}
                provider={provider}
                onPress={() => {
                  selectProvider(provider);
                  navigate('customerProviderProfile', 'customer');
                }}
              />
            ))}
            {!visibleProviders.length ? (
              <EmptyState title="No providers found" body="Try another search term." />
            ) : null}
          </View>
        </ScrollView>
      </>
    );
  }

  function renderCustomerProviderProfile() {
    if (!selectedProvider) {
      return <MissingSelection onBack={() => navigate('customerTopProviders', 'customer')} />;
    }

    return (
      <>
        <TopBar title="Provider Profile" onBack={() => navigate('customerTopProviders', 'customer')} />
        <ScrollView contentContainerStyle={styles.withStickyFooter}>
          <View style={styles.providerCover} />
          <View style={styles.providerProfileBody}>
            <View style={styles.providerProfileAvatar}>
              <Text style={styles.providerProfileAvatarText}>
                {(selectedProvider.providerBusinessName ?? selectedProvider.title).slice(0, 1)}
              </Text>
            </View>
            <Text style={styles.profileName}>
              {selectedProvider.providerBusinessName ?? selectedProvider.title}
            </Text>
            <View style={styles.wrap}>
              <Badge
                label={selectedProvider.verificationStatus}
                tone={selectedProvider.verificationStatus === 'approved' ? 'success' : 'warning'}
              />
              <Badge label="Marketplace provider" tone="neutral" />
            </View>
            <View style={styles.profileStatsGrid}>
              <MetricCard label="Rating" value={selectedProvider.averageRating.toFixed(1)} />
              <MetricCard label="Reviews" value={selectedProvider.reviewCount} />
              <MetricCard label="Service" value={formatMoney(selectedProvider.price)} />
            </View>
            <View style={styles.profileActionRow}>
              <PrimaryButton
                label="Book Now"
                onPress={() => navigate('customerBookingForm', 'customer')}
              />
              <PrimaryButton
                label="Message"
                variant="secondary"
                onPress={() => void openSelectedConversation()}
              />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalRail}>
              {providerProfileTabs.map((tab) => (
                <Pill
                  key={tab}
                  label={tab}
                  selected={providerProfileTab === tab}
                  onPress={() => setProviderProfileTab(tab)}
                />
              ))}
            </ScrollView>
            {renderProviderProfileTab()}
          </View>
        </ScrollView>
        <View style={styles.stickyFooter}>
          <PrimaryButton label="Book Service" onPress={() => navigate('customerBookingForm', 'customer')} />
          <View style={styles.footerHomeIndicator} />
        </View>
      </>
    );
  }

  function renderProviderProfileTab() {
    if (!selectedProvider) {
      return null;
    }

    if (providerProfileTab === 'Services') {
      return (
        <Section title="Services">
          <ServiceListItem
            service={{
              id: selectedProvider.serviceId ?? selectedProvider.id,
              categoryId: null,
              name: selectedProvider.title,
              description: selectedProvider.description,
              price: selectedProvider.price,
              pricingMode: selectedProvider.pricingMode,
            }}
            onPress={() => navigate('customerBookingForm', 'customer')}
          />
        </Section>
      );
    }

    if (providerProfileTab === 'Portfolio') {
      return (
        <Section title="Portfolio">
          <View style={styles.portfolioGrid}>
            {selectedProviderPortfolioMedia.map((item) => (
              <View key={item.id} style={styles.portfolioTile}>
                <Image source={{ uri: item.fileUrl }} style={styles.portfolioImage} />
                {item.caption ? (
                  <Text style={styles.portfolioText} numberOfLines={1}>{item.caption}</Text>
                ) : null}
              </View>
            ))}
          </View>
          {!selectedProviderPortfolioMedia.length ? (
            <EmptyState title="No portfolio yet" body="Provider work samples will appear here." />
          ) : null}
        </Section>
      );
    }

    if (providerProfileTab === 'Reviews') {
      return (
        <Section title="Reviews">
          {reviews.slice(0, 5).map((review) => (
            <Card key={review.id}>
              <View style={styles.rowBetween}>
                <View style={styles.ratingRow}>
                  <Star color="#FFC107" fill="#FFC107" size={14} />
                  <Text style={styles.cardTitle}>{review.rating.toFixed(1)}</Text>
                </View>
                {session ? (
                  <Text
                    style={styles.cardMeta}
                    onPress={() => void submitFlagReview(review.id)}
                  >
                    {busyAction === `flag-review-${review.id}` ? 'Flagging…' : 'Flag'}
                  </Text>
                ) : null}
              </View>
              <Text style={styles.cardBody}>{review.reviewText ?? 'No review text provided.'}</Text>
            </Card>
          ))}
          {!reviews.length ? <EmptyState title="No reviews yet" body="Reviews for this provider appear here." /> : null}
        </Section>
      );
    }

    if (providerProfileTab === 'Availability') {
      const activeWindows =
        selectedProviderAvailability?.windows.filter((window) => window.isActive) ?? [];
      const daysOff = selectedProviderAvailability?.daysOff ?? [];

      return (
        <Section title="Availability">
          <Card>
            <Text style={styles.cardTitle}>Available booking windows</Text>
            {activeWindows.map((window) => (
              <InfoRow
                key={window.id}
                label={dayLabels[window.dayOfWeek]}
                value={`${window.startTime} - ${window.endTime}`}
              />
            ))}
            {!activeWindows.length ? (
              <Text style={styles.cardMeta}>No public availability windows are active yet.</Text>
            ) : null}
          </Card>
          {daysOff.length ? (
            <Card>
              <Text style={styles.cardTitle}>Unavailable dates</Text>
              {daysOff.map((dayOff) => (
                <InfoRow
                  key={dayOff.id}
                  label={dayOff.offDate}
                  value={dayOff.reason ?? 'Unavailable'}
                />
              ))}
            </Card>
          ) : null}
        </Section>
      );
    }

    return (
      <Section title="About">
        <Card>
          <Text style={styles.cardBody}>
            {selectedProvider.description ??
              'Professional service provider available through ServEase.'}
          </Text>
          <InfoRow label="Service" value={selectedProvider.title} />
          <InfoRow label="Pricing" value={formatMoney(selectedProvider.price)} />
          <InfoRow label="Verification" value={selectedProvider.verificationStatus} />
        </Card>
      </Section>
    );
  }

  function renderCustomerBookingForm() {
    if (!selectedProvider) {
      return <MissingSelection onBack={() => navigate('customerTopProviders', 'customer')} />;
    }

    const dateOnly = scheduledAt.slice(0, 10);
    const timeOnly = scheduledAt.slice(11, 16);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingDates = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = `${d.getMonth() + 1}`.padStart(2, '0');
      const dd = `${d.getDate()}`.padStart(2, '0');
      return {
        value: `${yyyy}-${mm}-${dd}`,
        weekday: d.toLocaleDateString('en-PH', { weekday: 'short' }),
        day: d.getDate(),
        month: d.toLocaleDateString('en-PH', { month: 'short' }),
        isToday: i === 0,
        isTomorrow: i === 1,
      };
    });
    const availableTimesForDate = providerBookingSlots
      .filter((slot) => slot.value.startsWith(`${dateOnly}T`))
      .map((slot) => slot.value.slice(11, 16));
    const timeOptions = bookingTimeSlots.map((time) => ({
      time,
      isAvailable:
        availableTimesForDate.length === 0 || availableTimesForDate.includes(time),
    }));
    const missingFields: string[] = [];
    if (!dateOnly) missingFields.push('a date');
    if (!timeOnly) missingFields.push('a time');
    if (!address.trim()) missingFields.push('the service address');
    const duration = Number(hoursRequired) || 1;
    const baseRate = selectedProvider.price ?? 0;
    const estimatedTotal =
      selectedProvider.pricingMode === 'hourly' ? baseRate * duration : baseRate;
    const canContinue = missingFields.length === 0;

    return (
      <>
        <TopBar
          title="Book Service"
          subtitle="Step 1 of 2 · Choose details"
          onBack={() => navigate('customerProviderProfile', 'customer')}
        />
        <ScrollView contentContainerStyle={styles.withStickyFooter}>
          <View style={styles.content}>
            <Card>
              <View style={styles.providerSummaryRow}>
                <View style={styles.providerPhoto}>
                  <Text style={styles.providerPhotoText}>
                    {(selectedProvider.providerBusinessName ?? selectedProvider.title).slice(0, 1)}
                  </Text>
                </View>
                <View style={styles.flex}>
                  <Text style={styles.cardTitle}>
                    {selectedProvider.providerBusinessName ?? selectedProvider.title}
                  </Text>
                  <Text style={styles.cardMeta}>
                    {selectedProvider.title} · {formatMoney(selectedProvider.price)}
                    {selectedProvider.pricingMode === 'hourly' ? ' / hr' : ''}
                  </Text>
                  <Text style={styles.cardMeta}>
                    {selectedProvider.averageRating.toFixed(1)} ★ rating
                  </Text>
                </View>
              </View>
            </Card>

            <Section title="Pick a date">
              <View style={styles.dateRailWrap}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator
                  contentContainerStyle={styles.horizontalRail}
                >
                  {upcomingDates.map((d) => {
                    const isSelected = dateOnly === d.value;
                    return (
                      <Pressable
                        key={d.value}
                        style={[styles.dateChip, isSelected && styles.dateChipSelected]}
                        onPress={() =>
                          setScheduledAt(`${d.value}T${timeOnly || '09:00'}`)
                        }
                        accessibilityRole="button"
                        accessibilityState={{ selected: isSelected }}
                      >
                        <Text
                          style={[
                            styles.dateChipDow,
                            isSelected && styles.dateChipDowSelected,
                          ]}
                        >
                          {d.isToday ? 'Today' : d.isTomorrow ? 'Tomorrow' : d.weekday}
                        </Text>
                        <Text
                          style={[
                            styles.dateChipDay,
                            isSelected && styles.dateChipDaySelected,
                          ]}
                        >
                          {d.day}
                        </Text>
                        <Text
                          style={[
                            styles.dateChipMonth,
                            isSelected && styles.dateChipDowSelected,
                          ]}
                        >
                          {d.month}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
                <View pointerEvents="none" style={styles.dateRailCue}>
                  <ChevronRight color={palette.mint} size={20} strokeWidth={2.6} />
                </View>
              </View>
            </Section>

            <Section title="Pick a time">
              <View style={styles.timeGrid}>
                {timeOptions.map(({ time, isAvailable }) => {
                  const isSelected = timeOnly === time;
                  return (
                    <Pressable
                      key={time}
                      style={[
                        styles.timeTile,
                        isSelected && styles.timeTileSelected,
                        !isAvailable && styles.timeTileDisabled,
                      ]}
                      onPress={() => {
                        if (!isAvailable) {
                          setNotice('That time is outside the provider schedule.');
                          return;
                        }
                        setScheduledAt(
                          `${dateOnly || defaultScheduledAt.slice(0, 10)}T${time}`,
                        );
                      }}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected, disabled: !isAvailable }}
                    >
                      <Text
                        style={[
                          styles.timeTileText,
                          isSelected && styles.timeTileTextSelected,
                          !isAvailable && styles.timeTileTextDisabled,
                        ]}
                      >
                        {time}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={styles.cardMeta}>
                {providerBookingSlots.length
                  ? 'Greyed times fall outside this provider\'s posted availability.'
                  : 'Provider availability still loading — you can still pick a tentative slot.'}
              </Text>
            </Section>

            <Section
              title="Where do you need it?"
              action={
                <View style={styles.inlineActions}>
                  <Pressable
                    style={[
                      styles.smallAction,
                      busyAction === 'geo-current-location' && styles.faded,
                    ]}
                    onPress={() => void useCurrentServiceLocation()}
                    disabled={busyAction === 'geo-current-location'}
                    accessibilityRole="button"
                    accessibilityLabel="Use current location as service address"
                  >
                    <Navigation color={palette.mint} size={14} strokeWidth={2.5} />
                    <Text style={styles.smallActionText}>
                      {busyAction === 'geo-current-location' ? 'Locating...' : 'Use current'}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.smallAction,
                      (!address.trim() || busyAction === 'geo-address') && styles.faded,
                    ]}
                    onPress={() => void verifyServiceAddress()}
                    disabled={!address.trim() || busyAction === 'geo-address'}
                    accessibilityRole="button"
                    accessibilityLabel="Verify service address"
                  >
                    <Text style={styles.smallActionText}>
                      {busyAction === 'geo-address' ? 'Checking...' : 'Verify address'}
                    </Text>
                  </Pressable>
                </View>
              }
            >
              <Field
                label="Service Address"
                value={address}
                onChangeText={(value) => {
                  setAddress(value);
                  setAddressGeoResult(null);
                }}
                placeholder="House, street, barangay, city"
                multiline
              />
              {addressGeoResult ? (
                <AddressVerificationPreview result={addressGeoResult} />
              ) : null}
              <Field
                label="Duration (hours)"
                value={hoursRequired}
                onChangeText={setHoursRequired}
                keyboardType="number-pad"
                placeholder="1"
              />
            </Section>

            <Section title="Add details (optional)">
              <Field
                label="Tell the provider what you need"
                value={notes}
                onChangeText={setNotes}
                placeholder="Example: Kitchen sink leak under cabinet"
                multiline
              />
              <Pressable
                style={styles.uploadBox}
                onPress={() => void pickAndUploadImage('booking_reference', (uri, uploaded) => {
                  setBookingReferencePhotoUri(uri);
                  setBookingReferencePhotoUrl(uploaded.publicUrl);
                  setBookingReferenceUpload(uploaded);
                })}
                accessibilityRole="button"
              >
                {bookingReferencePhotoUri ? (
                  <Image source={{ uri: bookingReferencePhotoUri }} style={styles.uploadPreview} />
                ) : (
                  <Upload color={palette.mint} size={28} />
                )}
                <Text style={styles.cardMeta}>Reference photo (optional)</Text>
                <Text style={styles.linkText}>
                  {bookingReferencePhotoUrl ? 'Photo attached · tap to replace' : 'Attach a photo'}
                </Text>
              </Pressable>
            </Section>

          </View>
        </ScrollView>
        <View style={styles.stickyFooter}>
          <View style={styles.footerTotalRow}>
            <View>
              <Text style={styles.footerTotalLabel}>Estimated total</Text>
              <Text style={styles.cardMeta}>
                {selectedProvider.pricingMode === 'hourly'
                  ? `${formatMoney(selectedProvider.price)} x ${duration}h`
                  : 'Service rate'}{' '}
                · callout fee {formatMoney(0)}
              </Text>
            </View>
            <Text style={styles.footerTotalValue}>{formatMoney(estimatedTotal)}</Text>
          </View>
          {!canContinue ? (
            <Text style={styles.noticeText}>
              Add {missingFields.join(', ').replace(/, ([^,]*)$/, ' and $1')} to continue.
            </Text>
          ) : null}
          <PrimaryButton
            label="Continue to Review"
            onPress={() => navigate('customerBookingReview', 'customer')}
            disabled={!canContinue}
          />
          <Text
            style={styles.footerLink}
            onPress={() => navigate('customerProviderProfile', 'customer')}
          >
            Back to provider
          </Text>
          <View style={styles.footerHomeIndicator} />
        </View>
      </>
    );
  }

  function renderReservePayment() {
    if (!selectedBooking) {
      return <MissingSelection onBack={() => navigate('bookings', 'customer')} />;
    }

    return (
      <>
        <TopBar title="Reserve payment" onBack={() => navigate('customerBookingDetail', 'customer')} />
        <ScrollView contentContainerStyle={styles.withStickyFooter}>
          <View style={styles.content}>
            <View style={styles.noticeBox}>
              <Text style={styles.cardBody}>
                Cash-on-service reserves the booking in ServEase. Cards and wallets open secure APICenter checkout.
              </Text>
            </View>
            <Section title="Saved payment methods">
              {customerPaymentMethods.length ? (
                customerPaymentMethods.map((method) => {
                  const selected = selectedCustomerPaymentMethod?.id === method.id;
                  return (
                    <Pressable
                      key={method.id}
                      style={[
                        styles.paymentMethodOption,
                        selected && styles.paymentMethodSelected,
                      ]}
                      onPress={() => setSelectedCustomerPaymentMethodId(method.id)}
                      accessibilityRole="button"
                    >
                      <View
                        style={[
                          styles.radioOuter,
                          selected && styles.radioOuterSelected,
                        ]}
                      >
                        {selected ? <View style={styles.radioInner} /> : null}
                      </View>
                      <CreditCard
                        color={selected ? palette.mint : palette.muted}
                        size={22}
                      />
                      <View style={styles.flex}>
                        <Text style={styles.cardTitle}>{method.label}</Text>
                        <Text style={styles.cardMeta}>
                          {paymentMethodMeta(method)}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })
              ) : (
                <ActivityIndicator color={palette.mint} />
              )}
              <PrimaryButton
                label="ADD NEW CARD"
                variant="secondary"
                onPress={() => void saveCustomerPaymentMethod('card')}
              />
            </Section>
            <Card>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.cardTitle}>Wallet options</Text>
                  <Text style={styles.cardMeta}>GCash and PayMaya use secure checkout</Text>
                </View>
                <View style={styles.inlineActions}>
                  <Pressable
                    style={styles.smallAction}
                    onPress={() => void saveCustomerPaymentMethod('gcash')}
                  >
                    <Text style={styles.smallActionText}>GCash</Text>
                  </Pressable>
                  <Pressable
                    style={styles.smallAction}
                    onPress={() => void saveCustomerPaymentMethod('paymaya')}
                  >
                    <Text style={styles.smallActionText}>PayMaya</Text>
                  </Pressable>
                </View>
              </View>
            </Card>
            <Card>
              <Text style={styles.cardTitle}>Promo code</Text>
              <Field
                label="Code"
                value={promoCode}
                onChangeText={(value) => {
                  setPromoCode(value.toUpperCase());
                  setPromotionValidation(null);
                }}
                placeholder="SERVEASE10"
              />
              <PrimaryButton
                label={busyAction === 'promo' ? 'Applying...' : 'Apply'}
                variant="secondary"
                onPress={() => void applyPromotionCode()}
                disabled={busyAction === 'promo' || Boolean(selectedPayment)}
              />
              {promotionValidation ? (
                <View
                  style={
                    promotionValidation.valid
                      ? styles.promoAppliedBox
                      : styles.promoRejectedBox
                  }
                >
                  <Text style={styles.cardTitle}>
                    {promotionValidation.valid ? 'Promo applied' : 'Promo unavailable'}
                  </Text>
                  <Text style={styles.cardMeta}>{promotionValidation.message}</Text>
                  {promotionValidation.valid ? (
                    <>
                      <InfoRow
                        label="Discount"
                        value={formatMoney(promotionValidation.discountAmount)}
                      />
                      <InfoRow
                        label="Amount due"
                        value={formatMoney(promotionValidation.finalAmount)}
                      />
                    </>
                  ) : null}
                </View>
              ) : null}
            </Card>
          </View>
        </ScrollView>
        <View style={styles.stickyFooter}>
          <PrimaryButton
            label={selectedPayment ? 'Payment reserved' : 'Confirm'}
            onPress={() => void reservePayment()}
            disabled={busyAction === 'payment' || Boolean(selectedPayment)}
          />
          <View style={styles.footerHomeIndicator} />
        </View>
      </>
    );
  }

  function renderBookingConfirmation() {
    if (!selectedBooking) {
      return <MissingSelection onBack={() => navigate('bookings', 'customer')} />;
    }

    return (
      <>
        <ScrollView contentContainerStyle={styles.withBottomNav}>
          <View style={styles.confirmationContent}>
            <View style={styles.successCircle}>
              <CheckCircle color={palette.white} size={44} strokeWidth={2.6} />
            </View>
            <Text style={styles.confirmationTitle}>Your booking is confirmed!</Text>
            <Text style={styles.bookingReference}>{selectedBooking.bookingReference}</Text>

            <Card>
              <View style={styles.providerSummaryRow}>
                <View style={styles.providerPhoto}>
                  <Text style={styles.providerPhotoText}>
                    {(selectedProvider?.providerBusinessName ?? 'S').slice(0, 1)}
                  </Text>
                </View>
                <View style={styles.flex}>
                  <Text style={styles.cardTitle}>
                    {selectedProvider?.providerBusinessName ?? 'Assigned service provider'}
                  </Text>
                  <Text style={styles.cardMeta}>
                    {selectedProvider ? `${selectedProvider.averageRating.toFixed(1)} rating` : 'Provider details'}
                  </Text>
                  <Pressable
                    style={styles.profileLinkRow}
                    onPress={() => {
                      if (selectedProvider) {
                        navigate('customerProviderProfile', 'customer');
                      } else {
                        setNotice('Provider profile still loading.');
                      }
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="View provider profile"
                  >
                    <Text style={styles.linkText}>View Profile</Text>
                    <ChevronRight color={palette.mint} size={18} />
                  </Pressable>
                </View>
              </View>
            </Card>

            <Section title="Service summary">
              <InfoRow label="Date" value={formatDateTime(selectedBooking.scheduledAt)} />
              <InfoRow label="Location" value={selectedBooking.serviceAddress ?? 'Address unavailable'} />
              <InfoRow label="Cost" value={formatMoney(selectedBooking.totalAmount)} />
            </Section>

            <StatusTimeline steps={timelineForStatus(selectedBooking.status)} />
            {renderBookingTimelineEvents()}
            <Text style={styles.noticeText}>
              You booked this service for {formatDateTime(selectedBooking.scheduledAt)}.
            </Text>

            <View style={styles.twoButtons}>
              <PrimaryButton
                label="Manage booking"
                onPress={() => navigate('customerBookingManage', 'customer')}
              />
              <PrimaryButton
                label="Add to calendar"
                variant="secondary"
                onPress={() => void addSelectedBookingToCalendar()}
              />
            </View>
            <PrimaryButton
              label="Reserve payment"
              variant="secondary"
              onPress={() => navigate('customerReservePayment', 'customer')}
              disabled={Boolean(selectedPayment)}
            />
          </View>
        </ScrollView>
      </>
    );
  }

  function renderBookings() {
    const visibleBookings = bookings.filter((booking) =>
      bookingFilter === 'completed'
        ? booking.status === 'completed'
        : booking.status !== 'completed' && booking.status !== 'cancelled' && booking.status !== 'rejected',
    );
    return (
      <>
        <TopBar
          title="Bookings"
          subtitle="Track work in progress and completed service history"
          right={
            <PrimaryButton
              label="Refresh"
              variant="secondary"
              onPress={() => void refreshWorkspace()}
              disabled={busyAction === 'refresh'}
            />
          }
        />
        <ScrollView contentContainerStyle={styles.withBottomNav}>
          <View style={styles.content}>
            <View style={styles.segmentRow}>
              <Pill
                label="Active"
                selected={bookingFilter === 'active'}
                onPress={() => setBookingFilter('active')}
              />
              <Pill
                label="Completed"
                selected={bookingFilter === 'completed'}
                onPress={() => setBookingFilter('completed')}
              />
            </View>
            {visibleBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                role={appRole}
                onPress={() => openBooking(booking, 'customerBookingDetail')}
              />
            ))}
            {!visibleBookings.length ? (
              <EmptyState
                title="No bookings here"
                body="Browse services and book a service provider to get started."
              />
            ) : null}
          </View>
        </ScrollView>
      </>
    );
  }

  function renderCustomerBookingDetail() {
    if (!selectedBooking) {
      return <MissingSelection onBack={() => navigate('bookings', 'customer')} />;
    }
    return (
      <>
        <TopBar
          title="Booking Information"
          subtitle={selectedBooking.serviceAddress ?? 'Address unavailable'}
          onBack={() => navigate('bookings', 'customer')}
        />
        <ScrollView contentContainerStyle={styles.withBottomNav}>
          <View style={styles.content}>
            <Card>
              <Text style={styles.bookingReference}>{selectedBooking.bookingReference}</Text>
              <Text style={styles.detailTitle}>{selectedBooking.serviceTitle ?? 'Service booking'}</Text>
              <Text style={styles.cardMeta}>
                The service provider will start · {formatDateTime(selectedBooking.scheduledAt)}
              </Text>
              <StatusTimeline steps={timelineForStatus(selectedBooking.status)} />
              <View style={styles.rowBetween}>
                <Text style={styles.priceText}>{formatMoney(selectedBooking.totalAmount)}</Text>
                <Badge {...bookingStatusChip(selectedBooking.status)} />
              </View>
            </Card>
            {renderBookingTimelineEvents()}
            <Card>
              <Text style={styles.cardTitle}>Service details</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Description</Text>
                <Text style={styles.infoValue}>
                  {selectedBooking.serviceDescription?.trim() || 'No additional description provided.'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Special instructions</Text>
                <Text style={styles.infoValue}>
                  {selectedBooking.customerNotes?.trim() || 'None'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Estimated duration</Text>
                <Text style={styles.infoValue}>
                  {formatBookingDuration(selectedBooking.hoursRequired)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Pricing</Text>
                <Text style={styles.infoValue}>
                  {pricingModeLabel(selectedBooking.pricingMode)}
                </Text>
              </View>
            </Card>
            <Card>
              <Text style={styles.cardTitle}>Service provider</Text>
              <Text style={styles.cardBody}>
                {selectedBooking.providerBusinessName ??
                  selectedProvider?.providerBusinessName ??
                  'Provider details unavailable'}
              </Text>
              <Pressable
                style={styles.profileLinkRow}
                onPress={() => {
                  if (selectedProvider) {
                    navigate('customerProviderProfile', 'customer');
                  } else {
                    setNotice('Provider profile still loading.');
                  }
                }}
                accessibilityRole="button"
                accessibilityLabel="View provider profile"
              >
                <Text style={styles.linkText}>View Profile</Text>
                <ChevronRight color={palette.mint} size={18} />
              </Pressable>
            </Card>
            {['confirmed', 'in_progress'].includes(selectedBooking.status) ? (
              <PrimaryButton
                label="Track provider"
                onPress={() => {
                  void refreshBookingTracking(selectedBooking.id);
                  navigate('customerTrackServiceProvider', 'customer');
                }}
              />
            ) : null}
            {renderBookingMedia(selectedBooking)}
            {renderBookingServiceUpdates()}
            <View style={styles.twoButtons}>
              <PrimaryButton
                label="Manage booking"
                onPress={() => navigate('customerBookingManage', 'customer')}
              />
              <PrimaryButton
                label="Message"
                variant="secondary"
                onPress={() => void openSelectedConversation()}
              />
            </View>
            {selectedBooking.status !== 'completed' ? (
              <PrimaryButton
                label={selectedPayment ? 'Payment reserved' : 'Reserve payment'}
                variant="secondary"
                onPress={() => navigate('customerReservePayment', 'customer')}
                disabled={Boolean(selectedPayment)}
              />
            ) : selectedPayment ? (
              <Card>
                <Text style={styles.cardTitle}>Payment</Text>
                <Text style={styles.cardMeta}>
                  {selectedPayment.status === 'paid'
                    ? 'Paid'
                    : `Payment ${selectedPayment.status}`}
                  {' '}· {formatMoney(selectedPayment.amount)}
                </Text>
              </Card>
            ) : null}
            {selectedBooking.status === 'completed' ? renderReviewPanel() : null}
          </View>
        </ScrollView>
      </>
    );
  }

  function renderCustomerTrackServiceProvider(): ReactNode {
    if (!selectedBooking) {
      return <MissingSelection onBack={() => navigate('bookings', 'customer')} />;
    }

    const tracking =
      selectedBookingTracking?.bookingId === selectedBooking.id
        ? selectedBookingTracking
        : null;
    const isHalfSheet = customerTrackingSheetLevel !== 'peek';
    const isExpandedSheet = customerTrackingSheetLevel === 'expanded';

    return (
      <View style={styles.navigationScreen}>
        <View style={styles.mapCanvas}>
          <Pressable
            style={styles.mapCloseButton}
            onPress={() => navigate('customerBookingDetail', 'customer')}
            accessibilityRole="button"
          >
            <Text style={styles.mapCloseText}>Close</Text>
          </Pressable>
          <TrackingMapPreview
            tracking={tracking}
            title={trackingPhaseTitle(tracking)}
            subtitle={trackingRouteLabel(tracking)}
          />
        </View>
        <View style={[styles.navBottomSheet, navigationSheetStyle(customerTrackingSheetLevel)]}>
          <NavigationSheetHeader
            level={customerTrackingSheetLevel}
            setLevel={setCustomerTrackingSheetLevel}
            title={trackingPhaseTitle(tracking)}
            subtitle={trackingRouteLabel(tracking)}
          />
          {isHalfSheet ? (
            <>
              <Text style={styles.cardBody} numberOfLines={isExpandedSheet ? 4 : 2}>
                {tracking?.destinationAddress ??
                  selectedBooking.serviceAddress ??
                  'Address unavailable'}
              </Text>
              <InfoRow label="Schedule" value={formatDateTime(selectedBooking.scheduledAt)} />
              <InfoRow
                label="Last update"
                value={
                  tracking?.lastUpdatedAt ? formatDateTime(tracking.lastUpdatedAt) : 'Loading'
                }
              />
            </>
          ) : null}
          <View style={styles.twoButtons}>
            <View style={styles.flex}>
              <PrimaryButton
                label="Refresh"
                variant="secondary"
                onPress={() => void refreshBookingTracking(selectedBooking.id)}
              />
            </View>
            <View style={styles.flex}>
              <PrimaryButton
                label="Message"
                onPress={() => void openSelectedConversation()}
              />
            </View>
          </View>
        </View>
      </View>
    );
  }

  function renderManageBooking() {
    const status = selectedBooking?.status;
    const isCancellable = status === 'pending' || status === 'confirmed';
    const isActive = status === 'confirmed' || status === 'in_progress';
    const isCompleted = status === 'completed';

    return (
      <>
        <TopBar title="Manage Booking" onBack={() => navigate('customerBookingDetail', 'customer')} />
        <ScrollView contentContainerStyle={styles.withBottomNav}>
          <View style={styles.content}>
            <Text style={styles.manageCopy}>Manage support and cancellation options for this booking.</Text>
            <View style={styles.optionList}>
              <Pressable
                style={styles.optionRow}
                onPress={() => void openSelectedConversation()}
                accessibilityRole="button"
                accessibilityLabel="Message service provider"
              >
                <Text style={styles.optionLabel}>Message Service Provider</Text>
                <ChevronRight color={palette.faint} size={20} />
              </Pressable>
              {isActive ? (
                <Pressable
                  style={styles.optionRow}
                  onPress={() => {
                    if (selectedBooking) {
                      void refreshBookingTracking(selectedBooking.id);
                    }
                    navigate('customerTrackServiceProvider', 'customer');
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Track service provider"
                >
                  <Text style={styles.optionLabel}>Track Service Provider</Text>
                  <ChevronRight color={palette.faint} size={20} />
                </Pressable>
              ) : null}
              {isCompleted ? (
                <Pressable
                  style={styles.optionRow}
                  onPress={() => navigate('customerReservePayment', 'customer')}
                  accessibilityRole="button"
                  accessibilityLabel="View payment details"
                >
                  <Text style={styles.optionLabel}>View Payment Details</Text>
                  <ChevronRight color={palette.faint} size={20} />
                </Pressable>
              ) : null}
              <Pressable
                style={styles.optionRow}
                onPress={() => navigate('customerBookingReport', 'customer')}
                accessibilityRole="button"
                accessibilityLabel="Report an issue"
              >
                <Text style={styles.optionLabel}>Report an issue</Text>
                <ChevronRight color={palette.faint} size={20} />
              </Pressable>
              {isCancellable ? (
                <Pressable
                  style={[styles.optionRow, styles.optionRowDanger]}
                  onPress={() => navigate('customerBookingCancel', 'customer')}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel booking"
                >
                  <Text style={styles.optionLabelDanger}>Cancel Booking</Text>
                  <ChevronRight color={palette.faint} size={20} />
                </Pressable>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </>
    );
  }

  function renderCancelBooking() {
    return (
      <>
        <TopBar title="Cancel Booking" onBack={() => navigate('customerBookingManage', 'customer')} />
        <ScrollView contentContainerStyle={styles.withBottomNav}>
          <View style={styles.content}>
            <Text style={styles.sorryTitle}>Cancel this booking?</Text>
            <Text style={styles.pageCopy}>
              Please let us know why you're canceling your booking. We would really appreciate your feedback.
            </Text>
            <View style={styles.radioGroup}>
              {customerCancelReasons.map((reason) => (
                <Pressable
                  key={reason}
                  style={styles.radioRow}
                  onPress={() => setCancelReason(reason)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: cancelReason === reason }}
                >
                  <View style={[styles.radioOuter, cancelReason === reason && styles.radioOuterSelected]}>
                    {cancelReason === reason ? <View style={styles.radioInner} /> : null}
                  </View>
                  <Text style={styles.radioLabel}>{reason}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.policyCard}>
              <Text style={styles.cardTitle}>Cancellation policy</Text>
              <Text style={styles.cardMeta}>
                Pending and confirmed bookings can be cancelled before the provider starts the service.
              </Text>
            </View>
            {!cancelReason ? (
              <Text style={styles.helperText}>Select a reason to continue.</Text>
            ) : null}
            <PrimaryButton
              label="Cancel Booking"
              variant="danger"
              onPress={async () => {
                await transitionSelectedBooking('cancelled', cancelReason);
                navigate('bookings', 'customer');
              }}
              disabled={
                !cancelReason ||
                !selectedBooking ||
                !nextBookingStatuses(selectedBooking.status, appRole).includes('cancelled')
              }
            />
            <Text
              style={styles.footerLink}
              onPress={() => navigate('customerBookingDetail', 'customer')}
            >
              Don't Cancel
            </Text>
          </View>
        </ScrollView>
      </>
    );
  }

  function renderReportIssue() {
    return (
      <>
        <TopBar title="Report an Issue" onBack={() => navigate('customerBookingManage', 'customer')} />
        <ScrollView contentContainerStyle={styles.withBottomNav}>
          <View style={styles.content}>
            <View style={styles.lockedField}>
              <Text style={styles.label}>Booking ID</Text>
              <View style={styles.lockedInput}>
                <Text style={styles.cardMeta}>{selectedBooking?.bookingReference ?? 'No booking selected'}</Text>
              </View>
            </View>
            <Section title="Issue type">
              <View style={styles.wrap}>
                {customerIssueTypes.map((issue) => (
                  <Pill
                    key={issue}
                    label={issue}
                    selected={supportSubject === issue}
                    onPress={() => setSupportSubject(issue)}
                  />
                ))}
              </View>
            </Section>
            <Field
              label="Description"
              value={supportMessage}
              onChangeText={setSupportMessage}
              placeholder="Describe the issue..."
              multiline
            />
            <Pressable
              style={styles.uploadBox}
              onPress={() => void pickAndUploadImage('support_evidence', (uri, uploaded) => {
                setReportEvidencePhotoUri(uri);
                setReportEvidencePhotoUrl(uploaded.publicUrl);
                setReportEvidenceUpload(uploaded);
              })}
              accessibilityRole="button"
            >
              {reportEvidencePhotoUri ? (
                <Image source={{ uri: reportEvidencePhotoUri }} style={styles.uploadPreview} />
              ) : (
                <Upload color={palette.mint} size={32} strokeWidth={2} />
              )}
              <Text style={styles.cardMeta}>Upload photos or videos</Text>
              <Text style={styles.linkText}>
                {reportEvidencePhotoUrl ? 'Evidence uploaded' : 'Attach evidence'}
              </Text>
            </Pressable>
            <Section title="Desired resolution">
              <View style={styles.radioGroup}>
                {customerResolutionOptions.map((resolution) => (
                  <Pressable
                    key={resolution}
                    style={styles.radioRow}
                    onPress={() => setDesiredResolution(resolution)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: desiredResolution === resolution }}
                  >
                    <View style={[styles.radioOuter, desiredResolution === resolution && styles.radioOuterSelected]}>
                      {desiredResolution === resolution ? <View style={styles.radioInner} /> : null}
                    </View>
                    <Text style={styles.radioLabel}>{resolution}</Text>
                  </Pressable>
                ))}
              </View>
            </Section>
            <PrimaryButton
              label="Raise dispute"
              onPress={() => void submitCustomerIssue()}
              disabled={!supportSubject.trim() || !supportMessage.trim() || !desiredResolution || busyAction === 'dispute'}
            />
          </View>
        </ScrollView>
      </>
    );
  }

  function renderMessages() {
    return (
      <>
        <TopBar title="Messages" subtitle="Conversations stay attached to bookings" />
        <ScrollView contentContainerStyle={styles.withBottomNav}>
          <View style={styles.content}>
            <Section title="Conversations">
              {conversations.map((conversation) => {
                const conversationBooking = bookingForConversation(conversation);
                return (
                  <Card
                    key={conversation.id}
                    selected={conversation.id === selectedConversationId}
                    onPress={async () => {
                      setSelectedConversationId(conversation.id);
                      try {
                        setMessages(await listConversationMessages(conversation.id, apiOptions));
                      } catch (error) {
                        setNotice(readError(error));
                      }
                    }}
                  >
                    <Text style={styles.cardTitle}>
                      {conversationTitle(conversation, conversationBooking)}
                    </Text>
                    <Text style={styles.cardMeta}>
                      {conversationBooking?.bookingReference ?? 'Unlinked booking'} ·{' '}
                      {conversation.lastMessageAt
                        ? formatDateTime(conversation.lastMessageAt)
                        : 'No messages yet'}
                    </Text>
                  </Card>
                );
              })}
              {!conversations.length ? (
                <EmptyState title="No conversations" body="Open messages from a booking." />
              ) : null}
            </Section>
            <Section title="Thread">
              <Card>
                {messages.slice(-20).map((message) => (
                  <View
                    key={message.id}
                    style={[
                      styles.messageBubble,
                      message.senderRole === appRole && styles.messageBubbleMine,
                    ]}
                  >
                    <Text style={styles.cardMeta}>
                      {messageSenderLabel(message.senderRole)}
                      {message.createdAt ? ` · ${formatDateTime(message.createdAt)}` : ''}
                    </Text>
                    {message.attachment ? (
                      <Image
                        source={{ uri: message.attachment.fileUrl }}
                        style={styles.uploadPreview}
                      />
                    ) : null}
                    {message.content ? (
                      <Text style={styles.cardBody}>{message.content}</Text>
                    ) : null}
                  </View>
                ))}
                {!messages.length ? (
                  <Text style={styles.cardMeta}>
                    {selectedConversationId
                      ? 'Say hi to start the conversation.'
                      : 'Pick a conversation to start chatting.'}
                  </Text>
                ) : null}
              </Card>
              <Field label="Message" value={messageDraft} onChangeText={setMessageDraft} multiline />
              <View style={styles.twoButtons}>
                <PrimaryButton
                  label={
                    busyAction === 'upload-message_attachment'
                      ? 'Uploading...'
                      : 'Attach image'
                  }
                  variant="secondary"
                  onPress={() => void attachAndSendMessageImage()}
                  disabled={!session || busyAction === 'upload-message_attachment'}
                />
                <PrimaryButton
                  label="Send"
                  onPress={() => void sendMessage()}
                  disabled={!session || busyAction === 'send-message'}
                />
              </View>
            </Section>
          </View>
        </ScrollView>
      </>
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
          unreadNotificationCount={unreadCount}
        />
      </>
    );
  }

  function renderCustomerProfile() {
    return (
      <>
        <TopBar title="My Profile" onBack={() => navigate('more', 'customer')} />
        <ScrollView contentContainerStyle={styles.withBottomNav}>
          <View style={styles.content}>
            <View style={styles.profileHero}>
              <Pressable
                style={styles.profileAvatarLarge}
                onPress={() => void pickCustomerAvatar()}
                accessibilityRole="button"
                accessibilityLabel="Update profile photo"
              >
                {customerAvatarUri ? (
                  <Image
                    source={{ uri: customerAvatarUri }}
                    style={styles.profileAvatarImage}
                    accessibilityLabel="Profile photo"
                  />
                ) : (
                  <Text style={styles.profileAvatarLargeText}>
                    {(profile?.user.fullName ?? profile?.user.email ?? 'C').slice(0, 1).toUpperCase()}
                  </Text>
                )}
                <View style={styles.cameraBadge}>
                  <Camera color={palette.white} size={15} />
                </View>
              </Pressable>
              <Text style={styles.cardMeta}>Tap the photo to update it.</Text>
            </View>
            <Field
              label="Full Name"
              value={profileFullName}
              onChangeText={setProfileFullName}
              placeholder="Your full name"
            />
            <ProfileInfoRow icon={Mail} label="Email Address" value={profile?.user.email ?? 'Not signed in'} />
            <Field
              label="Phone Number"
              value={profileContactNumber}
              onChangeText={setProfileContactNumber}
              keyboardType="phone-pad"
              placeholder="+639000000000"
            />
            <Field
              label="Address"
              value={profileAddress}
              onChangeText={setProfileAddress}
              placeholder="Unit, street, city"
              multiline
            />
            <PrimaryButton
              label={busyAction === 'profile-update' ? 'Saving...' : 'Save Changes'}
              onPress={() => void saveProfile()}
              disabled={busyAction === 'profile-update'}
            />
          </View>
        </ScrollView>
      </>
    );
  }

  function renderCustomerPaymentMethods() {
    return (
      <>
        <TopBar title="Payment Methods" onBack={() => navigate('more', 'customer')} />
        <ScrollView contentContainerStyle={styles.withBottomNav}>
          <View style={styles.content}>
            <Section title="Saved methods">
              {customerPaymentMethods.length ? (
                customerPaymentMethods.map((method) => {
                  const selected = selectedCustomerPaymentMethod?.id === method.id;
                  const deleting =
                    busyAction === `delete-customer-payment-${method.id}`;
                  return (
                    <Pressable
                      key={method.id}
                      style={[
                        styles.paymentMethodOption,
                        selected && styles.paymentMethodSelected,
                      ]}
                      onPress={() => setSelectedCustomerPaymentMethodId(method.id)}
                      accessibilityRole="button"
                    >
                      <View
                        style={[
                          styles.radioOuter,
                          selected && styles.radioOuterSelected,
                        ]}
                      >
                        {selected ? <View style={styles.radioInner} /> : null}
                      </View>
                      <Wallet color={selected ? palette.mint : palette.muted} size={22} />
                      <View style={styles.flex}>
                        <Text style={styles.cardTitle}>{method.label}</Text>
                        <Text style={styles.cardMeta}>{paymentMethodMeta(method)}</Text>
                      </View>
                      {method.methodType !== 'cash_on_service' ? (
                        <Pressable
                          style={styles.iconAction}
                          onPress={() => void removeCustomerPaymentMethod(method.id)}
                          disabled={deleting}
                        >
                          <Trash2 color={palette.red} size={18} />
                        </Pressable>
                      ) : null}
                    </Pressable>
                  );
                })
              ) : (
                <ActivityIndicator color={palette.mint} />
              )}
            </Section>
            <View style={styles.twoButtons}>
              <PrimaryButton
                label="Add GCash"
                variant="secondary"
                onPress={() => void saveCustomerPaymentMethod('gcash')}
                disabled={busyAction === 'customer-payment-gcash'}
              />
              <PrimaryButton
                label="Add PayMaya"
                variant="secondary"
                onPress={() => void saveCustomerPaymentMethod('paymaya')}
                disabled={busyAction === 'customer-payment-paymaya'}
              />
            </View>
            <PrimaryButton
              label="Add New Card"
              onPress={() => void saveCustomerPaymentMethod('card')}
              disabled={busyAction === 'customer-payment-card'}
            />
          </View>
        </ScrollView>
      </>
    );
  }

  function renderCustomerSettings() {
    return (
      <>
        <TopBar title="Settings" onBack={() => navigate('more', 'customer')} />
        <ScrollView contentContainerStyle={styles.withBottomNav}>
          <View style={styles.content}>
            <SettingsSection title="Notifications">
              <SettingsRow
                icon={Bell}
                label="Push Notifications"
                toggleValue={pushNotificationsEnabled}
                onToggle={() =>
                  void savePreferences({
                    pushNotificationsEnabled: !pushNotificationsEnabled,
                  })
                }
              />
              <SettingsRow
                icon={Calendar}
                label="Booking updates"
                toggleValue={getNotificationCategoryEnabled('booking_updates')}
                onToggle={() => void toggleNotificationCategory('booking_updates')}
              />
              <SettingsRow
                icon={CreditCard}
                label="Payment alerts"
                toggleValue={getNotificationCategoryEnabled('payment_alerts')}
                onToggle={() => void toggleNotificationCategory('payment_alerts')}
              />
              <SettingsRow
                icon={MessageCircle}
                label="Messages"
                toggleValue={getNotificationCategoryEnabled('messages')}
                onToggle={() => void toggleNotificationCategory('messages')}
              />
              <SettingsRow
                icon={Gift}
                label="Promotions and offers"
                toggleValue={getNotificationCategoryEnabled('promotions')}
                onToggle={() => void toggleNotificationCategory('promotions')}
              />
            </SettingsSection>
            <SettingsSection title="Security">
              <SettingsRow
                icon={Lock}
                label="Change Password"
                onPress={() => setNotice('Enter your current and new password below.')}
              />
              <Field
                label="Current Password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                placeholder="Current password"
              />
              <Field
                label="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                placeholder="New password"
              />
              <PrimaryButton
                label={busyAction === 'password-change' ? 'Saving...' : 'Save Password'}
                onPress={() => void savePassword()}
                disabled={busyAction === 'password-change'}
              />
              {renderTwoFactorSettings()}
            </SettingsSection>
            <SettingsSection title="Preferences">
              <SettingsRow
                icon={Globe}
                label="Language"
                value={languageLabel(userPreferences?.language ?? 'en')}
                onPress={() =>
                  void savePreferences({
                    language: userPreferences?.language === 'fil' ? 'en' : 'fil',
                  })
                }
              />
              <SettingsRow
                icon={Moon}
                label="Dark Mode"
                toggleValue={darkModeEnabled}
                onToggle={() =>
                  void savePreferences({
                    darkModeEnabled: !darkModeEnabled,
                  })
                }
              />
            </SettingsSection>
            <SettingsSection title="Active sessions">
              {activeSessions.length === 0 ? (
                <SettingsRow icon={Lock} label="No active session detected." />
              ) : (
                activeSessions.map((session) => (
                  <SettingsRow
                    key={session.id}
                    icon={Lock}
                    label={session.email || 'This device'}
                    value={
                      session.lastSignInAt
                        ? `Last sign-in ${new Date(
                            session.lastSignInAt,
                          ).toLocaleString()}`
                        : 'Never signed in'
                    }
                  />
                ))
              )}
            </SettingsSection>
            <SettingsSection title="Danger Zone">
              <Text style={styles.cardMeta}>
                Type {profile?.user.email ?? 'your email'} to enable account deletion.
              </Text>
              <Field
                label="Confirm email"
                value={deleteConfirmText}
                onChangeText={setDeleteConfirmText}
                placeholder={profile?.user.email ?? 'email@example.com'}
                keyboardType="email-address"
              />
              <PrimaryButton
                label={busyAction === 'delete-account' ? 'Deleting...' : 'Delete Account'}
                variant="danger"
                onPress={() => void deleteMyAccount()}
                disabled={busyAction === 'delete-account' || !canConfirmAccountDeletion}
              />
            </SettingsSection>
          </View>
        </ScrollView>
      </>
    );
  }

  function renderTwoFactorSettings() {
    return (
      <Card>
        <Text style={styles.cardTitle}>Two-Factor Authentication</Text>
        <Text style={styles.cardMeta}>
          {twoFactorEnabled
            ? '2FA is enabled. Enter a current code to disable it.'
            : 'Protect your account with a code from an authenticator app.'}
        </Text>
        {twoFactorSecret ? (
          <Text style={[styles.cardMeta, styles.monoText]}>
            Secret: {twoFactorSecret}
          </Text>
        ) : null}
        <Field
          label="Authenticator Code"
          value={twoFactorCode}
          onChangeText={setTwoFactorCode}
          placeholder="6-digit code"
          keyboardType="number-pad"
        />
        <View style={styles.twoButtons}>
          <PrimaryButton
            label={
              busyAction === 'two-factor-enable'
                ? 'Starting...'
                : twoFactorEnabled
                  ? '2FA Enabled'
                  : 'Start Setup'
            }
            variant="secondary"
            onPress={() => void startTwoFactorSetup()}
            disabled={twoFactorEnabled || busyAction === 'two-factor-enable'}
          />
          <PrimaryButton
            label={
              busyAction === 'two-factor-verify'
                ? 'Verifying...'
                : twoFactorEnabled
                  ? 'Disable'
                  : 'Verify'
            }
            onPress={() =>
              twoFactorEnabled
                ? void disableTwoFactorSetup()
                : void verifyTwoFactorSetup()
            }
            disabled={
              busyAction === 'two-factor-verify' ||
              busyAction === 'two-factor-disable'
            }
          />
        </View>
      </Card>
    );
  }

  function renderCustomerHelp() {
    const filteredFaq = customerHelpFaqs.filter((item) => {
      const matchesCategory = helpCategory === 'all' || item.category === helpCategory;
      const query = helpQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });

    return (
      <>
        <View style={styles.helpHeader}>
          <TopBar title="Help Center" green onBack={() => navigate('more', 'customer')} />
          <View style={styles.helpSearch}>
            <Search color={palette.faint} size={20} />
            <Field
              label=""
              value={helpQuery}
              onChangeText={setHelpQuery}
              placeholder="Search help articles..."
            />
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.withBottomNav}>
          <View style={styles.content}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalRail}>
              {customerHelpCategories.map((category) => (
                <Pill
                  key={category}
                  label={category === 'all' ? 'All' : category}
                  selected={helpCategory === category}
                  onPress={() => setHelpCategory(category)}
                />
              ))}
            </ScrollView>
            <Section title="Frequently Asked Questions">
              {filteredFaq.map((item) => (
                <Pressable
                  key={item.id}
                  style={[
                    styles.faqCard,
                    expandedFaqId === item.id && styles.faqCardOpen,
                  ]}
                  onPress={() => setExpandedFaqId(expandedFaqId === item.id ? null : item.id)}
                >
                  <View style={styles.rowBetween}>
                    <View style={styles.faqIcon}>
                      {item.category === 'Payments & Refunds' ? (
                        <CreditCard color={palette.amber} size={16} />
                      ) : item.category === 'Safety & Trust' ? (
                        <ShieldCheck color={palette.violet} size={16} />
                      ) : (
                        <Calendar color={palette.blue} size={16} />
                      )}
                    </View>
                    <View style={styles.flex}>
                      <Text style={styles.cardTitle}>{item.question}</Text>
                      <Text style={styles.faqCategory}>{item.category}</Text>
                    </View>
                  </View>
                  {expandedFaqId === item.id ? (
                    <Text style={styles.cardBody}>{item.answer}</Text>
                  ) : null}
                </Pressable>
              ))}
              {!filteredFaq.length ? <EmptyState title="No results found" body="Try another search term." /> : null}
            </Section>
            {renderSupportPanel()}
          </View>
        </ScrollView>
      </>
    );
  }

  function renderCustomerServiceHistory() {
    const completedBookings = bookings.filter((booking) => booking.status === 'completed');

    return (
      <>
        <TopBar
          title="Completed Bookings"
          onBack={() => {
            setBookingFilter('completed');
            navigate('bookings', 'customer');
          }}
        />
        <ScrollView contentContainerStyle={styles.withBottomNav}>
          <View style={styles.content}>
            {completedBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                role="customer"
                onPress={() => openBooking(booking, 'customerBookingDetail')}
              />
            ))}
            {!completedBookings.length ? (
              <EmptyState
                title="No completed services"
                body="Completed services will appear in your history."
              />
            ) : null}
          </View>
        </ScrollView>
      </>
    );
  }

  function renderProviderNotifications() {
    return renderNotificationsScreen('provider');
  }

  function renderProviderHelp() {
    const filteredFaq = providerHelpFaqs.filter((item) => {
      const matchesCategory = helpCategory === 'all' || item.category === helpCategory;
      const query = helpQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });

    return (
      <>
        <View style={styles.helpHeader}>
          <TopBar title="Help Center" green onBack={() => navigate('more', 'provider')} />
          <View style={styles.helpSearch}>
            <Search color={palette.faint} size={20} />
            <Field
              label=""
              value={helpQuery}
              onChangeText={setHelpQuery}
              placeholder="Search provider help..."
            />
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.withBottomNav}>
          <View style={styles.content}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalRail}
            >
              {providerHelpCategories.map((category) => (
                <Pill
                  key={category}
                  label={category === 'all' ? 'All' : category}
                  selected={helpCategory === category}
                  onPress={() => setHelpCategory(category)}
                />
              ))}
            </ScrollView>
            <Section title="Frequently Asked Questions">
              {filteredFaq.map((item) => (
                <Pressable
                  key={item.id}
                  style={[
                    styles.faqCard,
                    expandedFaqId === item.id && styles.faqCardOpen,
                  ]}
                  onPress={() => setExpandedFaqId(expandedFaqId === item.id ? null : item.id)}
                >
                  <View style={styles.rowBetween}>
                    <View style={styles.faqIcon}>
                      {item.category === 'Payouts' ? (
                        <Wallet color={palette.mint} size={16} />
                      ) : item.category === 'Bookings' ? (
                        <Calendar color={palette.blue} size={16} />
                      ) : item.category === 'Profile and Services' ? (
                        <User color={palette.amber} size={16} />
                      ) : (
                        <ShieldCheck color={palette.violet} size={16} />
                      )}
                    </View>
                    <View style={styles.flex}>
                      <Text style={styles.cardTitle}>{item.question}</Text>
                      <Text style={styles.faqCategory}>{item.category}</Text>
                    </View>
                  </View>
                  {expandedFaqId === item.id ? (
                    <Text style={styles.cardBody}>{item.answer}</Text>
                  ) : null}
                </Pressable>
              ))}
              {!filteredFaq.length ? (
                <EmptyState title="No results found" body="Try another search term." />
              ) : null}
            </Section>
            {renderSupportPanel()}
          </View>
        </ScrollView>
      </>
    );
  }

  function renderProviderInsights() {
    const summary = providerDashboard?.summary;
    const performance = providerDashboard?.performance;
    const acceptanceRate = performance?.acceptanceRate ?? null;
    const completionRate = performance?.completionRate ?? null;
    const responseTime = performance?.responseTimeMinutes ?? null;
    const totalBookings = bookings.length;
    const completedCount = bookings.filter((b) => b.status === 'completed').length;
    const cancelledCount = bookings.filter(
      (b) => b.status === 'cancelled' || b.status === 'rejected',
    ).length;
    const repeatCustomers = new Set(
      bookings
        .filter((b) => b.status === 'completed')
        .map((b) => b.customerId),
    ).size;

    return (
      <>
        <TopBar
          title="Performance Insights"
          subtitle="How your business is performing"
          onBack={() => navigate('more', 'provider')}
          right={
            <PrimaryButton
              label="Refresh"
              variant="secondary"
              onPress={() => void refreshWorkspace()}
            />
          }
        />
        <ScrollView contentContainerStyle={styles.withBottomNav}>
          <View style={styles.content}>
            <MetricCard
              label="Total Earnings"
              value={formatMoney(summary?.totalEarnings ?? 0)}
              featured
            />
            <View style={styles.metricGrid}>
              <MetricCard
                label="Overall Rating"
                value={(summary?.overallRating ?? 0).toFixed(1)}
              />
              <MetricCard
                label="Total Reviews"
                value={summary?.reviewCount ?? 0}
              />
              <MetricCard
                label="Today's Earnings"
                value={formatMoney(summary?.todayEarnings ?? 0)}
              />
            </View>

            <Section title="Service performance">
              <Card>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Acceptance rate</Text>
                  <Text style={styles.infoValue}>
                    {acceptanceRate === null ? 'Not enough data' : `${acceptanceRate}%`}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Completion rate</Text>
                  <Text style={styles.infoValue}>
                    {completionRate === null ? 'Not enough data' : `${completionRate}%`}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Average response time</Text>
                  <Text style={styles.infoValue}>
                    {responseTime === null
                      ? 'Not enough data'
                      : responseTime < 60
                        ? `${responseTime} min`
                        : `${(responseTime / 60).toFixed(1)} hr`}
                  </Text>
                </View>
              </Card>
            </Section>

            <Section title="Booking activity">
              <View style={styles.metricGrid}>
                <MetricCard label="Total Bookings" value={totalBookings} />
                <MetricCard label="Completed" value={completedCount} />
                <MetricCard label="Cancelled" value={cancelledCount} />
              </View>
              <Card>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Repeat customers</Text>
                  <Text style={styles.infoValue}>{repeatCustomers}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>New booking requests</Text>
                  <Text style={styles.infoValue}>{summary?.newRequests ?? 0}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Today's bookings</Text>
                  <Text style={styles.infoValue}>{summary?.todayBookings ?? 0}</Text>
                </View>
              </Card>
            </Section>

            <Section title="Tips to grow">
              <Card>
                <Text style={styles.cardBody}>
                  {acceptanceRate !== null && acceptanceRate < 80
                    ? 'Accept more requests within an hour to lift your acceptance rate.'
                    : 'Great job keeping your acceptance rate high — keep it up!'}
                </Text>
              </Card>
              <Card>
                <Text style={styles.cardBody}>
                  {(summary?.overallRating ?? 0) < 4
                    ? 'Reply to recent reviews and ask satisfied customers for ratings.'
                    : 'Customers love your work — share your profile to attract more bookings.'}
                </Text>
              </Card>
            </Section>
          </View>
        </ScrollView>
      </>
    );
  }

  function renderCustomerNotifications() {
    return renderNotificationsScreen('customer');
  }

  function renderNotificationsScreen(role: AppRole) {
    return (
      <>
        <TopBar
          title="Notifications"
          onBack={() => navigate(role === 'provider' ? 'home' : 'more', role)}
          right={unreadCount > 0 ? <Badge label={`${unreadCount} new`} tone="success" /> : null}
        />
        <ScrollView contentContainerStyle={styles.withBottomNav}>
          <View style={styles.content}>
            {visibleNotifications.map((notification) => (
              <Pressable
                key={notification.id}
                style={[
                  styles.notificationCard,
                  !notification.isRead && styles.notificationCardUnread,
                ]}
                onPress={() => void openNotification(notification)}
              >
                <View style={styles.notificationIcon}>
                  {notification.type.includes('payment') ? (
                    <CreditCard color={palette.white} size={20} />
                  ) : notification.type.includes('booking') ? (
                    <Calendar color={palette.white} size={20} />
                  ) : notification.type.includes('promo') ? (
                    <Gift color={palette.white} size={20} />
                  ) : notification.type.includes('support') ? (
                    <MessageCircle color={palette.white} size={20} />
                  ) : (
                    <Bell color={palette.white} size={20} />
                  )}
                </View>
                <View style={styles.flex}>
                  <Text style={styles.cardTitle}>{notification.title ?? notification.type}</Text>
                  <Text style={styles.cardBody}>{notification.body ?? 'Notification update'}</Text>
                  <Text style={styles.cardMeta}>{formatDateTime(notification.createdAt)}</Text>
                </View>
                {!notification.isRead ? <View style={styles.notificationUnreadDot} /> : null}
              </Pressable>
            ))}
            {!visibleNotifications.length ? (
              <EmptyState title="No notifications yet" body="We'll notify you when something arrives." />
            ) : null}
          </View>
        </ScrollView>
      </>
    );
  }

  function renderCustomerReferral() {
    const code = referralSummary?.referralCode ?? 'Loading';
    return (
      <>
        <TopBar title="Refer a Friend" onBack={() => navigate('more', 'customer')} />
        <ScrollView contentContainerStyle={styles.withBottomNav}>
          <View style={styles.content}>
            <Card>
              <View style={styles.providerSummaryRow}>
                <View style={styles.quickIcon}>
                  <Gift color={palette.mint} size={22} strokeWidth={2.5} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.cardTitle}>Your referral code</Text>
                  <Text style={styles.detailTitle}>{code}</Text>
                  <Text style={styles.cardMeta}>
                    Share this code with people creating a ServEase account.
                  </Text>
                </View>
              </View>
            </Card>
            <View style={styles.metricGrid}>
              <MetricCard
                label="Completed"
                value={`${referralSummary?.completedReferrals ?? 0}`}
              />
              <MetricCard
                label="Pending"
                value={`${referralSummary?.pendingReferrals ?? 0}`}
              />
            </View>
            <Card>
              <Text style={styles.cardTitle}>Rewards</Text>
              <Text style={styles.detailTitle}>
                {formatMoney(referralSummary?.totalRewards ?? 0)}
              </Text>
              <Text style={styles.cardMeta}>Earned referral credits</Text>
            </Card>
            <PrimaryButton
              label="Refresh"
              variant="secondary"
              onPress={async () => {
                setBusyAction('referrals');
                try {
                  setReferralSummary(await getReferralSummary(apiOptions));
                  setNotice('Referral summary refreshed.');
                } catch (error) {
                  setNotice(readError(error));
                } finally {
                  setBusyAction(null);
                }
              }}
            />
          </View>
        </ScrollView>
      </>
    );
  }

  function renderCustomerTerms() {
    return (
      <>
        <TopBar title="Terms & Privacy" onBack={() => navigate('more', 'customer')} />
        <ScrollView contentContainerStyle={styles.withBottomNav}>
          <View style={styles.content}>
            <Card>
              <Text style={styles.detailTitle}>Terms of Service</Text>
              <Text style={styles.cardBody}>
                ServEase connects customers with independent service providers. Bookings, payments, cancellations, support, and reviews are handled through the platform features available in this app.
              </Text>
            </Card>
            <Card>
              <Text style={styles.detailTitle}>Privacy Policy</Text>
              <Text style={styles.cardBody}>
                Personal information is used to operate marketplace accounts, bookings, support, notifications, and provider/customer communication.
              </Text>
            </Card>
          </View>
        </ScrollView>
      </>
    );
  }

  function renderProviderApplicationBanner(): ReactNode {
    const applicationStatus =
      providerApplication?.verificationStatus ??
      profile?.providerProfile?.verificationStatus ??
      null;

    if (!applicationStatus || applicationStatus === 'approved') {
      return null;
    }

    const title =
      applicationStatus === 'rejected'
        ? 'Application needs attention'
        : 'Application pending review';
    const body =
      providerApplication?.latestDecisionReason ??
      (applicationStatus === 'rejected'
        ? 'Review the admin decision before resubmitting your provider details.'
        : 'ServEase admin is reviewing your provider application.');

    return (
      <Card>
        <View style={styles.rowBetween}>
          <View style={styles.flex}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardBody}>{body}</Text>
            {providerApplication?.latestDecisionAt ? (
              <Text style={styles.cardMeta}>
                Updated {formatDateTime(providerApplication.latestDecisionAt)}
              </Text>
            ) : null}
          </View>
          <Badge
            label={applicationStatus}
            tone={applicationStatus === 'rejected' ? 'danger' : 'warning'}
          />
        </View>
        <PrimaryButton
          label="Refresh Status"
          variant="secondary"
          onPress={async () => {
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
        />
      </Card>
    );
  }

  function renderProviderHome() {
    const pendingCount = bookings.filter((booking) => booking.status === 'pending').length;
    const todayCompleted = providerDashboard?.summary.todayCompleted ?? 0;
    const todayEarnings = providerDashboard?.summary.todayEarnings ?? 0;
    const acceptanceRate = providerDashboard?.performance.acceptanceRate ?? null;
    const providerHomeActiveBookings = bookings
      .filter((booking) =>
        !['cancelled', 'completed', 'rejected'].includes(booking.status),
      )
      .slice()
      .sort(
        (a, b) =>
          new Date(a.scheduledAt ?? 0).getTime() -
          new Date(b.scheduledAt ?? 0).getTime(),
      )
      .slice(0, 4);
    return (
      <ScrollView contentContainerStyle={styles.withBottomNav}>
        <View style={styles.providerHero}>
          <View style={styles.heroRow}>
            <View style={styles.flex}>
              <Text style={styles.heroMuted}>Welcome back,</Text>
              <Text style={styles.heroName}>
                {profile?.providerProfile?.businessName ?? 'Service Provider'}
              </Text>
            </View>
            <Pressable
              style={styles.notificationButton}
              onPress={() => navigate('providerNotifications', 'provider')}
              accessibilityRole="button"
              accessibilityLabel={
                unreadCount > 0
                  ? `Notifications, ${unreadCount} unread`
                  : 'Notifications'
              }
            >
              <Bell color={palette.white} size={20} strokeWidth={2.2} />
              {unreadCount > 0 ? <View style={styles.heroUnreadDot} /> : null}
            </Pressable>
          </View>
        </View>
        <View style={styles.overlapContent}>
          <MetricCard label="Available Payout" value={formatMoney(payoutTotal)} featured />
          <View style={styles.metricGrid}>
            <MetricCard label="New Requests" value={pendingCount} />
            <MetricCard label="Today" value={activeCount} />
            <MetricCard label="Rating" value={profile?.providerProfile?.averageRating.toFixed(1) ?? '0.0'} />
          </View>
        </View>
        <View style={styles.content}>
          {renderProviderApplicationBanner()}
          {pendingCount > 0 ? (
            <Pressable
              style={styles.requestBanner}
              onPress={() => navigate('bookings', 'provider')}
            >
              <View style={styles.flex}>
                <Text style={styles.bannerTitle}>{pendingCount} New Booking Request{pendingCount === 1 ? '' : 's'}</Text>
                <Text style={styles.bannerCopy}>Tap to review and accept</Text>
              </View>
              <Text style={styles.bannerArrow}>{'>'}</Text>
            </Pressable>
          ) : (
            <View style={[styles.requestBanner, styles.requestBannerMuted]}>
              <View style={styles.flex}>
                <Text style={[styles.bannerTitle, styles.bannerTitleMuted]}>You're all caught up</Text>
                <Text style={[styles.bannerCopy, styles.bannerCopyMuted]}>No new booking requests right now</Text>
              </View>
            </View>
          )}
          <Section
            title="Active Bookings"
            action={<Text style={styles.linkText} onPress={() => navigate('bookings', 'provider')}>View All</Text>}
          >
            {providerHomeActiveBookings.map((booking) => (
              <ProviderBookingRow
                key={booking.id}
                booking={booking}
                onPress={() => openBooking(booking, 'providerBookingDetail')}
              />
            ))}
            {!providerHomeActiveBookings.length ? (
              <EmptyState
                title="No active bookings"
                body="Confirmed and in-progress jobs appear here."
              />
            ) : null}
          </Section>
          {(todayCompleted > 0 || todayEarnings > 0) ? (
            <Section title="Today">
              <View style={styles.metricGrid}>
                <MetricCard label="Completed" value={todayCompleted} />
                <MetricCard label="Earned Today" value={formatMoney(todayEarnings)} />
                {acceptanceRate !== null ? (
                  <MetricCard label="Accept Rate" value={`${acceptanceRate}%`} />
                ) : null}
              </View>
            </Section>
          ) : null}
          {ownedServices.length > 0 ? (
            <Section
              title="My Services"
              action={<Text style={styles.linkText} onPress={() => navigate('more', 'provider')}>Manage</Text>}
            >
              {ownedServices.slice(0, 3).map((svc) => (
                <Card key={svc.id}>
                  <View style={styles.rowBetween}>
                    <View style={styles.flex}>
                      <Text style={styles.cardTitle}>{svc.title}</Text>
                      <Text style={styles.cardMeta}>{svc.price != null ? formatMoney(svc.price) : 'Price not set'} · {svc.pricingMode ?? 'flat'}</Text>
                    </View>
                    <Badge label={svc.isActive ? 'active' : 'inactive'} tone={svc.isActive ? 'success' : 'neutral'} />
                  </View>
                </Card>
              ))}
            </Section>
          ) : null}
          <Section title="Quick Actions">
            <View style={styles.twoButtons}>
              <QuickAction label="Set Availability" onPress={() => navigate('calendar', 'provider')} />
              <QuickAction label="Payouts" onPress={() => navigate('providerPayoutManagement', 'provider')} />
            </View>
            <View style={styles.twoButtons}>
              <QuickAction label="Insights" onPress={() => navigate('providerInsights', 'provider')} />
              <QuickAction label="Portfolio" onPress={() => navigate('providerPortfolio', 'provider')} />
            </View>
          </Section>
        </View>
      </ScrollView>
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
      <>
        <TopBar
          title="Booking Details"
          subtitle={selectedBooking.serviceAddress ?? 'Address unavailable'}
          onBack={() => navigate('bookings', 'provider')}
        />
        <ScrollView contentContainerStyle={styles.withBottomNav}>
          <View style={styles.content}>
            <Card>
              <View style={styles.bookingCardHeader}>
                <View style={styles.flex}>
                  <Text style={styles.bookingReference}>{selectedBooking.bookingReference}</Text>
                  <Text style={styles.detailTitle}>
                    {selectedBooking.serviceTitle ?? 'Service booking'}
                  </Text>
                </View>
                <Badge {...bookingStatusChip(selectedBooking.status)} />
              </View>
              <StatusTimeline steps={timelineForStatus(selectedBooking.status)} />
            </Card>
            {renderBookingTimelineEvents()}

            <Card>
              <View style={styles.providerSummaryRow}>
                <View style={styles.customerAvatar}>
                  <User color={palette.white} size={24} strokeWidth={2.5} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.cardTitle}>Customer</Text>
                  <Text style={styles.cardMeta}>
                    {selectedBooking.customerFullName ??
                      selectedBooking.customerId.slice(0, 8).toUpperCase()}
                  </Text>
                </View>
                <Pressable
                  style={styles.circleButton}
                  onPress={() => void callSelectedBookingCustomer()}
                  accessibilityRole="button"
                  accessibilityLabel="Call customer"
                >
                  <Phone color={palette.mint} size={18} strokeWidth={2.5} />
                </Pressable>
                <Pressable
                  style={styles.circleButton}
                  onPress={() => void openSelectedConversation()}
                  accessibilityRole="button"
                  accessibilityLabel="Message customer"
                >
                  <MessageCircle color={palette.mint} size={18} strokeWidth={2.5} />
                </Pressable>
              </View>
            </Card>

            <Card>
              <Text style={styles.cardTitle}>Service Details</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Schedule</Text>
                <Text style={styles.infoValue}>{formatDateTime(selectedBooking.scheduledAt)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>
                  {selectedBooking.serviceAddress ?? 'Address unavailable'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Service</Text>
                <Text style={styles.infoValue}>
                  {selectedBooking.serviceTitle ?? 'Service booking'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Description</Text>
                <Text style={styles.infoValue}>
                  {selectedBooking.serviceDescription?.trim() || 'No additional description provided.'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Special instructions</Text>
                <Text style={styles.infoValue}>
                  {selectedBooking.customerNotes?.trim() || 'None'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Estimated duration</Text>
                <Text style={styles.infoValue}>
                  {formatBookingDuration(selectedBooking.hoursRequired)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Pricing</Text>
                <Text style={styles.infoValue}>
                  {pricingModeLabel(selectedBooking.pricingMode)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Estimated earnings</Text>
                <Text style={styles.totalValue}>
                  {formatMoney(selectedPayment?.providerPayout ?? selectedBooking.totalAmount)}
                </Text>
              </View>
            </Card>

            {renderBookingMedia(selectedBooking)}
            {renderBookingServiceUpdates()}

            {renderProviderStatusActions()}

            <PrimaryButton
              label="Message Customer"
              variant="secondary"
              onPress={() => void openSelectedConversation()}
            />
            {selectedBooking.status === 'in_progress' ? (
              <PrimaryButton
                label="Report Issue"
                variant="danger"
                onPress={() => navigate('providerReportIssue', 'provider')}
              />
            ) : null}
          </View>
        </ScrollView>
      </>
    );
  }

  function renderBookingMedia(booking: BookingSummary): ReactNode {
    const attachments = booking.attachments ?? [];
    if (!attachments.length) {
      return null;
    }

    return (
      <Section title="Media">
        <View style={styles.portfolioGrid}>
          {attachments.map((attachment) => (
            <View key={attachment.id} style={styles.portfolioTile}>
              <Image source={{ uri: attachment.fileUrl }} style={styles.portfolioImage} />
              <Text style={styles.portfolioText}>
                {attachment.mediaKind === 'provider_progress'
                  ? 'Provider update'
                  : 'Reference photo'}
              </Text>
              <Pressable
                style={styles.deleteOverlay}
                onPress={() => void removeBookingAttachment(attachment.id)}
                accessibilityRole="button"
              >
                <Trash2 color={palette.white} size={16} strokeWidth={2.6} />
              </Pressable>
            </View>
          ))}
        </View>
      </Section>
    );
  }

  function renderBookingServiceUpdates(): ReactNode {
    if (!selectedBookingServiceUpdates.length) {
      return null;
    }

    return (
      <Section title="Service Updates">
        {selectedBookingServiceUpdates.slice(0, 6).map((update) => (
          <Card key={update.id}>
            <View style={styles.rowBetween}>
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>
                  {update.updateType === 'checklist'
                    ? 'Pre-service checklist'
                    : update.updateType === 'completion'
                      ? 'Completion update'
                      : 'Progress update'}
                </Text>
                <Text style={styles.cardMeta}>{formatDateTime(update.createdAt)}</Text>
              </View>
              <Badge
                label={update.updateType}
                tone={update.updateType === 'completion' ? 'success' : 'neutral'}
              />
            </View>
            {update.message ? <Text style={styles.cardBody}>{update.message}</Text> : null}
            {update.checklist ? (
              <View style={styles.updateChecklist}>
                <Text style={styles.noticeText}>
                  Scope {update.checklist.scopeConfirmed ? 'confirmed' : 'pending'} · Tools{' '}
                  {update.checklist.toolsReady ? 'ready' : 'pending'} · Instructions{' '}
                  {update.checklist.instructionsReviewed ? 'reviewed' : 'pending'}
                </Text>
              </View>
            ) : null}
          </Card>
        ))}
      </Section>
    );
  }

  function renderBookingTimelineEvents(): ReactNode {
    if (!selectedBookingTimelineEvents.length) {
      return null;
    }

    return (
      <Section title="Booking Timeline">
        {selectedBookingTimelineEvents.map((event) => (
          <Card key={event.id}>
            <View style={styles.rowBetween}>
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>{timelineEventLabel(event)}</Text>
                <Text style={styles.cardMeta}>{formatDateTime(event.createdAt)}</Text>
              </View>
              <Badge label={event.eventType.replace(/_/g, ' ')} tone="neutral" />
            </View>
          </Card>
        ))}
      </Section>
    );
  }

  function renderProviderStatusActions(): ReactNode {
    if (!selectedBooking) {
      return null;
    }

    switch (selectedBooking.status) {
      case 'pending':
        return (
          <View style={styles.actions}>
            <PrimaryButton
              label="Confirm Booking"
              onPress={() => void transitionSelectedBooking('confirmed')}
              disabled={busyAction === 'booking-confirmed'}
            />
            <PrimaryButton
              label="Decline Request"
              variant="danger"
              onPress={() => void transitionSelectedBooking('rejected')}
              disabled={busyAction === 'booking-rejected'}
            />
          </View>
        );
      case 'confirmed':
        return (
          <View style={styles.actions}>
            <PrimaryButton
              label="Start Navigation"
              onPress={() => {
                void refreshBookingTracking(selectedBooking.id);
                navigate('providerNavigationMode', 'provider');
              }}
            />
            <PrimaryButton
              label="Start Service"
              variant="secondary"
              onPress={() => navigate('providerStartService', 'provider')}
            />
            <PrimaryButton
              label="Cancel Booking"
              variant="danger"
              onPress={() => navigate('providerCancelBooking', 'provider')}
            />
          </View>
        );
      case 'in_progress':
        return (
          <View style={styles.actions}>
            <PrimaryButton
              label="Continue Service"
              onPress={() => navigate('providerServiceInProgress', 'provider')}
            />
            <PrimaryButton
              label="Complete Service"
              variant="secondary"
              onPress={() => navigate('providerCompleteService', 'provider')}
            />
          </View>
        );
      case 'completed':
        return (
          <View style={styles.actions}>
            <PrimaryButton
              label="View Receipt"
              onPress={() => navigate('providerServiceReceipt', 'provider')}
            />
            <PrimaryButton
              label="Report Issue"
              variant="secondary"
              onPress={() => navigate('providerReportIssue', 'provider')}
            />
          </View>
        );
      default:
        return null;
    }
  }

  function renderProviderNavigationMode(): ReactNode {
    if (!selectedBooking) {
      return <MissingSelection onBack={() => navigate('bookings', 'provider')} />;
    }
    const tracking =
      selectedBookingTracking?.bookingId === selectedBooking.id
        ? selectedBookingTracking
        : null;
    const isHalfSheet = providerNavigationSheetLevel !== 'peek';
    const isExpandedSheet = providerNavigationSheetLevel === 'expanded';
    const routeLabel = providerDirectionsLabel(
      selectedBookingDirections,
      navigationRouteLoading,
      navigationRouteError,
    );
    const navigationOrigin =
      providerLiveLocation.location ??
      selectedNavigationOrigin ??
      tracking?.providerLocation ??
      null;
    const guidance = providerNavigationGuidance(
      selectedBookingDirections,
      navigationOrigin,
      navigationRouteLoading,
      navigationRouteError,
    );
    const liveLocationLabel = providerLiveLocationStatusLabel(providerLiveLocation);
    return (
      <View style={styles.navigationScreen}>
        <View
          style={styles.mapCanvas}
          accessible
          accessibilityLabel="Provider route map"
        >
          <Pressable
            style={styles.mapCloseButton}
            onPress={() => navigate('providerBookingDetail', 'provider')}
            accessibilityRole="button"
            accessibilityLabel="Back to booking details"
          >
            <Text style={styles.mapCloseText}>Close</Text>
          </Pressable>
          <TrackingMapPreview
            tracking={tracking}
            mode="navigation"
            title="Head to the service location"
            subtitle={routeLabel}
            directions={selectedBookingDirections}
            navigationOrigin={navigationOrigin}
          />
          <ProviderNavigationGuidanceBanner guidance={guidance} />
        </View>
        <View style={[styles.navBottomSheet, navigationSheetStyle(providerNavigationSheetLevel)]}>
          <NavigationSheetHeader
            level={providerNavigationSheetLevel}
            setLevel={setProviderNavigationSheetLevel}
            title="Head to the service location"
            subtitle={routeLabel}
          />
          <ProviderNavigationDriveStats
            directions={selectedBookingDirections}
            liveLocationLabel={liveLocationLabel}
          />
          {isHalfSheet ? (
            <>
              <Text style={styles.cardBody} numberOfLines={isExpandedSheet ? 4 : 2}>
                {selectedBooking.serviceAddress ?? 'Address unavailable'}
              </Text>
              <InfoRow label="Route" value={routeLabel} />
              <InfoRow label="Live location" value={liveLocationLabel} />
            </>
          ) : null}
          {isExpandedSheet && selectedBookingDirections?.steps.length ? (
            <View style={styles.routeInstructionList}>
              {selectedBookingDirections.steps.slice(0, 3).map((step, index) => (
                <View
                  key={`${index}-${step.instruction}`}
                  style={styles.routeInstructionRow}
                >
                  <View style={styles.routeInstructionNumber}>
                    <Text style={styles.routeInstructionNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.cardMeta} numberOfLines={2}>
                    {step.instruction}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
          <PrimaryButton
            label="I've Arrived"
            onPress={() => navigate('providerStartService', 'provider')}
          />
          <View style={styles.twoButtons}>
            <View style={styles.flex}>
              <PrimaryButton
                label="Call"
                variant="secondary"
                onPress={() => void callSelectedBookingCustomer()}
              />
            </View>
            <View style={styles.flex}>
              <PrimaryButton
                label="Message"
                variant="secondary"
                onPress={() => void openSelectedConversation()}
              />
            </View>
          </View>
          {isHalfSheet ? (
            <View style={styles.twoButtons}>
              <View style={styles.flex}>
                <PrimaryButton
                  label={navigationRouteLoading ? 'Loading...' : 'Refresh route'}
                  variant="secondary"
                  onPress={() => void refreshProviderDirections(selectedBooking.id)}
                  disabled={navigationRouteLoading}
                />
              </View>
              <View style={styles.flex}>
                <PrimaryButton
                  label="End"
                  variant="danger"
                  onPress={() => navigate('providerBookingDetail', 'provider')}
                />
              </View>
            </View>
          ) : null}
        </View>
      </View>
    );
  }

  function renderProviderStartService(): ReactNode {
    if (!selectedBooking) {
      return <MissingSelection onBack={() => navigate('bookings', 'provider')} />;
    }
    const canStart = Object.values(providerChecklist).every(Boolean);
    return (
      <>
        <TopBar
          title="Start Service"
          subtitle={selectedBooking.bookingReference}
          onBack={() => navigate('providerBookingDetail', 'provider')}
        />
        <ScrollView contentContainerStyle={styles.withStickyFooter}>
          <View style={styles.content}>
            <Card>
              <Text style={styles.operationalTitle}>Ready to Start Service?</Text>
              <Text style={styles.cardBody}>
                Confirm the scope and document the starting condition before beginning work.
              </Text>
            </Card>
            <Card>
              <Text style={styles.cardTitle}>{selectedBooking.serviceTitle ?? 'Service booking'}</Text>
              <Text style={styles.cardMeta}>{formatDateTime(selectedBooking.scheduledAt)}</Text>
              <Text style={styles.cardBody}>{selectedBooking.serviceAddress ?? 'Address unavailable'}</Text>
            </Card>
            <Card>
              <Text style={styles.cardTitle}>Pre-service checklist</Text>
              {renderChecklistRow(
                'Scope confirmed with customer',
                providerChecklist.scopeConfirmed,
                () =>
                  setProviderChecklist((current) => ({
                    ...current,
                    scopeConfirmed: !current.scopeConfirmed,
                  })),
              )}
              {renderChecklistRow(
                'Tools and materials ready',
                providerChecklist.toolsReady,
                () =>
                  setProviderChecklist((current) => ({
                    ...current,
                    toolsReady: !current.toolsReady,
                  })),
              )}
              {renderChecklistRow(
                'Special instructions reviewed',
                providerChecklist.instructionsReviewed,
                () =>
                  setProviderChecklist((current) => ({
                    ...current,
                    instructionsReviewed: !current.instructionsReviewed,
                  })),
              )}
            </Card>
            <Card>
              <Text style={styles.cardTitle}>Before photo</Text>
              <Pressable
                style={styles.uploadBox}
                onPress={() => void pickProviderPhoto('before')}
                accessibilityRole="button"
              >
                {providerBeforePhotoUri ? (
                  <Image source={{ uri: providerBeforePhotoUri }} style={styles.uploadPreview} />
                ) : (
                  <Camera color={palette.mint} size={28} strokeWidth={2.5} />
                )}
                <Text style={styles.linkText}>
                  {providerBeforePhotoUri ? 'Replace starting condition photo' : 'Add starting condition photo'}
                </Text>
              </Pressable>
              {providerBeforePhotoUrl ? (
                <Text style={styles.noticeText}>Starting condition photo uploaded.</Text>
              ) : null}
              <Field
                label="Photo note"
                value={providerPhotoCaption}
                onChangeText={setProviderPhotoCaption}
                placeholder="Example: Kitchen sink before repair"
              />
            </Card>
          </View>
        </ScrollView>
        <View style={styles.stickyFooter}>
          <PrimaryButton
            label="Start Service"
            onPress={() => void startSelectedService()}
            disabled={!canStart || busyAction === 'booking-in_progress'}
          />
          <Text style={styles.footerLink} onPress={() => navigate('providerBookingDetail', 'provider')}>
            Back to booking
          </Text>
          <View style={styles.footerHomeIndicator} />
        </View>
      </>
    );
  }

  function renderProviderServiceInProgress(): ReactNode {
    if (!selectedBooking) {
      return <MissingSelection onBack={() => navigate('bookings', 'provider')} />;
    }
    const startedAt = serviceStartedAt(
      selectedBooking,
      selectedBookingTimelineEvents,
    );
    return (
      <>
        <TopBar
          title="Service in Progress"
          subtitle={selectedBooking.bookingReference}
          onBack={() => navigate('providerBookingDetail', 'provider')}
        />
        <ScrollView contentContainerStyle={styles.withBottomNav}>
          <View style={styles.content}>
            <View style={styles.timerCard}>
              <Clock color={palette.mint} size={28} strokeWidth={2.5} />
              <Text style={styles.timerText}>
                {formatElapsedTime(startedAt ? nowTick - startedAt.getTime() : 0)}
              </Text>
              <Text style={styles.cardMeta}>
                {startedAt
                  ? `Started ${formatDateTime(startedAt.toISOString())}`
                  : 'Service timer starts when work begins.'}
              </Text>
            </View>
            <Card>
              <Text style={styles.cardTitle}>{selectedBooking.serviceTitle ?? 'Service booking'}</Text>
              <Text style={styles.cardBody}>{selectedBooking.serviceAddress ?? 'Address unavailable'}</Text>
            </Card>
            <Card>
              <Field
                label="Progress update"
                value={providerProgressMessage}
                onChangeText={setProviderProgressMessage}
                placeholder="Share a quick update for the customer"
                multiline
              />
              <PrimaryButton
                label="Send Update"
                variant="secondary"
                onPress={() => void submitProviderProgressUpdate()}
                disabled={!providerProgressMessage.trim() || busyAction === 'service-progress'}
              />
            </Card>
            <Card>
              <Text style={styles.cardTitle}>Progress photos</Text>
              <Pressable
                style={styles.uploadBox}
                onPress={() => void pickProviderPhoto('progress')}
                accessibilityRole="button"
              >
                {providerProgressPhotoUri ? (
                  <Image source={{ uri: providerProgressPhotoUri }} style={styles.uploadPreview} />
                ) : (
                  <ImageIcon color={palette.mint} size={28} strokeWidth={2.5} />
                )}
                <Text style={styles.linkText}>
                  {providerProgressPhotoUri ? 'Replace progress photo' : 'Add progress photo'}
                </Text>
              </Pressable>
              {providerProgressPhotoUrl ? (
                <Text style={styles.noticeText}>Progress photo uploaded.</Text>
              ) : null}
            </Card>
            <View style={styles.actions}>
              <PrimaryButton
                label="Complete Service"
                onPress={() => navigate('providerCompleteService', 'provider')}
              />
              <PrimaryButton
                label="Report Issue"
                variant="danger"
                onPress={() => navigate('providerReportIssue', 'provider')}
              />
            </View>
          </View>
        </ScrollView>
      </>
    );
  }

  function renderProviderCompleteService(): ReactNode {
    if (!selectedBooking) {
      return <MissingSelection onBack={() => navigate('bookings', 'provider')} />;
    }
    return (
      <>
        <TopBar
          title="Complete Service"
          subtitle={selectedBooking.bookingReference}
          onBack={() => navigate('providerServiceInProgress', 'provider')}
        />
        <ScrollView contentContainerStyle={styles.withStickyFooter}>
          <View style={styles.content}>
            <Card>
              <Text style={styles.operationalTitle}>Finish and submit</Text>
              <Text style={styles.cardBody}>
                Add final notes before marking this service as completed.
              </Text>
            </Card>
            <Card>
              <Text style={styles.cardTitle}>Completion summary</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Service</Text>
                <Text style={styles.infoValue}>{selectedBooking.serviceTitle ?? 'Service booking'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Customer total</Text>
                <Text style={styles.infoValue}>{formatMoney(selectedBooking.totalAmount)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Provider payout</Text>
                <Text style={styles.infoValue}>
                  {formatMoney(selectedPayment?.providerPayout ?? selectedBooking.totalAmount)}
                </Text>
              </View>
            </Card>
            <Card>
              <Field
                label="Final notes"
                value={completionNotes}
                onChangeText={setCompletionNotes}
                placeholder="What was completed?"
                multiline
              />
              <Pressable
                style={styles.uploadBox}
                onPress={() => void pickProviderPhoto('completion')}
                accessibilityRole="button"
              >
                {providerCompletionPhotoUri ? (
                  <Image source={{ uri: providerCompletionPhotoUri }} style={styles.uploadPreview} />
                ) : (
                  <Upload color={palette.mint} size={28} strokeWidth={2.5} />
                )}
                <Text style={styles.linkText}>
                  {providerCompletionPhotoUri ? 'Replace completion photo' : 'Add completion photo'}
                </Text>
              </Pressable>
              {providerCompletionPhotoUrl ? (
                <Text style={styles.noticeText}>Completion photo uploaded.</Text>
              ) : null}
            </Card>
          </View>
        </ScrollView>
        <View style={styles.stickyFooter}>
          <PrimaryButton
            label="Mark as Completed"
            onPress={() => void completeSelectedService()}
            disabled={busyAction === 'booking-completed'}
          />
          <Text style={styles.footerLink} onPress={() => navigate('providerServiceInProgress', 'provider')}>
            Keep working
          </Text>
          <View style={styles.footerHomeIndicator} />
        </View>
      </>
    );
  }

  function renderProviderServiceCompleted(): ReactNode {
    if (!selectedBooking) {
      return <MissingSelection onBack={() => navigate('bookings', 'provider')} />;
    }
    return (
      <ScrollView contentContainerStyle={styles.withBottomNav}>
        <View style={styles.confirmationContent}>
          <View style={styles.successCircle}>
            <CheckCircle color={palette.white} size={44} strokeWidth={2.8} />
          </View>
          <Text style={styles.confirmationTitle}>Service Completed</Text>
          <Text style={styles.pageCopy}>{selectedBooking.bookingReference}</Text>
          <Card>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Service</Text>
              <Text style={styles.infoValue}>{selectedBooking.serviceTitle ?? 'Service booking'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Earnings</Text>
              <Text style={styles.infoValue}>
                {formatMoney(selectedPayment?.providerPayout ?? selectedBooking.totalAmount)}
              </Text>
            </View>
          </Card>
          <PrimaryButton
            label="View Receipt"
            onPress={() => navigate('providerServiceReceipt', 'provider')}
          />
          <PrimaryButton
            label="Back to Bookings"
            variant="secondary"
            onPress={() => navigate('bookings', 'provider')}
          />
        </View>
      </ScrollView>
    );
  }

  function renderProviderCancelBooking(): ReactNode {
    if (!selectedBooking) {
      return <MissingSelection onBack={() => navigate('bookings', 'provider')} />;
    }

    return (
      <>
        <TopBar
          title="Cancel Booking"
          subtitle={selectedBooking.bookingReference}
          onBack={() => navigate('providerBookingDetail', 'provider')}
        />
        <ScrollView contentContainerStyle={styles.withStickyFooter}>
          <View style={styles.content}>
            <View style={styles.policyCard}>
              <Text style={styles.cardTitle}>Cancellation review</Text>
              <Text style={styles.manageCopy}>
                Cancelling updates the booking status immediately through the existing backend API.
              </Text>
            </View>
            <Card>
              <Text style={styles.cardTitle}>Reason</Text>
              <View style={styles.radioGroup}>
                {providerCancelReasons.map((reason) => (
                  <Pressable
                    key={reason}
                    style={styles.radioRow}
                    onPress={() => setProviderCancelReason(reason)}
                    accessibilityRole="button"
                  >
                    <View style={styles.radioOuter}>
                      {providerCancelReason === reason ? <View style={styles.radioInner} /> : null}
                    </View>
                    <Text style={styles.radioLabel}>{reason}</Text>
                  </Pressable>
                ))}
              </View>
            </Card>
          </View>
        </ScrollView>
        <View style={styles.stickyFooter}>
          <PrimaryButton
            label="Cancel Booking"
            variant="danger"
            onPress={() => void cancelSelectedProviderBooking()}
            disabled={!providerCancelReason || busyAction === 'booking-cancelled'}
          />
          <Text style={styles.footerLink} onPress={() => navigate('providerBookingDetail', 'provider')}>
            Keep booking
          </Text>
          <View style={styles.footerHomeIndicator} />
        </View>
      </>
    );
  }

  function renderProviderReportIssue(): ReactNode {
    if (!selectedBooking) {
      return <MissingSelection onBack={() => navigate('bookings', 'provider')} />;
    }
    return (
      <>
        <TopBar
          title="Report Issue"
          subtitle={selectedBooking.bookingReference}
          onBack={() => navigate('providerBookingDetail', 'provider')}
        />
        <ScrollView contentContainerStyle={styles.withBottomNav}>
          <View style={styles.content}>
            <Card>
              <Text style={styles.cardTitle}>Issue details</Text>
              <Field
                label="Subject"
                value={providerReportReason}
                onChangeText={setProviderReportReason}
                placeholder="Example: Customer unavailable"
              />
              <Field
                label="What happened?"
                value={providerReportDetails}
                onChangeText={setProviderReportDetails}
                placeholder="Add context for support"
                multiline
              />
              <Pressable
                style={styles.uploadBox}
                onPress={() => void pickAndUploadImage('support_evidence', (uri, uploaded) => {
                  setReportEvidencePhotoUri(uri);
                  setReportEvidencePhotoUrl(uploaded.publicUrl);
                  setReportEvidenceUpload(uploaded);
                })}
                accessibilityRole="button"
              >
                {reportEvidencePhotoUri ? (
                  <Image source={{ uri: reportEvidencePhotoUri }} style={styles.uploadPreview} />
                ) : (
                  <Upload color={palette.mint} size={28} strokeWidth={2.5} />
                )}
                <Text style={styles.linkText}>
                  {reportEvidencePhotoUrl ? 'Evidence uploaded' : 'Attach evidence'}
                </Text>
              </Pressable>
            </Card>
            <PrimaryButton
              label="Submit Report"
              onPress={() => void submitProviderIssue()}
              disabled={
                !providerReportReason.trim() ||
                !providerReportDetails.trim() ||
                busyAction === 'support'
              }
            />
          </View>
        </ScrollView>
      </>
    );
  }

  function renderProviderServiceReceipt(): ReactNode {
    if (!selectedBooking) {
      return <MissingSelection onBack={() => navigate('bookings', 'provider')} />;
    }
    return (
      <>
        <TopBar
          title="Service Receipt"
          subtitle={selectedBooking.bookingReference}
          onBack={() => navigate('providerBookingDetail', 'provider')}
        />
        <ScrollView contentContainerStyle={styles.withBottomNav}>
          <View style={styles.content}>
            <Card>
              <Text style={styles.cardTitle}>{selectedBooking.serviceTitle ?? 'Service booking'}</Text>
              <Text style={styles.cardMeta}>{formatDateTime(selectedBooking.scheduledAt)}</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Booking status</Text>
                <Text style={styles.infoValue}>{statusLabel(selectedBooking.status)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Customer paid</Text>
                <Text style={styles.infoValue}>{formatMoney(selectedBooking.totalAmount)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Platform fee</Text>
                <Text style={styles.infoValue}>
                  {formatMoney(selectedPayment?.platformFee ?? 0)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Provider payout</Text>
                <Text style={styles.totalValue}>
                  {formatMoney(selectedPayment?.providerPayout ?? selectedBooking.totalAmount)}
                </Text>
              </View>
            </Card>
            <PrimaryButton
              label="Back to Bookings"
              onPress={() => navigate('bookings', 'provider')}
            />
          </View>
        </ScrollView>
      </>
    );
  }

  function renderChecklistRow(label: string, checked: boolean, onPress: () => void): ReactNode {
    return (
      <Pressable style={styles.checklistRow} onPress={onPress} accessibilityRole="button">
        <View style={[styles.checkboxBox, checked && styles.checkboxBoxChecked]}>
          {checked ? <CheckCircle color={palette.white} size={16} strokeWidth={3} /> : null}
        </View>
        <Text style={styles.radioLabel}>{label}</Text>
      </Pressable>
    );
  }

  function renderProviderCalendar() {
    const upcoming = bookings
      .filter(
        (booking) =>
          booking.scheduledAt &&
          new Date(booking.scheduledAt).getTime() >= Date.now() - 3 * 60 * 60 * 1000 &&
          booking.status !== 'cancelled' &&
          booking.status !== 'completed',
      )
      .slice()
      .sort(
        (a, b) =>
          new Date(a.scheduledAt ?? 0).getTime() -
          new Date(b.scheduledAt ?? 0).getTime(),
      );
    return (
      <>
        <TopBar title="Calendar" subtitle="Upcoming jobs, availability, and days off" />
        <ScrollView contentContainerStyle={styles.withBottomNav}>
          <View style={styles.content}>
            <Section title="Upcoming jobs">
              {upcoming.length ? (
                upcoming.slice(0, 10).map((booking) => (
                  <Card
                    key={booking.id}
                    onPress={() => openBooking(booking, 'providerBookingDetail')}
                  >
                    <View style={styles.rowBetween}>
                      <View style={styles.flex}>
                        <Text style={styles.cardTitle}>
                          {booking.serviceTitle ?? 'Service booking'}
                        </Text>
                        <Text style={styles.cardMeta}>
                          {formatDateTime(booking.scheduledAt)}
                        </Text>
                        <Text style={styles.cardBody}>
                          {booking.serviceAddress ?? 'Address pending'}
                        </Text>
                      </View>
                      <Badge
                        label={statusLabel(booking.status)}
                        tone={bookingStatusChip(booking.status).tone}
                      />
                    </View>
                  </Card>
                ))
              ) : (
                <EmptyState
                  title="No upcoming jobs"
                  body="Confirmed bookings will appear here, grouped by date."
                />
              )}
            </Section>
            <Section title="Weekly availability">
              {dayOrder.map((day) => {
                const window = availability?.windows.find((item) => item.dayOfWeek === day);
                return (
                  <Card key={day}>
                    <View style={styles.rowBetween}>
                      <View>
                        <Text style={styles.cardTitle}>{dayLabels[day]}</Text>
                        <Text style={styles.cardMeta}>
                          {window?.isActive ? `${window.startTime} to ${window.endTime}` : 'Unavailable'}
                        </Text>
                      </View>
                      <Badge
                        label={window?.isActive ? 'available' : 'closed'}
                        tone={window?.isActive ? 'success' : 'neutral'}
                      />
                    </View>
                  </Card>
                );
              })}
            </Section>
            <Section title="Edit window">
              <View style={styles.wrap}>
                {dayOrder.map((day) => {
                  const selected = day === windowDay;
                  return (
                    <Pressable
                      key={day}
                      style={[
                        styles.weekdayChip,
                        selected && styles.weekdayChipSelected,
                      ]}
                      onPress={() => setWindowDay(day)}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      accessibilityLabel={`${dayLabels[day]} availability window`}
                    >
                      <Text
                        style={[
                          styles.weekdayChipText,
                          selected && styles.weekdayChipTextSelected,
                        ]}
                      >
                        {dayLabels[day].slice(0, 3)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Field label="Start" value={windowStart} onChangeText={setWindowStart} />
              <Field label="End" value={windowEnd} onChangeText={setWindowEnd} />
              <PrimaryButton
                label="Save weekly window"
                onPress={() => void saveAvailabilityWindow()}
                disabled={busyAction === 'availability-window'}
              />
            </Section>
            <Section title="Days off">
              <Field label="Day off date" value={dayOffDate} onChangeText={setDayOffDate} />
              <Field label="Reason" value={dayOffReason} onChangeText={setDayOffReason} />
              <PrimaryButton
                label="Add day off"
                variant="secondary"
                onPress={() => void addDayOff()}
                disabled={busyAction === 'day-off'}
              />
              {availability?.daysOff.map((dayOff) => (
                <Card key={dayOff.id}>
                  <View style={styles.rowBetween}>
                    <View>
                      <Text style={styles.cardTitle}>{dayOff.offDate}</Text>
                      <Text style={styles.cardMeta}>{dayOff.reason ?? 'Day off'}</Text>
                    </View>
                    <Text style={styles.linkText} onPress={() => void deleteDayOff(dayOff.offDate)}>
                      Remove
                    </Text>
                  </View>
                </Card>
              ))}
            </Section>
          </View>
        </ScrollView>
      </>
    );
  }

  function renderProviderProfileView() {
    return (
      <>
        <TopBar
          title="Provider Profile"
          subtitle="Public business profile"
          onBack={() => navigate('more', 'provider')}
          right={
            <PrimaryButton
              label="Edit"
              variant="secondary"
              onPress={() => navigate('providerEditProfile', 'provider')}
            />
          }
        />
        <ScrollView contentContainerStyle={styles.withBottomNav}>
          <View style={styles.content}>
            <Card>
              <View style={styles.profileHero}>
                <View style={styles.profileAvatarLarge}>
                  <Text style={styles.profileAvatarLargeText}>
                    {(profile?.providerProfile?.businessName ??
                      profile?.user.fullName ??
                      'P')
                      .slice(0, 1)
                      .toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.detailTitle}>
                  {profile?.providerProfile?.businessName ??
                    profile?.user.fullName ??
                    'Service Provider'}
                </Text>
                <Text style={styles.cardMeta}>
                  {profile?.providerProfile?.verificationStatus ?? 'pending'} ·{' '}
                  {profile?.providerProfile?.averageRating.toFixed(1) ?? '0.0'} rating ·{' '}
                  {profile?.providerProfile?.reviewCount ?? 0} reviews
                </Text>
              </View>
            </Card>
            <Section title="Account">
              <ProfileInfoRow
                icon={User}
                label="Name"
                value={profile?.user.fullName ?? 'N/A'}
              />
              <ProfileInfoRow
                icon={Mail}
                label="Email"
                value={profile?.user.email ?? 'N/A'}
              />
              <ProfileInfoRow
                icon={Phone}
                label="Phone"
                value={profile?.user.contactNumber ?? 'N/A'}
              />
            </Section>
            <Section title="Portfolio Preview">
              <View style={styles.portfolioGrid}>
                {providerPortfolioMedia.slice(0, 4).map((item) => (
                  <View key={item.id} style={styles.portfolioTile}>
                    <Image source={{ uri: item.fileUrl }} style={styles.portfolioImage} />
                    {item.caption ? (
                      <Text style={styles.portfolioText} numberOfLines={1}>
                        {item.caption}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
              {!providerPortfolioMedia.length ? (
                <EmptyState title="No portfolio yet" body="Upload work samples to build trust." />
              ) : null}
              <PrimaryButton
                label="Manage Portfolio"
                variant="secondary"
                onPress={() => navigate('providerPortfolio', 'provider')}
              />
            </Section>
            <Section title="My Reviews">
              {ownReviews.slice(0, 10).map((review) => (
                <Card key={review.id}>
                  <View style={styles.ratingRow}>
                    <Star color="#FFC107" fill="#FFC107" size={14} />
                    <Text style={styles.cardTitle}>{review.rating.toFixed(1)}</Text>
                    <Text style={styles.cardMeta}> · {review.reviewerFullName ?? 'Customer'}</Text>
                  </View>
                  <Text style={styles.cardBody}>{review.reviewText ?? 'No review text.'}</Text>
                  {replyingToReviewId === review.id ? (
                    <>
                      <Field
                        label="Your reply"
                        value={reviewReplyText}
                        onChangeText={setReviewReplyText}
                        multiline
                      />
                      <View style={styles.twoButtons}>
                        <PrimaryButton
                          label={busyAction === 'review-reply' ? 'Sending...' : 'Submit Reply'}
                          onPress={() => void submitReviewReply()}
                          disabled={busyAction === 'review-reply'}
                        />
                        <PrimaryButton
                          label="Cancel"
                          variant="secondary"
                          onPress={() => {
                            setReplyingToReviewId(null);
                            setReviewReplyText('');
                          }}
                        />
                      </View>
                    </>
                  ) : (
                    <Text
                      style={styles.linkText}
                      onPress={() => setReplyingToReviewId(review.id)}
                    >
                      Reply to this review
                    </Text>
                  )}
                </Card>
              ))}
              {!ownReviews.length ? (
                <EmptyState title="No reviews yet" body="Customer reviews will appear here once received." />
              ) : null}
            </Section>
          </View>
        </ScrollView>
      </>
    );
  }

  function renderProviderEditProfile() {
    return (
      <>
        <TopBar
          title="Edit Profile"
          subtitle="Update account and business details"
          onBack={() => navigate('providerProfileView', 'provider')}
        />
        <ScrollView contentContainerStyle={styles.withStickyFooter}>
          <View style={styles.content}>
            <Card>
              <Field
                label="Full Name"
                value={profileFullName}
                onChangeText={setProfileFullName}
                placeholder="Your full name"
              />
              <Field
                label="Phone Number"
                value={profileContactNumber}
                onChangeText={setProfileContactNumber}
                keyboardType="phone-pad"
                placeholder="+639000000000"
              />
              <Field
                label="Business Name"
                value={profileBusinessName}
                onChangeText={setProfileBusinessName}
                placeholder="Your provider business name"
              />
              <Text style={styles.noticeText}>
                Service area and service descriptions are managed from provider services.
              </Text>
            </Card>
          </View>
        </ScrollView>
        <View style={styles.stickyFooter}>
          <PrimaryButton
            label={busyAction === 'profile-update' ? 'Saving...' : 'Save Profile'}
            onPress={() => void saveProfile()}
            disabled={busyAction === 'profile-update' || !profile}
          />
          <Text
            style={styles.footerLink}
            onPress={() => navigate('providerProfileView', 'provider')}
          >
            Back to profile
          </Text>
          <View style={styles.footerHomeIndicator} />
        </View>
      </>
    );
  }

  function renderProviderPortfolio() {
    return (
      <>
        <TopBar
          title="Portfolio"
          subtitle="Work samples shown to customers"
          onBack={() => navigate('providerProfileView', 'provider')}
          right={
            <PrimaryButton
              label="Refresh"
              variant="secondary"
              onPress={() => void refreshWorkspace()}
            />
          }
        />
        <ScrollView contentContainerStyle={styles.withBottomNav}>
          <View style={styles.content}>
            <Pressable
              style={styles.uploadBox}
              onPress={() => void uploadProviderPortfolioMedia()}
              accessibilityRole="button"
            >
              {providerPortfolioPhotoUri ? (
                <Image source={{ uri: providerPortfolioPhotoUri }} style={styles.uploadPreview} />
              ) : (
                <ImageIcon color={palette.mint} size={28} strokeWidth={2.5} />
              )}
              <Text style={styles.linkText}>
                {providerPortfolioPhotoUrl ? 'Portfolio media uploaded' : 'Upload portfolio media'}
              </Text>
            </Pressable>

            <View style={styles.portfolioGrid}>
              {providerPortfolioMedia.map((item) => (
                <View key={item.id} style={styles.portfolioTile}>
                  <Image source={{ uri: item.fileUrl }} style={styles.portfolioImage} />
                  {editingPortfolioCaptionId === item.id ? (
                    <View style={styles.portfolioEditor}>
                      <Field
                        label="Caption"
                        value={portfolioCaptionDraft}
                        onChangeText={setPortfolioCaptionDraft}
                        placeholder="Portfolio caption"
                      />
                      <View style={styles.twoButtons}>
                        <PrimaryButton
                          label="Save"
                          onPress={() => void saveProviderPortfolioCaption(item)}
                          disabled={busyAction === `portfolio-caption-${item.id}`}
                        />
                        <PrimaryButton
                          label="Cancel"
                          variant="secondary"
                          onPress={() => {
                            setEditingPortfolioCaptionId(null);
                            setPortfolioCaptionDraft('');
                          }}
                        />
                      </View>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.portfolioText} numberOfLines={1}>
                        {item.caption ?? item.fileName ?? 'Portfolio media'}
                      </Text>
                      <View style={styles.portfolioActions}>
                        <Text
                          style={styles.linkText}
                          onPress={() => void moveProviderPortfolioMedia(item.id, -1)}
                        >
                          Up
                        </Text>
                        <Text
                          style={styles.linkText}
                          onPress={() => void moveProviderPortfolioMedia(item.id, 1)}
                        >
                          Down
                        </Text>
                        <Text
                          style={styles.linkText}
                          onPress={() => {
                            setEditingPortfolioCaptionId(item.id);
                            setPortfolioCaptionDraft(item.caption ?? '');
                          }}
                        >
                          Edit
                        </Text>
                      </View>
                    </>
                  )}
                  <Pressable
                    style={styles.deleteOverlay}
                    onPress={() => void removeProviderPortfolioMedia(item.id)}
                    accessibilityRole="button"
                  >
                    <Trash2 color={palette.white} size={16} strokeWidth={2.6} />
                  </Pressable>
                </View>
              ))}
            </View>
            {!providerPortfolioMedia.length ? (
              <EmptyState
                title="No portfolio yet"
                body="Upload photos of completed services."
              />
            ) : null}
          </View>
        </ScrollView>
      </>
    );
  }

  function renderProviderPayoutManagement() {
    const nextPayoutDate = payoutAccount?.nextPayoutDate
      ? formatDateTime(payoutAccount.nextPayoutDate)
      : 'Not scheduled';

    return (
      <>
        <TopBar
          title="Payouts"
          subtitle="Manage earnings and payout methods"
          onBack={() => navigate('more', 'provider')}
          right={
            <PrimaryButton
              label="Refresh"
              variant="secondary"
              onPress={() => void refreshWorkspace()}
            />
          }
        />
        <ScrollView contentContainerStyle={styles.withBottomNav}>
          <View style={styles.content}>
            <MetricCard
              label="Available Payout"
              value={formatMoney(payoutAccount?.availableBalance ?? payoutTotal)}
              featured
            />
            <View style={styles.metricGrid}>
              <MetricCard
                label="Pending"
                value={formatMoney(payoutAccount?.pendingBalance ?? 0)}
              />
              <MetricCard
                label="Paid Out"
                value={formatMoney(payoutAccount?.totalPaidOut ?? 0)}
              />
              <MetricCard label="Next" value={nextPayoutDate} />
            </View>

            <PrimaryButton
              label="Request Payout"
              onPress={() => navigate('providerRequestPayout', 'provider')}
              disabled={!payoutMethods.length}
            />

            <Section title="Payout Methods">
              {payoutMethods.map((method) => (
                <Pressable
                  key={method.id}
                  style={styles.settingsRow}
                  onPress={() => setSelectedPayoutMethodId(method.id)}
                  accessibilityRole="button"
                >
                  <View style={styles.settingsRowLeft}>
                    <View style={styles.quickIcon}>
                      <Wallet color={palette.mint} size={20} strokeWidth={2.5} />
                    </View>
                    <View>
                      <Text style={styles.cardTitle}>{method.accountLabel}</Text>
                      <Text style={styles.cardMeta}>
                        {method.methodType.toUpperCase()}
                        {method.isDefault ? ' · Default' : ''}
                      </Text>
                    </View>
                  </View>
                  {selectedPayoutMethodId === method.id ? (
                    <CheckCircle color={palette.mint} size={20} strokeWidth={2.6} />
                  ) : null}
                </Pressable>
              ))}
              {!payoutMethods.length ? (
                <EmptyState
                  title="No payout method"
                  body="Add a bank, GCash, or PayMaya account below to receive payouts."
                />
              ) : null}
            </Section>

            <Section title="Add Payout Method">
              <Card>
                <Text style={styles.cardMeta}>Account type</Text>
                <View style={styles.wrap}>
                  {(['bank', 'gcash', 'paymaya'] as const).map((type) => (
                    <Pill
                      key={type}
                      label={type === 'bank' ? 'Bank' : type === 'gcash' ? 'GCash' : 'PayMaya'}
                      selected={newPayoutMethodType === type}
                      onPress={() => setNewPayoutMethodType(type)}
                    />
                  ))}
                </View>
                <Field
                  label="Account label"
                  value={newPayoutAccountLabel}
                  onChangeText={setNewPayoutAccountLabel}
                  placeholder={
                    newPayoutMethodType === 'bank'
                      ? 'BPI Savings ****1234'
                      : newPayoutMethodType === 'gcash'
                        ? 'GCash 09171234567'
                        : 'PayMaya 09171234567'
                  }
                />
                <Field
                  label="Account holder name"
                  value={newPayoutAccountName}
                  onChangeText={setNewPayoutAccountName}
                  placeholder="Full name on the account"
                />
                <Field
                  label="Last 4 digits"
                  value={newPayoutAccountLast4}
                  onChangeText={setNewPayoutAccountLast4}
                  placeholder="1234"
                  keyboardType="number-pad"
                />
                <PrimaryButton
                  label={
                    busyAction === 'save-payout-method'
                      ? 'Saving...'
                      : 'Save Payout Method'
                  }
                  onPress={() => void saveNewPayoutMethod()}
                  disabled={
                    !newPayoutAccountLabel.trim() ||
                    busyAction === 'save-payout-method'
                  }
                />
              </Card>
            </Section>

            <Section title="Monthly Earnings">
              {(() => {
                const monthly = summarizeMonthlyEarnings(payments);
                if (!monthly.length) {
                  return (
                    <EmptyState
                      title="No earnings yet"
                      body="Completed bookings will show up here as monthly earnings."
                    />
                  );
                }
                return monthly.slice(0, 6).map((month) => (
                  <Card key={month.monthKey}>
                    <View style={styles.rowBetween}>
                      <View style={styles.flex}>
                        <Text style={styles.cardTitle}>{month.monthLabel}</Text>
                        <Text style={styles.cardMeta}>
                          {month.paidCount} paid · {month.pendingCount} pending
                        </Text>
                        <Text style={styles.noticeText}>
                          Platform fee {formatMoney(month.totalPlatformFee)}
                        </Text>
                      </View>
                      <Text style={styles.totalValue}>
                        {formatMoney(month.totalPayout)}
                      </Text>
                    </View>
                  </Card>
                ));
              })()}
            </Section>

            <Section title="Payout Requests">
              {providerPayouts.map((payout) => (
                <Card key={payout.id}>
                  <View style={styles.rowBetween}>
                    <View style={styles.flex}>
                      <Text style={styles.cardTitle}>
                        {formatMoney(payout.netAmount || payout.amount)}
                      </Text>
                      <Text style={styles.cardMeta}>
                        {payout.reference ?? payout.id.slice(0, 8)} ·{' '}
                        {payout.accountLabel ?? 'Payout method'}
                      </Text>
                      <Text style={styles.noticeText}>
                        Fee {formatMoney(payout.processingFee)} · Requested{' '}
                        {formatDateTime(payout.requestedAt ?? payout.createdAt)}
                      </Text>
                    </View>
                    <Badge
                      label={payout.status}
                      tone={payout.status === 'paid' ? 'success' : 'warning'}
                    />
                  </View>
                </Card>
              ))}
              {!providerPayouts.length ? (
                <EmptyState
                  title="No payout requests"
                  body="Requested payouts will appear here."
                />
              ) : null}
            </Section>
          </View>
        </ScrollView>
      </>
    );
  }

  function renderProviderRequestPayout() {
    const amount = Number(requestPayoutAmount);
    const selectedMethod =
      payoutMethods.find((method) => method.id === selectedPayoutMethodId) ??
      payoutMethods.find((method) => method.isDefault) ??
      payoutMethods[0] ??
      null;
    const fee = Number.isFinite(amount) && amount > 0 ? amount * 0.025 : 0;
    const netAmount = Number.isFinite(amount) && amount > 0 ? amount - fee : 0;
    const availableBalance = payoutAccount?.availableBalance ?? 0;
    const canSubmit =
      Boolean(selectedMethod) &&
      Number.isFinite(amount) &&
      amount > 0 &&
      amount <= availableBalance &&
      busyAction !== 'provider-payout';

    return (
      <>
        <TopBar
          title="Request Payout"
          subtitle="Withdraw available earnings"
          onBack={() => navigate('providerPayoutManagement', 'provider')}
        />
        <ScrollView contentContainerStyle={styles.withStickyFooter}>
          <View style={styles.content}>
            <MetricCard
              label="Available Balance"
              value={formatMoney(availableBalance)}
              featured
            />
            <Card>
              <Field
                label="Amount"
                value={requestPayoutAmount}
                onChangeText={setRequestPayoutAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
              />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Processing fee</Text>
                <Text style={styles.infoValue}>{formatMoney(fee)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>You receive</Text>
                <Text style={styles.totalValue}>{formatMoney(netAmount)}</Text>
              </View>
            </Card>
            <Section title="Send To">
              {payoutMethods.map((method) => (
                <Pressable
                  key={method.id}
                  style={[
                    styles.methodCard,
                    selectedMethod?.id === method.id && styles.methodCardSelected,
                  ]}
                  onPress={() => setSelectedPayoutMethodId(method.id)}
                  accessibilityRole="button"
                >
                  <View style={styles.settingsRowLeft}>
                    <Wallet color={palette.mint} size={20} strokeWidth={2.5} />
                    <View>
                      <Text style={styles.cardTitle}>{method.accountLabel}</Text>
                      <Text style={styles.cardMeta}>{method.methodType.toUpperCase()}</Text>
                    </View>
                  </View>
                  {selectedMethod?.id === method.id ? (
                    <CheckCircle color={palette.mint} size={20} strokeWidth={2.6} />
                  ) : null}
                </Pressable>
              ))}
              {!payoutMethods.length ? (
                <EmptyState
                  title="No payout method"
                  body="Set up a payout method before requesting funds."
                />
              ) : null}
            </Section>
          </View>
        </ScrollView>
        <View style={styles.stickyFooter}>
          <PrimaryButton
            label={busyAction === 'provider-payout' ? 'Requesting...' : 'Submit Payout Request'}
            onPress={() => void submitProviderPayoutRequest()}
            disabled={!canSubmit}
          />
          <Text
            style={styles.footerLink}
            onPress={() => navigate('providerPayoutManagement', 'provider')}
          >
            Back to payouts
          </Text>
          <View style={styles.footerHomeIndicator} />
        </View>
      </>
    );
  }

  function renderProviderMore() {
    return (
      <>
        <TopBar title="More" subtitle="Provider tools and account settings" />
        <ScrollView contentContainerStyle={styles.withBottomNav}>
          <View style={styles.content}>
            <View style={styles.twoButtons}>
              <QuickAction
                label="Profile"
                onPress={() => navigate('providerProfileView', 'provider')}
              />
              <QuickAction
                label="Portfolio"
                onPress={() => navigate('providerPortfolio', 'provider')}
              />
            </View>
            <View style={styles.twoButtons}>
              <QuickAction
                label="Services"
                onPress={() => navigate('providerServices', 'provider')}
              />
              <QuickAction
                label="Availability"
                onPress={() => navigate('calendar', 'provider')}
              />
            </View>
            <View style={styles.twoButtons}>
              <QuickAction
                label="Payouts"
                onPress={() => navigate('providerPayoutManagement', 'provider')}
              />
              <QuickAction
                label="Request Payout"
                onPress={() => navigate('providerRequestPayout', 'provider')}
              />
            </View>
            <View style={styles.twoButtons}>
              <QuickAction
                label="Insights"
                onPress={() => navigate('providerInsights', 'provider')}
              />
              <QuickAction
                label="Notifications"
                onPress={() => navigate('providerNotifications', 'provider')}
              />
            </View>
            <View style={styles.twoButtons}>
              <QuickAction
                label="Help Center"
                onPress={() => navigate('providerHelp', 'provider')}
              />
              <QuickAction
                label="Security"
                onPress={() => navigate('providerSecurity', 'provider')}
              />
            </View>
            <View style={styles.twoButtons}>
              <QuickAction
                label="Settings"
                onPress={() => navigate('providerSettings', 'provider')}
              />
            </View>
          </View>
        </ScrollView>
      </>
    );
  }

  function renderProviderServices() {
    return (
      <>
        <TopBar
          title="Services"
          subtitle="Manage marketplace listings"
          onBack={() => navigate('more', 'provider')}
        />
        <ScrollView contentContainerStyle={styles.withBottomNav}>
          <View style={styles.content}>
            <Section title="My Services">
              {ownedServices.map((svc) => (
                <Card key={svc.id}>
                  {editingServiceId === svc.id ? (
                    <>
                      <Field label="Title" value={editServiceTitle} onChangeText={setEditServiceTitle} />
                      <Field
                        label="Price"
                        value={editServicePrice}
                        onChangeText={setEditServicePrice}
                        keyboardType="decimal-pad"
                      />
                      <View style={styles.twoButtons}>
                        <PrimaryButton
                          label={busyAction === 'service-edit' ? 'Saving...' : 'Save'}
                          onPress={() => void saveOwnedServiceEdit()}
                          disabled={busyAction === 'service-edit'}
                        />
                        <PrimaryButton
                          label="Cancel"
                          variant="secondary"
                          onPress={() => setEditingServiceId(null)}
                        />
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={styles.rowBetween}>
                        <View style={styles.flex}>
                          <Text style={styles.cardTitle}>{svc.title}</Text>
                          <Text style={styles.cardMeta}>{svc.price != null ? formatMoney(svc.price) : 'No price'} · {svc.pricingMode ?? 'flat'}</Text>
                        </View>
                        <Badge label={svc.isActive ? 'active' : 'inactive'} tone={svc.isActive ? 'success' : 'neutral'} />
                      </View>
                      <View style={[styles.twoButtons, { marginTop: 12 }]}>
                        <PrimaryButton
                          label="Edit"
                          variant="secondary"
                          onPress={() => {
                            setEditingServiceId(svc.id);
                            setEditServiceTitle(svc.title);
                            setEditServicePrice(svc.price != null ? String(svc.price) : '');
                          }}
                        />
                        <PrimaryButton
                          label={
                            busyAction === `service-toggle-${svc.id}`
                              ? 'Updating...'
                              : svc.isActive
                                ? 'Pause'
                                : 'Activate'
                          }
                          variant="secondary"
                          onPress={() => void toggleOwnedServiceActive(svc.id)}
                          disabled={busyAction === `service-toggle-${svc.id}`}
                        />
                      </View>
                      <PrimaryButton
                        label={
                          busyAction === `service-remove-${svc.id}` ? 'Removing...' : 'Remove'
                        }
                        variant="danger"
                        onPress={() => void removeOwnedService(svc.id)}
                        disabled={busyAction === `service-remove-${svc.id}`}
                      />
                    </>
                  )}
                </Card>
              ))}
              {!ownedServices.length ? (
                <EmptyState title="No services yet" body="Add services to appear in marketplace listings." />
              ) : null}
              {showAddServiceForm ? (
                <Card>
                  <Text style={styles.cardTitle}>Add new service</Text>
                  <Field
                    label="Service title"
                    value={newServiceTitle}
                    onChangeText={setNewServiceTitle}
                    placeholder="e.g. Deep house cleaning"
                  />
                  <Field
                    label="Price (PHP)"
                    value={newServicePrice}
                    onChangeText={setNewServicePrice}
                    keyboardType="decimal-pad"
                    placeholder="1500"
                  />
                  <View style={styles.wrap}>
                    <Pill
                      label="Flat rate"
                      selected={newServicePricingMode === 'flat'}
                      onPress={() => setNewServicePricingMode('flat')}
                    />
                    <Pill
                      label="Hourly rate"
                      selected={newServicePricingMode === 'hourly'}
                      onPress={() => setNewServicePricingMode('hourly')}
                    />
                  </View>
                  <View style={styles.twoButtons}>
                    <PrimaryButton
                      label={busyAction === 'service-add' ? 'Saving...' : 'Save Service'}
                      onPress={() => void addOwnedService()}
                      disabled={busyAction === 'service-add'}
                    />
                    <PrimaryButton
                      label="Cancel"
                      variant="secondary"
                      onPress={() => {
                        setShowAddServiceForm(false);
                        setNewServiceTitle('');
                        setNewServicePrice('');
                      }}
                    />
                  </View>
                </Card>
              ) : (
                <PrimaryButton
                  label="Add new service"
                  onPress={() => setShowAddServiceForm(true)}
                />
              )}
            </Section>
          </View>
        </ScrollView>
      </>
    );
  }

  function renderProviderSecurity() {
    return (
      <>
        <TopBar
          title="Security"
          subtitle="Protect your provider account"
          onBack={() => navigate('more', 'provider')}
        />
        <ScrollView contentContainerStyle={styles.withBottomNav}>
          <View style={styles.content}>
            <Section title="Two-factor authentication">
              {renderTwoFactorSettings()}
            </Section>
          </View>
        </ScrollView>
      </>
    );
  }

  function renderProviderSettings() {
    return (
      <>
        <TopBar
          title="Settings"
          subtitle="Account access and danger zone"
          onBack={() => navigate('more', 'provider')}
        />
        <ScrollView contentContainerStyle={styles.withBottomNav}>
          <View style={styles.content}>
            <SettingsSection title="Account">
              <SettingsRow
                icon={BriefcaseBusiness}
                label={profile?.providerProfile?.businessName ?? 'Provider account'}
                value={profile?.user.email ?? 'Email unavailable'}
              />
            </SettingsSection>
            {renderSupportPanel()}
            <PrimaryButton label="Sign out" variant="secondary" onPress={signOut} />
            <SettingsSection title="Danger Zone">
              <Text style={styles.cardMeta}>
                Type {profile?.user.email ?? 'your email'} to enable account deletion.
              </Text>
              <Field
                label="Confirm email"
                value={deleteConfirmText}
                onChangeText={setDeleteConfirmText}
                placeholder={profile?.user.email ?? 'email@example.com'}
                keyboardType="email-address"
              />
              <PrimaryButton
                label={busyAction === 'delete-account' ? 'Deleting...' : 'Delete Account'}
                variant="danger"
                onPress={() => void deleteMyAccount()}
                disabled={busyAction === 'delete-account' || !canConfirmAccountDeletion}
              />
            </SettingsSection>
          </View>
        </ScrollView>
      </>
    );
  }

  function renderProfileCard() {
    return (
      <Section title="Profile">
        <Card>
          <Text style={styles.detailTitle}>{profile?.user.fullName ?? profile?.user.email ?? 'Guest'}</Text>
          <Text style={styles.cardMeta}>
            {profile ? `${roleLabel(profile.user.role)} · ${profile.user.status}` : 'Signed out'}
          </Text>
          <Field
            label="Full Name"
            value={profileFullName}
            onChangeText={setProfileFullName}
            placeholder="Your full name"
          />
          <Field
            label="Phone Number"
            value={profileContactNumber}
            onChangeText={setProfileContactNumber}
            keyboardType="phone-pad"
            placeholder="+639000000000"
          />
          {profile?.providerProfile ? (
            <>
              <Field
                label="Business Name"
                value={profileBusinessName}
                onChangeText={setProfileBusinessName}
                placeholder="Your provider business name"
              />
              <Pressable
                style={styles.uploadBox}
                onPress={() => void uploadProviderPortfolioMedia()}
                accessibilityRole="button"
              >
                {providerPortfolioPhotoUri ? (
                  <Image source={{ uri: providerPortfolioPhotoUri }} style={styles.uploadPreview} />
                ) : (
                  <ImageIcon color={palette.mint} size={28} strokeWidth={2.5} />
                )}
                <Text style={styles.linkText}>
                  {providerPortfolioPhotoUrl ? 'Portfolio media uploaded' : 'Upload portfolio media'}
                </Text>
              </Pressable>
              <Text style={styles.cardMeta}>
                {profile.providerProfile.averageRating.toFixed(1)} rating ·{' '}
                {profile.providerProfile.reviewCount} reviews ·{' '}
                {profile.providerProfile.verificationStatus}
              </Text>
            </>
          ) : null}
          {profile?.customerProfile ? (
            <Field
              label="Address"
              value={profileAddress}
              onChangeText={setProfileAddress}
              placeholder="Unit, street, city"
              multiline
            />
          ) : null}
          <PrimaryButton
            label={busyAction === 'profile-update' ? 'Saving...' : 'Save Profile'}
            onPress={() => void saveProfile()}
            disabled={busyAction === 'profile-update' || !profile}
          />
        </Card>
      </Section>
    );
  }

  async function loadSupportTicketReplies(ticketId: string) {
    if (!session) {
      return;
    }
    try {
      const replies = await listSupportTicketReplies(ticketId, apiOptions);
      setSupportReplies((current) => ({ ...current, [ticketId]: replies }));
    } catch (error) {
      setNotice(readError(error));
    }
  }

  function toggleSupportTicket(ticketId: string) {
    if (expandedSupportTicketId === ticketId) {
      setExpandedSupportTicketId(null);
      return;
    }
    setExpandedSupportTicketId(ticketId);
    setSupportReplyDraft('');
    if (!supportReplies[ticketId]) {
      void loadSupportTicketReplies(ticketId);
    }
  }

  async function submitSupportReply(ticketId: string) {
    const message = supportReplyDraft.trim();
    if (!message || !session) {
      return;
    }
    setBusyAction(`support-reply-${ticketId}`);
    try {
      const reply = await createSupportTicketReply(ticketId, message, apiOptions);
      setSupportReplies((current) => {
        const existing = current[ticketId] ?? [];
        return { ...current, [ticketId]: [...existing, reply] };
      });
      setSupportReplyDraft('');
      setNotice('Reply sent.');
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  function renderSupportPanel() {
    return (
      <Section title="Support">
        <Field
          label="Subject"
          value={supportSubject}
          onChangeText={setSupportSubject}
          placeholder="How can we help?"
        />
        <Field
          label="Message"
          value={supportMessage}
          onChangeText={setSupportMessage}
          multiline
        />
        <PrimaryButton
          label="Open support ticket"
          variant="secondary"
          onPress={() => void submitSupportTicket()}
          disabled={!session || busyAction === 'support'}
        />
        {supportTickets.slice(0, 5).map((ticket) => {
          const isExpanded = expandedSupportTicketId === ticket.id;
          const replies = supportReplies[ticket.id] ?? [];
          const canReply = ticket.status !== 'closed' && ticket.status !== 'resolved';
          return (
            <Card key={ticket.id} onPress={() => toggleSupportTicket(ticket.id)}>
              <View style={styles.rowBetween}>
                <View style={styles.flex}>
                  <Text style={styles.cardTitle}>{ticket.subject}</Text>
                  <Text style={styles.cardMeta}>
                    {ticket.message ?? ticket.category ?? 'Support ticket'}
                  </Text>
                  {ticket.attachments?.length ? (
                    <Text style={styles.noticeText}>
                      {ticket.attachments.length} evidence file
                      {ticket.attachments.length === 1 ? '' : 's'} attached
                    </Text>
                  ) : null}
                </View>
                <Badge
                  label={ticket.status.replace('_', ' ')}
                  tone={ticket.status === 'resolved' ? 'success' : 'warning'}
                />
              </View>
              {isExpanded ? (
                <View style={styles.supportRepliesBlock}>
                  {replies.length === 0 ? (
                    <Text style={styles.noticeText}>
                      No replies yet. Support will reply here.
                    </Text>
                  ) : (
                    replies.map((reply) => {
                      const mine = reply.repliedBy === profile?.user.id;
                      return (
                        <View
                          key={reply.id}
                          style={[
                            styles.messageBubble,
                            mine && styles.messageBubbleMine,
                          ]}
                        >
                          <Text style={styles.cardMeta}>
                            {mine ? 'You' : 'Support'} ·{' '}
                            {reply.createdAt ? formatDateTime(reply.createdAt) : ''}
                          </Text>
                          <Text style={styles.cardBody}>{reply.message}</Text>
                        </View>
                      );
                    })
                  )}
                  {canReply ? (
                    <>
                      <Field
                        label="Your reply"
                        value={supportReplyDraft}
                        onChangeText={setSupportReplyDraft}
                        placeholder="Share more details for support"
                        multiline
                      />
                      <PrimaryButton
                        label={
                          busyAction === `support-reply-${ticket.id}`
                            ? 'Sending…'
                            : 'Send reply'
                        }
                        onPress={() => void submitSupportReply(ticket.id)}
                        disabled={
                          !supportReplyDraft.trim() ||
                          busyAction === `support-reply-${ticket.id}`
                        }
                      />
                    </>
                  ) : (
                    <Text style={styles.noticeText}>
                      This ticket is {ticket.status}. Open a new ticket for further help.
                    </Text>
                  )}
                </View>
              ) : null}
            </Card>
          );
        })}
      </Section>
    );
  }

  function renderNotificationsPanel() {
    return (
      <Section title="Notifications">
        {visibleNotifications.slice(0, 5).map((notification) => (
          <Card key={notification.id}>
            <View style={styles.rowBetween}>
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>{notification.title ?? notification.type}</Text>
                <Text style={styles.cardMeta}>{notification.body}</Text>
              </View>
              {!notification.isRead ? (
                <Text style={styles.linkText} onPress={() => void markRead(notification.id)}>
                  Read
                </Text>
              ) : (
                <Badge label="read" />
              )}
            </View>
          </Card>
        ))}
        {!visibleNotifications.length ? (
          <EmptyState title="No notifications" body="Updates will appear here." />
        ) : null}
      </Section>
    );
  }

  function renderReviewPanel() {
    if (selectedReview) {
      return (
        <Section title="Your review">
          <Card>
            <Text style={styles.cardTitle}>{selectedReview.rating}/5 rating</Text>
            <Text style={styles.cardMeta}>{selectedReview.reviewText ?? 'No review text'}</Text>
          </Card>
        </Section>
      );
    }

    return (
      <Section title="Review provider">
        <Field label="Rating" value={rating} onChangeText={setRating} keyboardType="number-pad" />
        <Field label="Review" value={reviewText} onChangeText={setReviewText} multiline />
        <PrimaryButton
          label="Submit review"
          variant="secondary"
          onPress={() => void submitReview()}
          disabled={busyAction === 'review'}
        />
      </Section>
    );
  }

  const isAuthScreen =
    route.screen === 'authGate' ||
    route.screen === 'loginRole' ||
    route.screen === 'customerLogin' ||
    route.screen === 'providerLogin' ||
    route.screen === 'signupRole' ||
    route.screen === 'customerRegistration' ||
    route.screen === 'providerRegistration';

  if (isAuthScreen) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        {renderAuth()}
        {busyAction ? (
          <View style={styles.busyPill}>
            <ActivityIndicator color={palette.white} />
            <Text style={styles.busyText}>{notice}</Text>
          </View>
        ) : null}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      {route.role === 'provider' || (session && appRole === 'provider')
        ? renderProvider()
        : renderCustomer()}
      {busyAction ? (
        <View style={styles.busyPill}>
          <ActivityIndicator color={palette.white} />
          <Text style={styles.busyText}>{notice}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function NavigationSheetHeader({
  level,
  setLevel,
  title,
  subtitle,
}: {
  level: NavigationSheetLevel;
  setLevel: (level: NavigationSheetLevel) => void;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.navigationSheetHeader}>
      <Pressable
        style={styles.dragHandleButton}
        onPress={() => setLevel(nextNavigationSheetLevel(level))}
        accessibilityRole="button"
        accessibilityLabel={`Show ${nextNavigationSheetLabel(level)} navigation details`}
      >
        <View style={styles.dragHandle} />
      </Pressable>
      <View style={styles.rowBetween}>
        <View style={styles.flex}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.cardMeta} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
        <View style={styles.sheetLevelControls}>
          {navigationSheetLevels.map((item) => (
            <Pressable
              key={item}
              style={[
                styles.sheetLevelButton,
                item === level && styles.sheetLevelButtonActive,
              ]}
              onPress={() => setLevel(item)}
              accessibilityRole="button"
              accessibilityLabel={`Set navigation sheet to ${navigationSheetLabel(item)}`}
            >
              <Text
                style={[
                  styles.sheetLevelButtonText,
                  item === level && styles.sheetLevelButtonTextActive,
                ]}
              >
                {navigationSheetShortLabel(item)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

function ProviderNavigationGuidanceBanner({
  guidance,
}: {
  guidance: ProviderNavigationGuidance;
}) {
  return (
    <View style={styles.providerGuidanceBanner}>
      <View style={styles.providerGuidanceIcon}>
        <Text style={styles.providerGuidanceIconText}>{guidance.maneuverSymbol}</Text>
      </View>
      <View style={styles.flex}>
        <Text style={styles.providerGuidanceDistance}>{guidance.distanceLabel}</Text>
        <Text style={styles.providerGuidanceInstruction} numberOfLines={1}>
          {guidance.instruction}
        </Text>
        {guidance.nextInstruction ? (
          <Text style={styles.providerGuidanceNext} numberOfLines={1}>
            Then {guidance.nextInstruction}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function ProviderNavigationDriveStats({
  directions,
  liveLocationLabel,
}: {
  directions: GeoDirectionsRoute | null;
  liveLocationLabel: string;
}) {
  return (
    <View style={styles.providerDriveStats}>
      <View style={styles.providerDriveStat}>
        <Text style={styles.providerDriveStatValue}>
          {directions ? formatRouteDuration(directions.durationSeconds) : '--'}
        </Text>
        <Text style={styles.providerDriveStatLabel}>ETA</Text>
      </View>
      <View style={styles.providerDriveStat}>
        <Text style={styles.providerDriveStatValue}>
          {directions ? formatRouteDistance(directions.distanceMeters) : '--'}
        </Text>
        <Text style={styles.providerDriveStatLabel}>Remaining</Text>
      </View>
      <View style={styles.providerDriveStat}>
        <Text style={styles.providerDriveStatValue} numberOfLines={1}>
          {liveLocationLabel}
        </Text>
        <Text style={styles.providerDriveStatLabel}>Live GPS</Text>
      </View>
    </View>
  );
}

function navigationSheetStyle(level: NavigationSheetLevel) {
  if (level === 'expanded') {
    return styles.navBottomSheetExpanded;
  }
  if (level === 'half') {
    return styles.navBottomSheetHalf;
  }
  return styles.navBottomSheetPeek;
}

function nextNavigationSheetLevel(level: NavigationSheetLevel): NavigationSheetLevel {
  if (level === 'peek') {
    return 'half';
  }
  if (level === 'half') {
    return 'expanded';
  }
  return 'peek';
}

function nextNavigationSheetLabel(level: NavigationSheetLevel): string {
  return navigationSheetLabel(nextNavigationSheetLevel(level));
}

function navigationSheetLabel(level: NavigationSheetLevel): string {
  if (level === 'expanded') {
    return 'expanded';
  }
  if (level === 'half') {
    return 'half';
  }
  return 'compact';
}

function navigationSheetShortLabel(level: NavigationSheetLevel): string {
  if (level === 'expanded') {
    return 'Full';
  }
  if (level === 'half') {
    return 'Half';
  }
  return 'Peek';
}

function trackingPhaseTitle(tracking: BookingTrackingSnapshot | null): string {
  switch (tracking?.phase) {
    case 'awaiting_confirmation':
      return 'Awaiting provider confirmation';
    case 'scheduled':
      return 'Provider is scheduled';
    case 'on_the_way':
      return 'Provider is on the way';
    case 'completed':
      return 'Service completed';
    case 'cancelled':
      return 'Booking cancelled';
    case 'rejected':
      return 'Booking declined';
    default:
      return 'Loading route estimate';
  }
}

function trackingRouteLabel(
  tracking: BookingTrackingSnapshot | null,
  directions?: GeoDirectionsRoute | null,
): string {
  if (directions) {
    return `${formatRouteDistance(directions.distanceMeters)} - ${formatRouteDuration(
      directions.durationSeconds,
    )}`;
  }

  if (!tracking) {
    return 'Route preview loading';
  }

  const routeParts = [
    tracking.distanceKm === null ? null : `${tracking.distanceKm.toFixed(1)} km`,
    tracking.trafficLevel ? `${tracking.trafficLevel} traffic` : null,
  ].filter(Boolean);

  return routeParts.length ? routeParts.join(' - ') : statusLabel(tracking.status);
}

function providerDirectionsLabel(
  directions: GeoDirectionsRoute | null,
  loading: boolean,
  error: string | null,
): string {
  if (loading) {
    return 'Loading route';
  }
  if (directions) {
    return `${formatRouteDistance(directions.distanceMeters)} - ${formatRouteDuration(
      directions.durationSeconds,
    )}`;
  }
  return error ?? 'Route unavailable';
}

function providerNavigationGuidance(
  directions: GeoDirectionsRoute | null,
  origin: BookingTrackingLocation | GeoRouteLocation | null,
  loading: boolean,
  error: string | null,
): ProviderNavigationGuidance {
  if (loading) {
    return {
      instruction: 'Finding the best route',
      nextInstruction: null,
      distanceLabel: '...',
      maneuverSymbol: '↑',
    };
  }

  if (!directions?.steps.length) {
    return {
      instruction: error ?? 'Directions unavailable',
      nextInstruction: null,
      distanceLabel: '--',
      maneuverSymbol: '◎',
    };
  }

  const { step, index } = activeDirectionsStep(directions, origin);
  const nextStep = directions.steps[index + 1] ?? null;
  const distanceMeters = distanceToStepManeuver(directions, step, origin);

  return {
    instruction: cleanNavigationInstruction(step.instruction),
    nextInstruction: nextStep ? cleanNavigationInstruction(nextStep.instruction) : null,
    distanceLabel: formatRouteDistance(distanceMeters),
    maneuverSymbol: navigationManeuverSymbol(step),
  };
}

function activeDirectionsStep(
  directions: GeoDirectionsRoute,
  origin: BookingTrackingLocation | GeoRouteLocation | null,
): { step: GeoDirectionsStep; index: number } {
  if (!origin || !directions.geometry.length) {
    return { step: directions.steps[0], index: 0 };
  }

  const nearestIndex = nearestGeometryIndex(directions.geometry, origin);
  const stepIndex = directions.steps.findIndex((step) => {
    const endIndex = step.wayPoints?.[1];
    return typeof endIndex === 'number' && endIndex >= nearestIndex;
  });

  const index = stepIndex >= 0 ? stepIndex : directions.steps.length - 1;
  return { step: directions.steps[index], index };
}

function distanceToStepManeuver(
  directions: GeoDirectionsRoute,
  step: GeoDirectionsStep,
  origin: BookingTrackingLocation | GeoRouteLocation | null,
): number {
  const endIndex = step.wayPoints?.[1];
  const endPoint =
    typeof endIndex === 'number' ? directions.geometry[endIndex] : null;

  if (!origin || !endPoint) {
    return step.distanceMeters;
  }

  return Math.max(0, Math.round(distanceBetweenMeters(origin, endPoint)));
}

function nearestGeometryIndex(
  geometry: GeoRouteLocation[],
  origin: BookingTrackingLocation | GeoRouteLocation,
): number {
  let nearestIndex = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;

  geometry.forEach((point, index) => {
    const distance =
      (point.latitude - origin.latitude) ** 2 +
      (point.longitude - origin.longitude) ** 2;
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  });

  return nearestIndex;
}

function distanceBetweenMeters(
  start: GeoRouteLocation,
  end: GeoRouteLocation,
): number {
  const earthRadiusMeters = 6371000;
  const startLatitude = toRadians(start.latitude);
  const endLatitude = toRadians(end.latitude);
  const latitudeDelta = toRadians(end.latitude - start.latitude);
  const longitudeDelta = toRadians(end.longitude - start.longitude);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(startLatitude) *
      Math.cos(endLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusMeters * c;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function cleanNavigationInstruction(instruction: string): string {
  return instruction.replace(/\s+/g, ' ').trim() || 'Continue on route';
}

function navigationManeuverSymbol(step: GeoDirectionsStep): string {
  const instruction = step.instruction.toLowerCase();
  if (instruction.includes('left')) {
    return '↰';
  }
  if (instruction.includes('right')) {
    return '↱';
  }
  if (instruction.includes('roundabout')) {
    return '⟳';
  }
  if (instruction.includes('u-turn') || instruction.includes('uturn')) {
    return '⤴';
  }
  if (instruction.includes('arrive') || instruction.includes('destination')) {
    return '◎';
  }
  return '↑';
}

function providerLiveLocationStatusLabel({
  error,
  isPublishing,
  location,
}: {
  error: string | null;
  isPublishing: boolean;
  location: BookingTrackingLocation | null;
}): string {
  if (error) {
    return 'Needs permission';
  }
  if (isPublishing) {
    return 'Updating';
  }
  if (!location) {
    return 'Starting';
  }
  if (
    typeof location.accuracyMeters === 'number' &&
    location.accuracyMeters > 50
  ) {
    return 'Improving GPS';
  }
  return 'Sharing';
}

function formatRouteDistance(distanceMeters: number): string {
  if (distanceMeters >= 1000) {
    return `${(distanceMeters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(distanceMeters)} m`;
}

function formatRouteDuration(durationSeconds: number): string {
  const minutes = Math.max(1, Math.round(durationSeconds / 60));
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`;
}

function serviceStartedAt(
  booking: BookingSummary,
  events: BookingTimelineEventSummary[],
): Date | null {
  const startEvent = events.find((event) => {
    return (
      event.eventType === 'status_changed' &&
      (event.label ?? '').toLowerCase().includes('in_progress') &&
      event.createdAt
    );
  });
  const value = startEvent?.createdAt ?? booking.scheduledAt;
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function formatElapsedTime(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');
}

function languageLabel(language: string): string {
  return language === 'fil' ? 'Filipino' : 'English';
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: palette.white,
    flex: 1,
  },
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
  busyPill: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: palette.mint,
    borderRadius: radius.pill,
    bottom: 112,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    position: 'absolute',
  },
  busyText: {
    color: palette.white,
    fontSize: 12,
    fontWeight: '800',
  },
});
