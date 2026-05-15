import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import {
  Bell,
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
  MapPin,
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
  Upload,
  User,
} from 'lucide-react-native';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
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
  buildProviderBookingSlots,
  completedBookingCount,
  formatDateTime,
  formatMoney,
  nextActionLabel,
  nextBookingStatuses,
  providerPayoutTotal,
  roleLabel,
  statusLabel,
  toManilaBookingIso,
} from './src/domain/booking';
import {
  bookingTimeSlots,
  customerCancelReasons,
  customerHelpCategories,
  customerHelpFaqs,
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
import { AuthScreens } from './src/screens/AuthScreens';
import { CustomerMoreScreen } from './src/screens/CustomerMoreScreen';
import { ProviderBookingsScreen } from './src/screens/ProviderBookingsScreen';
import { AppRole, AppScreen, RouteState } from './src/navigation/types';
import { palette, radius, spacing, type } from './src/theme/serveaseDesign';
import {
  AvailabilityWindowInput,
  BookingStatus,
  BookingSummary,
  BookingServiceUpdateSummary,
  BookingTimelineEventSummary,
  CatalogCategory,
  CatalogServiceItem,
  ConversationMessage,
  ConversationSummary,
  CurrentUserProfile,
  CreateBookingRequest,
  DayOfWeek,
  NotificationSummary,
  PaymentSummary,
  ProviderAvailabilitySchedule,
  ProviderListing,
  ProviderPortfolioMediaSummary,
  ReviewSummary,
  SupportTicketSummary,
  UploadKind,
  UploadSummary,
  addProviderPortfolioMedia,
  addProviderDayOff,
  createBooking,
  createBookingAttachment,
  createBookingServiceUpdate,
  createConversationMessage,
  createPayment,
  createReview,
  createSupportTicket,
  getCurrentUser,
  getPublicProviderAvailability,
  getProviderAvailability,
  listCatalogCategories,
  listCatalogServices,
  listConversations,
  listConversationMessages,
  listCustomerBookings,
  listNotifications,
  listPayments,
  listProviderBookings,
  listProviderListings,
  listProviderPortfolioMedia,
  listProviderReviews,
  listBookingServiceUpdates,
  listBookingTimelineEvents,
  listSupportTickets,
  markNotificationRead,
  openConversation,
  registerAccount,
  removeProviderDayOff,
  replaceProviderAvailabilityWindows,
  transitionBookingStatus,
  updateCurrentUserProfile,
  uploadMedia,
} from './services/serveaseApi';
import { AuthSession, signInWithPassword } from './services/supabaseAuth';

export default function App() {
  const [route, setRoute] = useState<RouteState>({ role: null, screen: 'authGate' });
  const [apiBaseUrl, setApiBaseUrl] = useState(
    process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:5001',
  );
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
  const [session, setSession] = useState<AuthSession | null>(null);
  const [profile, setProfile] = useState<CurrentUserProfile | null>(null);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [services, setServices] = useState<CatalogServiceItem[]>([]);
  const [providers, setProviders] = useState<ProviderListing[]>([]);
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [payments, setPayments] = useState<PaymentSummary[]>([]);
  const [reviews, setReviews] = useState<ReviewSummary[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicketSummary[]>([]);
  const [notifications, setNotifications] = useState<NotificationSummary[]>([]);
  const [selectedBookingServiceUpdates, setSelectedBookingServiceUpdates] = useState<
    BookingServiceUpdateSummary[]
  >([]);
  const [selectedBookingTimelineEvents, setSelectedBookingTimelineEvents] = useState<
    BookingTimelineEventSummary[]
  >([]);
  const [selectedProviderPortfolioMedia, setSelectedProviderPortfolioMedia] = useState<
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
  const [messageDraft, setMessageDraft] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState('5');
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
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
  const [providerPhotoCaption, setProviderPhotoCaption] = useState('');
  const [providerBeforePhotoUri, setProviderBeforePhotoUri] = useState<string | null>(null);
  const [providerBeforePhotoUrl, setProviderBeforePhotoUrl] = useState<string | null>(null);
  const [providerProgressPhotoUri, setProviderProgressPhotoUri] = useState<string | null>(null);
  const [providerProgressPhotoUrl, setProviderProgressPhotoUrl] = useState<string | null>(null);
  const [providerCompletionPhotoUri, setProviderCompletionPhotoUri] = useState<string | null>(null);
  const [providerCompletionPhotoUrl, setProviderCompletionPhotoUrl] = useState<string | null>(null);
  const [providerPortfolioPhotoUri, setProviderPortfolioPhotoUri] = useState<string | null>(null);
  const [providerPortfolioPhotoUrl, setProviderPortfolioPhotoUrl] = useState<string | null>(null);
  const [providerProgressMessage, setProviderProgressMessage] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
  const [providerCancelReason, setProviderCancelReason] = useState('');
  const [providerReportReason, setProviderReportReason] = useState('');
  const [providerReportDetails, setProviderReportDetails] = useState('');
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [notice, setNotice] = useState('Welcome to ServEase.');

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
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;
  const role = profile?.user.role ?? 'customer';
  const appRole: AppRole = role === 'provider' ? 'provider' : 'customer';
  const activeCount = activeBookingCount(bookings.map((booking) => booking.status));
  const completedCount = completedBookingCount(bookings.map((booking) => booking.status));
  const payoutTotal = providerPayoutTotal(payments);
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

  useEffect(() => {
    void loadCatalog();
  }, []);

  useEffect(() => {
    setProfileFullName(profile?.user.fullName ?? '');
    setProfileContactNumber(profile?.user.contactNumber ?? '');
    setProfileAddress(profile?.customerProfile?.address ?? '');
    setProfileBusinessName(profile?.providerProfile?.businessName ?? '');
  }, [profile]);

  async function loadCatalog() {
    setBusyAction('catalog');
    try {
      const nextCategories = await listCatalogCategories({ baseUrl: apiBaseUrl });
      const firstCategoryId = nextCategories[0]?.id ?? null;
      setCategories(nextCategories);
      setSelectedCategoryId(firstCategoryId);
      await loadServices(firstCategoryId);
      setNotice('Marketplace loaded.');
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
      await refreshWorkspace(nextSession.accessToken, nextRole);
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
      await refreshWorkspace(nextSession.accessToken, nextRole);
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  function signOut() {
    setSession(null);
    setProfile(null);
    setBookings([]);
    setConversations([]);
    setMessages([]);
    setPayments([]);
    setSupportTickets([]);
    setNotifications([]);
    setSelectedBookingServiceUpdates([]);
    setSelectedBookingTimelineEvents([]);
    setAvailability(null);
    setSelectedBookingId(null);
    setSelectedConversationId(null);
    setRoute({ role: null, screen: 'authGate' });
    setNotice('Signed out.');
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

  async function refreshWorkspace(token = session?.accessToken, nextRole = appRole) {
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
        nextTickets,
        nextNotifications,
        nextAvailability,
      ] = await Promise.all([
        nextRole === 'provider'
          ? listProviderBookings(options)
          : listCustomerBookings(options),
        listConversations(options),
        listPayments(options),
        listSupportTickets(options),
        listNotifications(options),
        nextRole === 'provider'
          ? getProviderAvailability(options).catch(() => null)
          : Promise.resolve(null),
      ]);

      setBookings(nextBookings);
      setConversations(nextConversations);
      setPayments(nextPayments);
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
        paymentMethod: 'cash_on_service',
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

  async function transitionSelectedBooking(nextStatus: BookingStatus) {
    if (!selectedBooking) {
      setNotice('Select a booking first.');
      return false;
    }

    setBusyAction(`booking-${nextStatus}`);
    try {
      const updated = await transitionBookingStatus(
        selectedBooking.id,
        {
          currentStatus: selectedBooking.status,
          nextStatus,
        },
        apiOptions,
      );
      replaceBooking(updated);
      void refreshBookingTimelineEvents(updated.id);
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
    const cancelled = await transitionSelectedBooking('cancelled');
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
    const opened = await submitSupportTicket(
      providerReportReason || 'Provider booking issue',
      [
        `Booking: ${selectedBooking.bookingReference}`,
        providerReportDetails.trim(),
      ]
        .filter(Boolean)
        .join('\n\n'),
      reportEvidenceUpload ? [mediaAttachmentFromUpload(reportEvidenceUpload)] : [],
    );
    if (opened) {
      setProviderReportReason('');
      setProviderReportDetails('');
      setReportEvidencePhotoUri(null);
      setReportEvidencePhotoUrl(null);
      setReportEvidenceUpload(null);
      setRoute({ role: 'provider', screen: 'providerBookingDetail' });
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

  async function sendMessage() {
    const trimmed = messageDraft.trim();
    if (!trimmed) {
      setNotice('Write a message before sending.');
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
        trimmed,
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

  async function collectPayment() {
    if (!selectedBooking) {
      setNotice('Select a booking first.');
      return false;
    }

    setBusyAction('payment');
    try {
      const payment = await createPayment(
        {
          bookingId: selectedBooking.id,
          paymentMethod: 'cash_on_service',
        },
        apiOptions,
      );
      setPayments((current) => [
        payment,
        ...current.filter((item) => item.id !== payment.id),
      ]);
      setNotice(`Payment ${payment.status} for ${formatMoney(payment.amount)}.`);
      return true;
    } catch (error) {
      setNotice(readError(error));
      return false;
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
    setRoute({ role: nextRole, screen });
  }

  function openBooking(booking: BookingSummary, screen: AppScreen) {
    setSelectedBookingId(booking.id);
    void refreshBookingServiceUpdates(booking.id);
    void refreshBookingTimelineEvents(booking.id);
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
        {route.screen === 'customerCategory' ? renderCustomerCategory() : null}
        {route.screen === 'customerAllServices' ? renderCustomerAllServices('All Services') : null}
        {route.screen === 'customerRecommendedServices' ? renderCustomerAllServices('Recommended Services') : null}
        {route.screen === 'customerTopProviders' ? renderCustomerTopProviders() : null}
        {route.screen === 'customerProviderProfile' ? renderCustomerProviderProfile() : null}
        {route.screen === 'customerBookingForm' ? renderCustomerBookingForm() : null}
        {route.screen === 'customerSearchResults' ? renderCustomerAllServices('Search Results') : null}
        {route.screen === 'customerProfile' ? renderCustomerProfile() : null}
        {route.screen === 'customerSettings' ? renderCustomerSettings() : null}
        {route.screen === 'customerHelp' ? renderCustomerHelp() : null}
        {route.screen === 'customerServiceHistory' ? renderCustomerServiceHistory() : null}
        {route.screen === 'customerNotifications' ? renderCustomerNotifications() : null}
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
              onPress={() => navigate('more', 'customer')}
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
            action={<Text style={styles.linkText} onPress={() => navigate('customerServiceHistory', 'customer')}>Recent</Text>}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalRail}
            >
              {bookings
                .filter((booking) => booking.status === 'completed')
                .slice(0, 5)
                .map((booking) => (
                  <Pressable
                    key={booking.id}
                    style={styles.bookAgainCard}
                    onPress={() => openBooking(booking, 'customerBookingDetail')}
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
                        {formatDateTime(booking.scheduledAt)}
                      </Text>
                    </View>
                    <ChevronRight color={palette.faint} size={18} />
                  </Pressable>
                ))}
              {!bookings.some((booking) => booking.status === 'completed') ? (
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

          <Section title="Book a service">
            <Card>
              <Text style={styles.cardTitle}>
                {selectedProvider?.title ?? 'Choose a service provider'}
              </Text>
              <Text style={styles.cardMeta}>
                {selectedProvider?.providerBusinessName ?? 'Select a provider above'}
              </Text>
              <Field label="Service address" value={address} onChangeText={setAddress} />
              <Field
                label="Scheduled time"
                value={scheduledAt}
                onChangeText={setScheduledAt}
              />
              <Field
                label="Duration"
                value={hoursRequired}
                onChangeText={setHoursRequired}
                keyboardType="number-pad"
              />
              <Field label="Notes" value={notes} onChangeText={setNotes} multiline />
              <PrimaryButton
                label={selectedProvider ? 'Review Booking' : 'Choose Provider'}
                onPress={() =>
                  selectedProvider
                    ? navigate('customerBookingReview', 'customer')
                    : navigate('customerTopProviders', 'customer')
                }
              />
            </Card>
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
        <TopBar title="Review booking" onBack={() => navigate('customerBookingForm', 'customer')} />
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
                  <Text style={styles.linkText}>View Profile &gt;</Text>
                </View>
              </View>
            </Card>

            <Section title="Service details">
              <InfoRow label="Type" value={selectedService?.name ?? selectedProvider.title} />
              <InfoRow label="Date and time" value={formatDateTime(scheduledAtIso)} />
              <InfoRow label="Duration" value={`${duration} hour${duration === 1 ? '' : 's'}`} />
              <InfoRow label="Address" value={address || 'Address required'} />
              <InfoRow label="Reference photo" value={bookingReferencePhotoUrl ? 'Attached' : 'None'} />
            </Section>

            <Section title="Selected options">
              <InfoRow label="Number of service providers" value="1 service provider" />
              <InfoRow label="Hours" value={`${duration}`} />
              <InfoRow label="Add-ons" value={notes.trim() || 'None'} />
            </Section>

            <Section title="Price breakdown">
              <InfoRow label="Sub Total" value={formatMoney(subtotal)} />
              <InfoRow label="Processing fee" value={formatMoney(processingFee)} />
              <InfoRow label="Promo code" value="No promo applied" />
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
              <View style={styles.ratingRow}>
                <Star color="#FFC107" fill="#FFC107" size={14} />
                <Text style={styles.cardTitle}>{review.rating.toFixed(1)}</Text>
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
    return (
      <>
        <TopBar title="Book Service" onBack={() => navigate('customerProviderProfile', 'customer')} />
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
                    {selectedProvider.averageRating.toFixed(1)} rating
                  </Text>
                </View>
              </View>
            </Card>
            <Section title="Service Type">
              <Card selected>
                <Text style={styles.cardTitle}>{selectedProvider.title}</Text>
                <Text style={styles.cardMeta}>{formatMoney(selectedProvider.price)}</Text>
              </Card>
            </Section>
            <Section title="Service Location">
              <View style={styles.twoButtons}>
                <PrimaryButton label="Mobile Service" onPress={() => undefined} />
                <PrimaryButton
                  label="In-Location"
                  variant="secondary"
                  onPress={() => setNotice('In-location booking needs provider location support before enabling.')}
                />
              </View>
            </Section>
            <Field
              label="Preferred Date"
              value={dateOnly}
              onChangeText={(value) => setScheduledAt(`${value}T${timeOnly || '09:00'}`)}
            />
            <Section title="Preferred Time">
              <View style={styles.wrap}>
                {(providerBookingSlots.length ? providerBookingSlots : bookingTimeSlots.map((time) => ({
                  label: time,
                  value: `${dateOnly || defaultScheduledAt.slice(0, 10)}T${time}`,
                }))).map((slot) => (
                  <Pill
                    key={slot.value}
                    label={slot.label}
                    selected={scheduledAt === slot.value}
                    onPress={() => setScheduledAt(slot.value)}
                  />
                ))}
              </View>
              {!providerBookingSlots.length ? (
                <Text style={styles.noticeText}>
                  Availability is loading or unavailable. Choose a time inside the provider's posted schedule.
                </Text>
              ) : null}
            </Section>
            <Field label="Service Address" value={address} onChangeText={setAddress} multiline />
            <Field
              label="Duration"
              value={hoursRequired}
              onChangeText={setHoursRequired}
              keyboardType="number-pad"
            />
            <Field
              label="Service Description"
              value={notes}
              onChangeText={setNotes}
              placeholder="Describe what you need..."
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
                <Upload color={palette.mint} size={30} />
              )}
              <Text style={styles.cardMeta}>Upload reference photos</Text>
              <Text style={styles.linkText}>
                {bookingReferencePhotoUrl ? 'Reference photo uploaded' : 'Attach photo'}
              </Text>
            </Pressable>
            <Card>
              <InfoRow label="Base price" value={formatMoney(selectedProvider.price)} />
              <InfoRow label="Callout fee" value={formatMoney(0)} />
              <InfoRow label="Estimated total" value={formatMoney(selectedProvider.price)} />
            </Card>
          </View>
        </ScrollView>
        <View style={styles.stickyFooter}>
          <PrimaryButton
            label="Review Booking"
            onPress={() => navigate('customerBookingReview', 'customer')}
            disabled={!address.trim() || !scheduledAt.trim()}
          />
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
                Pay nothing for this service today. Your payment method is reserved and charged after completion.
              </Text>
            </View>
            <Section title="Saved payment methods">
              <View style={styles.paymentMethodSelected}>
                <View style={styles.radioOuterSelected}>
                  <View style={styles.radioInner} />
                </View>
                <CreditCard color={palette.mint} size={22} />
                <View style={styles.flex}>
                  <Text style={styles.cardTitle}>Cash on service</Text>
                  <Text style={styles.cardMeta}>Current backend-supported payment method</Text>
                </View>
              </View>
              <PrimaryButton
                label="ADD NEW CARD"
                variant="secondary"
                onPress={() => setNotice('Card storage needs payment provider integration before enabling.')}
              />
            </Section>
            <Card>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.cardTitle}>Credit or Debit Card</Text>
                  <Text style={styles.cardMeta}>Not connected yet</Text>
                </View>
                <ChevronRight color={palette.faint} size={20} />
              </View>
            </Card>
            <Card>
              <Text style={styles.cardTitle}>Promo code</Text>
              <Text style={styles.cardMeta}>Promo validation is not connected to the backend yet.</Text>
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
                  <Text style={styles.linkText}>View Profile &gt;</Text>
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
                onPress={() => setNotice('Calendar export needs native calendar permissions before enabling.')}
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
                label="In Progress"
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
              <Text style={styles.cardTitle}>Service provider</Text>
              <Text style={styles.cardBody}>
                {selectedProvider?.providerBusinessName ?? 'GreenFix Home Services'}
              </Text>
              <Text style={styles.linkText}>View Profile &gt;</Text>
            </Card>
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
            <PrimaryButton
              label={selectedPayment ? 'Payment reserved' : 'Reserve payment'}
              variant="secondary"
              onPress={() => navigate('customerReservePayment', 'customer')}
              disabled={Boolean(selectedPayment)}
            />
            {selectedBooking.status === 'completed' ? renderReviewPanel() : null}
          </View>
        </ScrollView>
      </>
    );
  }

  function renderManageBooking() {
    return (
      <>
        <TopBar title="Manage Booking" onBack={() => navigate('customerBookingDetail', 'customer')} />
        <ScrollView contentContainerStyle={styles.withBottomNav}>
          <View style={styles.content}>
            <Text style={styles.manageCopy}>Manage support and cancellation options for this booking.</Text>
            <View style={styles.optionList}>
              <Pressable
                style={styles.optionRow}
                onPress={() => navigate('customerBookingCancel', 'customer')}
              >
                <Text style={styles.optionLabel}>Cancel Booking</Text>
                <ChevronRight color={palette.faint} size={20} />
              </Pressable>
              <Pressable
                style={styles.optionRow}
                onPress={() => navigate('customerBookingReport', 'customer')}
              >
                <Text style={styles.optionLabel}>Report an issue</Text>
                <ChevronRight color={palette.faint} size={20} />
              </Pressable>
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
            <Text style={styles.sorryTitle}>I'M SORRY</Text>
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
                Pending or confirmed bookings can be cancelled. Backend cancellation fees are not enabled yet.
              </Text>
            </View>
            <View style={styles.keepBox}>
              <Text style={styles.cardTitle}>Need a different time?</Text>
              <Text style={styles.cardMeta}>Rescheduling will be enabled after the backend endpoint is available.</Text>
            </View>
            <View style={styles.twoButtons}>
              <PrimaryButton
                label="Don't Cancel"
                variant="secondary"
                onPress={() => navigate('customerBookingDetail', 'customer')}
              />
              <PrimaryButton
                label="Cancel Booking"
                variant="danger"
                onPress={async () => {
                  await transitionSelectedBooking('cancelled');
                  navigate('bookings', 'customer');
                }}
                disabled={
                  !cancelReason ||
                  !selectedBooking ||
                  !nextBookingStatuses(selectedBooking.status, appRole).includes('cancelled')
                }
              />
            </View>
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
              label="Submit"
              onPress={() => void submitSupportTicket(
                supportSubject,
                [supportMessage, `Desired resolution: ${desiredResolution}`]
                  .filter(Boolean)
                  .join('\n\n'),
              )}
              disabled={!supportSubject.trim() || !supportMessage.trim() || !desiredResolution || busyAction === 'support'}
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
              {conversations.map((conversation) => (
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
                  <Text style={styles.cardTitle}>Booking conversation</Text>
                  <Text style={styles.cardMeta}>
                    Booking {conversation.bookingId?.slice(0, 8) ?? 'unlinked'} ·{' '}
                    {conversation.lastMessageAt
                      ? formatDateTime(conversation.lastMessageAt)
                      : 'No messages yet'}
                  </Text>
                </Card>
              ))}
              {!conversations.length ? (
                <EmptyState title="No conversations" body="Open messages from a booking." />
              ) : null}
            </Section>
            <Section title="Thread">
              <Card>
                {messages.slice(-8).map((message) => (
                  <View
                    key={message.id}
                    style={[
                      styles.messageBubble,
                      message.senderRole === appRole && styles.messageBubbleMine,
                    ]}
                  >
                    <Text style={styles.cardMeta}>{message.senderRole}</Text>
                    <Text style={styles.cardBody}>{message.content}</Text>
                  </View>
                ))}
                {!messages.length ? <Text style={styles.cardMeta}>No messages loaded.</Text> : null}
              </Card>
              <Field label="Message" value={messageDraft} onChangeText={setMessageDraft} multiline />
              <PrimaryButton
                label="Send"
                onPress={() => void sendMessage()}
                disabled={!session || busyAction === 'send-message'}
              />
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
        <CustomerMoreScreen profile={profile} navigate={navigate} signOut={signOut} />
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
              <View style={styles.profileAvatarLarge}>
                <Text style={styles.profileAvatarLargeText}>
                  {(profile?.user.fullName ?? profile?.user.email ?? 'C').slice(0, 1).toUpperCase()}
                </Text>
                <View style={styles.cameraBadge}>
                  <Camera color={palette.white} size={15} />
                </View>
              </View>
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
                onToggle={() => setPushNotificationsEnabled((value) => !value)}
              />
            </SettingsSection>
            <SettingsSection title="Account">
              <SettingsRow
                icon={Lock}
                label="Change Password"
                onPress={() => setNotice('Password changes need an auth update flow before enabling.')}
              />
              <SettingsRow
                icon={Globe}
                label="Language"
                value="English"
                onPress={() => setNotice('Language selection is visual-only for now.')}
              />
            </SettingsSection>
            <SettingsSection title="Appearance">
              <SettingsRow
                icon={Moon}
                label="Dark Mode"
                toggleValue={darkModeEnabled}
                onToggle={() => setDarkModeEnabled((value) => !value)}
              />
            </SettingsSection>
          </View>
        </ScrollView>
      </>
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
                  label={category === 'all' ? 'All' : category.replace(' & ', ' ')}
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
        <TopBar title="Service History" onBack={() => navigate('more', 'customer')} />
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

  function renderCustomerNotifications() {
    return (
      <>
        <TopBar
          title="Notifications"
          onBack={() => navigate('more', 'customer')}
          right={unreadCount > 0 ? <Badge label={`${unreadCount} new`} tone="success" /> : null}
        />
        <ScrollView contentContainerStyle={styles.withBottomNav}>
          <View style={styles.content}>
            {notifications.map((notification) => (
              <Pressable
                key={notification.id}
                style={[
                  styles.notificationCard,
                  !notification.isRead && styles.notificationCardUnread,
                ]}
                onPress={() => !notification.isRead && void markRead(notification.id)}
              >
                <View style={styles.notificationIcon}>
                  {notification.type.includes('payment') ? (
                    <CreditCard color={palette.white} size={20} />
                  ) : notification.type.includes('booking') ? (
                    <Calendar color={palette.white} size={20} />
                  ) : notification.type.includes('promo') ? (
                    <Gift color={palette.white} size={20} />
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
            {!notifications.length ? (
              <EmptyState title="No notifications yet" body="We'll notify you when something arrives." />
            ) : null}
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

  function renderProviderHome() {
    const pendingCount = bookings.filter((booking) => booking.status === 'pending').length;
    return (
      <ScrollView contentContainerStyle={styles.withBottomNav}>
        <View style={styles.providerHero}>
          <Text style={styles.heroMuted}>Welcome back,</Text>
          <Text style={styles.heroName}>
            {profile?.providerProfile?.businessName ?? 'Service Provider'}
          </Text>
        </View>
        <View style={styles.overlapContent}>
          <MetricCard label="Total Earnings" value={formatMoney(payoutTotal)} featured />
          <View style={styles.metricGrid}>
            <MetricCard label="New Requests" value={pendingCount} />
            <MetricCard label="Today" value={activeCount} />
            <MetricCard label="Rating" value={profile?.providerProfile?.averageRating.toFixed(1) ?? '0.0'} />
          </View>
        </View>
        <View style={styles.content}>
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
          <Section
            title="Active Bookings"
            action={<Text style={styles.linkText} onPress={() => navigate('bookings', 'provider')}>View All</Text>}
          >
            {bookings.slice(0, 4).map((booking) => (
              <ProviderBookingRow
                key={booking.id}
                booking={booking}
                onPress={() => openBooking(booking, 'providerBookingDetail')}
              />
            ))}
          </Section>
          <Section title="Quick Actions">
            <View style={styles.twoButtons}>
              <QuickAction label="Set Availability" onPress={() => navigate('calendar', 'provider')} />
              <QuickAction label="View Earnings" onPress={() => navigate('more', 'provider')} />
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
                >
                  <Phone color={palette.mint} size={18} strokeWidth={2.5} />
                </Pressable>
                <Pressable
                  style={styles.circleButton}
                  onPress={() => void openSelectedConversation()}
                  accessibilityRole="button"
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
                <Text style={styles.cardTitle}>{event.label ?? 'Booking update'}</Text>
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
              onPress={() => navigate('providerNavigationMode', 'provider')}
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
    return (
      <View style={styles.navigationScreen}>
        <View style={styles.mapCanvas}>
          <Pressable
            style={styles.mapCloseButton}
            onPress={() => navigate('providerBookingDetail', 'provider')}
            accessibilityRole="button"
          >
            <Text style={styles.mapCloseText}>Close</Text>
          </Pressable>
          <Card>
            <View style={styles.providerSummaryRow}>
              <View style={styles.quickIcon}>
                <Navigation color={palette.mint} size={20} strokeWidth={2.6} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>Head to the service location</Text>
                <Text style={styles.cardMeta}>ETA 18 min - 5.2 km - moderate traffic</Text>
              </View>
            </View>
          </Card>
          <View style={styles.mapRouteLine} />
          <View style={styles.mapPin}>
            <MapPin color={palette.white} size={24} strokeWidth={2.8} />
          </View>
        </View>
        <View style={styles.navBottomSheet}>
          <View style={styles.dragHandle} />
          <Text style={styles.cardTitle}>Destination</Text>
          <Text style={styles.cardBody}>
            {selectedBooking.serviceAddress ?? 'Address unavailable'}
          </Text>
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
          <PrimaryButton
            label="End Navigation"
            variant="danger"
            onPress={() => navigate('providerBookingDetail', 'provider')}
          />
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
              <Text style={styles.timerText}>00:42:18</Text>
              <Text style={styles.cardMeta}>Live timer mock until time tracking is added.</Text>
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
    return (
      <>
        <TopBar title="Availability" subtitle="Set weekly windows and days off" />
        <ScrollView contentContainerStyle={styles.withBottomNav}>
          <View style={styles.content}>
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
                {dayOrder.map((day) => (
                  <Pill
                    key={day}
                    label={dayLabels[day].slice(0, 3)}
                    selected={day === windowDay}
                    onPress={() => setWindowDay(day)}
                  />
                ))}
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

  function renderProviderMore() {
    return (
      <>
        <TopBar title="More" subtitle="Earnings, profile, support, and settings" />
        <ScrollView contentContainerStyle={styles.withBottomNav}>
          <View style={styles.content}>
            <MetricCard label="Available Payout" value={formatMoney(payoutTotal)} featured />
            <Section title="Payments">
              {payments.map((payment) => (
                <Card key={payment.id}>
                  <View style={styles.rowBetween}>
                    <View>
                      <Text style={styles.cardTitle}>{formatMoney(payment.providerPayout)}</Text>
                      <Text style={styles.cardMeta}>
                        Fee {formatMoney(payment.platformFee)} · Booking {payment.bookingId.slice(0, 8)}
                      </Text>
                    </View>
                    <Badge label={payment.status} tone={payment.status === 'paid' ? 'success' : 'warning'} />
                  </View>
                </Card>
              ))}
            </Section>
            {renderProfileCard()}
            {renderSupportPanel()}
            <PrimaryButton label="Sign out" variant="secondary" onPress={signOut} />
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
                onPress={() => void pickAndUploadImage('provider_portfolio', async (uri, uploaded) => {
                  const media = await addProviderPortfolioMedia(
                    mediaAttachmentFromUpload(uploaded),
                    apiOptions,
                  );
                  setProviderPortfolioPhotoUri(uri);
                  setProviderPortfolioPhotoUrl(uploaded.publicUrl);
                  setSelectedProviderPortfolioMedia((current) => [
                    media,
                    ...current.filter((item) => item.id !== media.id),
                  ]);
                })}
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
        {supportTickets.slice(0, 3).map((ticket) => (
          <Card key={ticket.id}>
            <View style={styles.rowBetween}>
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>{ticket.subject}</Text>
                <Text style={styles.cardMeta}>{ticket.message ?? ticket.category ?? 'Support ticket'}</Text>
                {ticket.attachments?.length ? (
                  <Text style={styles.noticeText}>
                    {ticket.attachments.length} evidence file{ticket.attachments.length === 1 ? '' : 's'} attached
                  </Text>
                ) : null}
              </View>
              <Badge label={ticket.status.replace('_', ' ')} tone={ticket.status === 'resolved' ? 'success' : 'warning'} />
            </View>
          </Card>
        ))}
      </Section>
    );
  }

  function renderNotificationsPanel() {
    return (
      <Section title="Notifications">
        {notifications.slice(0, 5).map((notification) => (
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
        {!notifications.length ? (
          <EmptyState title="No notifications" body="Updates will appear here." />
        ) : null}
      </Section>
    );
  }

  function renderReviewPanel() {
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
        {reviews.slice(0, 2).map((review) => (
          <Card key={review.id}>
            <Text style={styles.cardTitle}>{review.rating}/5 rating</Text>
            <Text style={styles.cardMeta}>{review.reviewText ?? 'No review text'}</Text>
          </Card>
        ))}
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
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
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
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
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
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
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
    height: 42,
    justifyContent: 'center',
    position: 'relative',
    width: 42,
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
    shadowColor: '#2C5A3C',
    shadowOpacity: 0.12,
    shadowRadius: 16,
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
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 16,
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
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
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
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
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
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
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
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
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
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
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
    height: 120,
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
    height: 42,
    justifyContent: 'center',
    width: 42,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingVertical: spacing.base,
  },
  optionLabel: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: '600',
  },
  pageCopy: {
    ...type.body,
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
  },
  mapCanvas: {
    backgroundColor: '#DDEFE4',
    flex: 1,
    gap: spacing.base,
    padding: spacing.xl,
    position: 'relative',
  },
  mapCloseButton: {
    alignSelf: 'flex-end',
    backgroundColor: palette.white,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  mapCloseText: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  mapRouteLine: {
    alignSelf: 'center',
    backgroundColor: palette.mint,
    borderRadius: radius.pill,
    height: 210,
    marginTop: spacing.lg,
    opacity: 0.85,
    transform: [{ rotate: '24deg' }],
    width: 8,
  },
  mapPin: {
    alignItems: 'center',
    backgroundColor: palette.mint,
    borderRadius: radius.pill,
    bottom: 148,
    height: 54,
    justifyContent: 'center',
    position: 'absolute',
    right: 88,
    width: 54,
  },
  navBottomSheet: {
    backgroundColor: palette.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    gap: spacing.md,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 18,
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
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
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
  bannerTitle: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '900',
  },
  bannerCopy: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    fontWeight: '700',
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
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
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
