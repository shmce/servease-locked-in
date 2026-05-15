import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, radius, spacing, typography } from './constants/designTokens';
import {
  ActionButton,
  ChoiceButton,
  EmptyState,
  Field,
  Metric,
  Page,
  Section,
  StatusChip,
  TabBar,
} from './src/components/ui';
import {
  activeBookingCount,
  bookingStatusChip,
  completedBookingCount,
  formatDateTime,
  formatMoney,
  nextActionLabel,
  nextBookingStatuses,
  providerPayoutTotal,
  roleLabel,
  statusActionLabel,
  statusLabel,
} from './src/domain/booking';
import {
  AvailabilityWindowInput,
  BookingStatus,
  BookingSummary,
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
  ReviewSummary,
  SupportTicketSummary,
  addProviderDayOff,
  createBooking,
  createConversationMessage,
  createPayment,
  createReview,
  createSupportTicket,
  getCurrentUser,
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
  listProviderReviews,
  listSupportTickets,
  markNotificationRead,
  openConversation,
  removeProviderDayOff,
  replaceProviderAvailabilityWindows,
  transitionBookingStatus,
} from './services/serveaseApi';
import { AuthSession, signInWithPassword } from './services/supabaseAuth';

type AppTab =
  | 'search'
  | 'bookings'
  | 'jobs'
  | 'calendar'
  | 'messages'
  | 'earnings'
  | 'profile';

const defaultScheduledAt = new Date(Date.now() + 2 * 86400000)
  .toISOString()
  .slice(0, 16);

const dayLabels: Record<DayOfWeek, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const dayOrder = Object.keys(dayLabels) as DayOfWeek[];

export default function App() {
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
  const [availability, setAvailability] =
    useState<ProviderAvailabilitySchedule | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<AppTab>('search');
  const [address, setAddress] = useState('123 Smoke Test St');
  const [scheduledAt, setScheduledAt] = useState(defaultScheduledAt);
  const [hoursRequired, setHoursRequired] = useState('1');
  const [notes, setNotes] = useState('');
  const [messageDraft, setMessageDraft] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState('5');
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [windowDay, setWindowDay] = useState<DayOfWeek>('monday');
  const [windowStart, setWindowStart] = useState('09:00');
  const [windowEnd, setWindowEnd] = useState('17:00');
  const [dayOffDate, setDayOffDate] = useState('');
  const [dayOffReason, setDayOffReason] = useState('');
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [notice, setNotice] = useState('Load catalog or sign in to start.');

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
  const activeCount = activeBookingCount(bookings.map((booking) => booking.status));
  const completedCount = completedBookingCount(bookings.map((booking) => booking.status));
  const payoutTotal = providerPayoutTotal(payments);
  const activeTabs = buildTabs(Boolean(session), role, unreadCount);

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
    if (!activeTabs.some((tab) => tab.key === activeTab)) {
      setActiveTab(activeTabs[0]?.key ?? 'search');
    }
  }, [activeTab, activeTabs]);

  async function loadCatalog() {
    setIsLoadingCatalog(true);
    setNotice('Loading marketplace catalog...');
    try {
      const nextCategories = await listCatalogCategories({ baseUrl: apiBaseUrl });
      const firstCategoryId = nextCategories[0]?.id ?? null;
      setCategories(nextCategories);
      setSelectedCategoryId(firstCategoryId);
      await loadServices(firstCategoryId);
      setNotice('Marketplace catalog loaded.');
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setIsLoadingCatalog(false);
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
    }
  }

  async function refreshProviderReviews(providerId: string) {
    try {
      setReviews(await listProviderReviews(providerId, { baseUrl: apiBaseUrl }));
    } catch {
      setReviews([]);
    }
  }

  async function signIn() {
    if (!email.trim() || !password) {
      setNotice('Enter an email and password before signing in.');
      return;
    }

    setBusyAction('sign-in');
    setNotice('Signing in...');
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
      setSession(nextSession);
      setProfile(nextProfile);
      setPassword('');
      setActiveTab(nextProfile.user.role === 'provider' ? 'jobs' : 'search');
      setNotice(`Signed in as ${nextProfile.user.email}.`);
      await refreshWorkspace(nextSession.accessToken, nextProfile.user.role);
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
    setAvailability(null);
    setSelectedBookingId(null);
    setSelectedConversationId(null);
    setActiveTab('search');
    setNotice('Signed out.');
  }

  async function refreshWorkspace(token = session?.accessToken, nextRole = role) {
    if (!token) {
      setNotice('Sign in before refreshing your workspace.');
      return;
    }

    setBusyAction('refresh');
    setNotice('Refreshing workspace...');
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
      setNotice(
        nextBookings.length
          ? `${nextBookings.length} booking${nextBookings.length === 1 ? '' : 's'} loaded.`
          : 'No bookings yet.',
      );
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function submitBooking() {
    if (!session) {
      setNotice('Sign in before creating a booking.');
      return;
    }

    if (!selectedProvider || !address.trim() || !scheduledAt.trim()) {
      setNotice('Choose a provider, address, and schedule before booking.');
      return;
    }

    setBusyAction('create-booking');
    setNotice('Creating booking...');
    try {
      const request: CreateBookingRequest = {
        providerId: selectedProvider.providerId,
        serviceId: selectedService?.id ?? selectedProvider.serviceId,
        serviceTitle: selectedProvider.title,
        serviceName: selectedService?.name ?? selectedProvider.title,
        serviceDescription: selectedProvider.description,
        serviceAddress: address.trim(),
        scheduledAt: new Date(scheduledAt).toISOString(),
        hoursRequired: Number(hoursRequired) || 1,
        serviceAmount: selectedProvider.price ?? selectedService?.price ?? 0,
        pricingMode: selectedProvider.pricingMode,
        paymentMethod: 'cash_on_service',
        customerNotes: notes.trim() || null,
      };
      const booking = await createBooking(request, apiOptions);
      setBookings((current) => [booking, ...current]);
      setSelectedBookingId(booking.id);
      setActiveTab('bookings');
      setNotice(`Booking ${booking.bookingReference} created.`);
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function transitionSelectedBooking(nextStatus: BookingStatus) {
    if (!selectedBooking) {
      setNotice('Select a booking before changing status.');
      return;
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
      setNotice(`Booking moved to ${statusLabel(updated.status)}.`);
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function openSelectedConversation() {
    if (!selectedBooking) {
      setNotice('Select a booking before opening messages.');
      return null;
    }

    setBusyAction('open-conversation');
    try {
      const conversation = await openConversation(selectedBooking.id, apiOptions);
      upsertConversation(conversation);
      setSelectedConversationId(conversation.id);
      const nextMessages = await listConversationMessages(conversation.id, apiOptions);
      setMessages(nextMessages);
      setActiveTab('messages');
      setNotice('Conversation opened.');
      return conversation;
    } catch (error) {
      setNotice(readError(error));
      return null;
    } finally {
      setBusyAction(null);
    }
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
      setNotice('Select a booking before creating payment.');
      return;
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
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function submitReview() {
    if (!selectedBooking) {
      setNotice('Select a booking before reviewing.');
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

  async function submitSupportTicket() {
    if (!supportSubject.trim()) {
      setNotice('Enter a support subject before submitting.');
      return;
    }

    setBusyAction('support');
    try {
      const ticket = await createSupportTicket(
        {
          subject: supportSubject.trim(),
          message: supportMessage.trim() || null,
          category: 'booking',
        },
        apiOptions,
      );
      setSupportTickets((current) => [ticket, ...current]);
      setSupportSubject('');
      setSupportMessage('');
      setNotice('Support ticket opened.');
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

  async function saveAvailabilityWindow() {
    if (!session) {
      setNotice('Sign in as a provider before saving availability.');
      return;
    }

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
      const nextAvailability = await replaceProviderAvailabilityWindows(
        windows,
        apiOptions,
      );
      setAvailability(nextAvailability);
      setNotice('Availability window saved.');
    } catch (error) {
      setNotice(readError(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function addDayOff() {
    if (!dayOffDate.trim()) {
      setNotice('Enter a day-off date before saving.');
      return;
    }

    setBusyAction('day-off');
    try {
      const nextAvailability = await addProviderDayOff(
        {
          offDate: dayOffDate.trim(),
          reason: dayOffReason.trim() || null,
        },
        apiOptions,
      );
      setAvailability(nextAvailability);
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
      const nextAvailability = await removeProviderDayOff(offDate, apiOptions);
      setAvailability(nextAvailability);
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

  function upsertConversation(conversation: ConversationSummary) {
    setConversations((current) => [
      conversation,
      ...current.filter((item) => item.id !== conversation.id),
    ]);
  }

  function renderMarketplace() {
    return (
      <>
        <Section
          title="Marketplace"
          action={
            <ActionButton
              label="Reload"
              onPress={loadCatalog}
              disabled={isLoadingCatalog}
              variant="secondary"
            />
          }
        >
          <TextInput
            style={styles.searchInput}
            placeholder="Search services, providers, and categories"
            placeholderTextColor={colors.muted}
            value={selectedService?.name ?? ''}
            editable={false}
          />
          <View style={styles.wrapRow}>
            {categories.map((category) => (
              <ChoiceButton
                key={category.id}
                label={category.name}
                selected={category.id === selectedCategoryId}
                onPress={async () => {
                  setSelectedCategoryId(category.id);
                  setNotice(`Loading ${category.name} services...`);
                  try {
                    await loadServices(category.id);
                    setNotice(`${category.name} services loaded.`);
                  } catch (error) {
                    setNotice(readError(error));
                  }
                }}
              />
            ))}
          </View>

          <View style={styles.cardList}>
            {services.map((service) => (
              <Pressable
                key={service.id}
                style={[
                  styles.card,
                  service.id === selectedServiceId && styles.selectedCard,
                ]}
                onPress={async () => {
                  setSelectedServiceId(service.id);
                  setNotice(`Loading providers for ${service.name}...`);
                  try {
                    await loadProviders(service.id);
                    setNotice(`${service.name} providers loaded.`);
                  } catch (error) {
                    setNotice(readError(error));
                  }
                }}
                accessibilityRole="button"
              >
                <View style={styles.cardHeader}>
                  <View style={styles.flex}>
                    <Text style={styles.cardTitle}>{service.name}</Text>
                    <Text style={styles.mutedText}>{service.pricingMode}</Text>
                  </View>
                  <Text style={styles.metaStrong}>{formatMoney(service.price)}</Text>
                </View>
                <Text style={styles.bodyText} numberOfLines={2}>
                  {service.description ?? 'Bookable local service.'}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.cardList}>
            {providers.map((provider) => (
              <Pressable
                key={provider.id}
                style={[
                  styles.card,
                  provider.providerId === selectedProviderId && styles.selectedCard,
                ]}
                onPress={async () => {
                  setSelectedProviderId(provider.providerId);
                  setSelectedServiceId(provider.serviceId);
                  await refreshProviderReviews(provider.providerId);
                }}
                accessibilityRole="button"
              >
                <View style={styles.cardHeader}>
                  <View style={styles.flex}>
                    <Text style={styles.cardTitle}>{provider.title}</Text>
                    <Text style={styles.mutedText}>
                      {provider.providerBusinessName ?? 'Provider'}
                    </Text>
                  </View>
                  <StatusChip
                    label={provider.verificationStatus}
                    tone={
                      provider.verificationStatus === 'approved'
                        ? 'success'
                        : 'warning'
                    }
                  />
                </View>
                <Text style={styles.bodyText} numberOfLines={2}>
                  {provider.description ?? 'Service details available at booking.'}
                </Text>
                <View style={styles.cardMetaRow}>
                  <Text style={styles.metaStrong}>
                    {formatMoney(provider.price)} · {provider.pricingMode}
                  </Text>
                  <Text style={styles.mutedText}>
                    {provider.averageRating.toFixed(1)} rating ·{' '}
                    {provider.reviewCount} reviews
                  </Text>
                </View>
              </Pressable>
            ))}
            {!providers.length ? (
              <EmptyState text="No providers found." action="Reload or choose another category" />
            ) : null}
          </View>
        </Section>

        {role !== 'provider' ? renderBookingRequest() : null}
      </>
    );
  }

  function renderBookingRequest() {
    return (
      <Section title="Booking Request">
        <View style={styles.summaryBand}>
          <View style={styles.flex}>
            <Text style={styles.cardTitle}>
              {selectedProvider?.title ?? 'Choose a service provider'}
            </Text>
            <Text style={styles.mutedText}>
              {selectedProvider?.providerBusinessName ?? 'Provider details appear here'}
            </Text>
          </View>
          <Text style={styles.metaStrong}>
            {formatMoney(selectedProvider?.price ?? selectedService?.price ?? null)}
          </Text>
        </View>
        <Field label="Service address" value={address} onChangeText={setAddress} />
        <View style={styles.inlineFields}>
          <Field
            label="Scheduled time"
            value={scheduledAt}
            onChangeText={setScheduledAt}
            autoCapitalize="none"
          />
          <Field
            label="Hours"
            value={hoursRequired}
            onChangeText={setHoursRequired}
            keyboardType="number-pad"
          />
        </View>
        <Field label="Notes" value={notes} onChangeText={setNotes} multiline />
        <ActionButton
          label="Create booking"
          onPress={submitBooking}
          disabled={busyAction === 'create-booking' || !session}
          variant="primary"
        />
      </Section>
    );
  }

  function renderBookings(title = role === 'provider' ? 'Provider Jobs' : 'My Bookings') {
    return (
      <>
        <Section
          title={title}
          action={
            <ActionButton
              label="Refresh"
              onPress={() => void refreshWorkspace()}
              disabled={!session || busyAction === 'refresh'}
              variant="secondary"
            />
          }
        >
          <View style={styles.dashboardGrid}>
            <Metric label="Active" value={activeCount} />
            <Metric label="Completed" value={completedCount} />
            <Metric label="Unread" value={unreadCount} />
          </View>
          <View style={styles.cardList}>
            {bookings.map((booking) => (
              <Pressable
                key={booking.id}
                style={[
                  styles.card,
                  booking.id === selectedBookingId && styles.selectedCard,
                ]}
                onPress={() => setSelectedBookingId(booking.id)}
                accessibilityRole="button"
              >
                <View style={styles.cardHeader}>
                  <View style={styles.flex}>
                    <Text style={styles.cardTitle}>
                      {booking.serviceTitle ?? 'Service booking'}
                    </Text>
                    <Text style={styles.mutedText}>
                      {booking.bookingReference} · {formatDateTime(booking.scheduledAt)}
                    </Text>
                  </View>
                  <StatusChip {...bookingStatusChip(booking.status)} />
                </View>
                <Text style={styles.bodyText}>
                  {booking.serviceAddress ?? 'Address unavailable'}
                </Text>
                <View style={styles.cardMetaRow}>
                  <Text style={styles.metaStrong}>
                    {formatMoney(booking.totalAmount)}
                  </Text>
                  <Text style={styles.mutedText}>
                    Next: {nextActionLabel(booking.status, role)}
                  </Text>
                </View>
              </Pressable>
            ))}
            {!bookings.length ? (
              <EmptyState
                text={session ? 'No bookings yet.' : 'Sign in to load bookings.'}
                action={session ? 'Create one from Search' : 'Use Profile to sign in'}
              />
            ) : null}
          </View>
        </Section>
        {renderSelectedBooking()}
      </>
    );
  }

  function renderSelectedBooking() {
    return (
      <Section title="Booking Detail">
        {selectedBooking ? (
          <>
            <View style={styles.detailPanel}>
              <View style={styles.cardHeader}>
                <View style={styles.flex}>
                  <Text style={styles.detailTitle}>
                    {selectedBooking.serviceTitle ?? selectedBooking.bookingReference}
                  </Text>
                  <Text style={styles.mutedText}>
                    {statusLabel(selectedBooking.status)} ·{' '}
                    {formatMoney(selectedBooking.totalAmount)}
                  </Text>
                </View>
                <StatusChip {...bookingStatusChip(selectedBooking.status)} />
              </View>
              <Text style={styles.bodyText}>
                {formatDateTime(selectedBooking.scheduledAt)}
              </Text>
              <Text style={styles.bodyText}>
                {selectedBooking.serviceAddress ?? 'Address unavailable'}
              </Text>
            </View>
            <View style={styles.actions}>
              {nextBookingStatuses(selectedBooking.status, role).map((status) => (
                <ActionButton
                  key={status}
                  label={statusActionLabel(status)}
                  onPress={() => void transitionSelectedBooking(status)}
                  disabled={busyAction === `booking-${status}`}
                  variant={
                    status === 'cancelled' || status === 'rejected'
                      ? 'danger'
                      : 'secondary'
                  }
                />
              ))}
              <ActionButton
                label="Open messages"
                onPress={() => void openSelectedConversation()}
                disabled={!session}
                variant="secondary"
              />
              <ActionButton
                label="Create payment"
                onPress={collectPayment}
                disabled={!session || Boolean(selectedPayment)}
                variant="secondary"
              />
            </View>
          </>
        ) : (
          <EmptyState text="No booking selected." action="Select a booking above" />
        )}
      </Section>
    );
  }

  function renderCalendar() {
    return (
      <Section
        title="Provider Calendar"
        action={
          <ActionButton
            label="Refresh"
            onPress={() => void refreshWorkspace()}
            disabled={!session || busyAction === 'refresh'}
            variant="secondary"
          />
        }
      >
        <View style={styles.cardList}>
          {dayOrder.map((day) => {
            const window = availability?.windows.find((item) => item.dayOfWeek === day);
            return (
              <View key={day} style={styles.rowCard}>
                <View style={styles.flex}>
                  <Text style={styles.cardTitle}>{dayLabels[day]}</Text>
                  <Text style={styles.mutedText}>
                    {window?.isActive
                      ? `${window.startTime} to ${window.endTime}`
                      : 'Unavailable'}
                  </Text>
                </View>
                <StatusChip
                  label={window?.isActive ? 'available' : 'closed'}
                  tone={window?.isActive ? 'success' : 'neutral'}
                />
              </View>
            );
          })}
        </View>
        <View style={styles.wrapRow}>
          {dayOrder.map((day) => (
            <ChoiceButton
              key={day}
              label={dayLabels[day].slice(0, 3)}
              selected={day === windowDay}
              onPress={() => setWindowDay(day)}
            />
          ))}
        </View>
        <View style={styles.inlineFields}>
          <Field label="Start" value={windowStart} onChangeText={setWindowStart} />
          <Field label="End" value={windowEnd} onChangeText={setWindowEnd} />
        </View>
        <ActionButton
          label="Save weekly window"
          onPress={saveAvailabilityWindow}
          disabled={!session || busyAction === 'availability-window'}
          variant="primary"
        />
        <View style={styles.inlineFields}>
          <Field
            label="Day off date"
            value={dayOffDate}
            onChangeText={setDayOffDate}
            autoCapitalize="none"
          />
          <Field
            label="Reason"
            value={dayOffReason}
            onChangeText={setDayOffReason}
          />
        </View>
        <ActionButton
          label="Add day off"
          onPress={addDayOff}
          disabled={!session || busyAction === 'day-off'}
          variant="secondary"
        />
        <View style={styles.cardList}>
          {availability?.daysOff.map((dayOff) => (
            <View key={dayOff.id} style={styles.rowCard}>
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>{dayOff.offDate}</Text>
                <Text style={styles.mutedText}>{dayOff.reason ?? 'Day off'}</Text>
              </View>
              <ActionButton
                label="Remove"
                onPress={() => void deleteDayOff(dayOff.offDate)}
                disabled={busyAction === `day-off-${dayOff.offDate}`}
                variant="secondary"
              />
            </View>
          ))}
          {!availability?.daysOff.length ? (
            <EmptyState text="No days off scheduled." action="Add one above" />
          ) : null}
        </View>
      </Section>
    );
  }

  function renderMessages() {
    return (
      <Section title="Messages">
        <View style={styles.cardList}>
          {conversations.map((conversation) => (
            <Pressable
              key={conversation.id}
              style={[
                styles.rowCard,
                conversation.id === selectedConversationId && styles.selectedCard,
              ]}
              onPress={async () => {
                setSelectedConversationId(conversation.id);
                try {
                  setMessages(await listConversationMessages(conversation.id, apiOptions));
                } catch (error) {
                  setNotice(readError(error));
                }
              }}
              accessibilityRole="button"
            >
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>Conversation</Text>
                <Text style={styles.mutedText}>
                  Booking {conversation.bookingId?.slice(0, 8) ?? 'unlinked'} ·{' '}
                  {conversation.lastMessageAt
                    ? formatDateTime(conversation.lastMessageAt)
                    : 'No messages yet'}
                </Text>
              </View>
            </Pressable>
          ))}
          {!conversations.length ? (
            <EmptyState text="No conversations yet." action="Open messages on a booking" />
          ) : null}
        </View>
        <View style={styles.messagePanel}>
          {messages.slice(-6).map((message) => (
            <View key={message.id} style={styles.messageBubble}>
              <Text style={styles.mutedText}>{message.senderRole}</Text>
              <Text style={styles.bodyText}>{message.content}</Text>
            </View>
          ))}
          {!messages.length ? <Text style={styles.mutedText}>No messages loaded.</Text> : null}
        </View>
        <Field label="Message" value={messageDraft} onChangeText={setMessageDraft} multiline />
        <ActionButton
          label="Send message"
          onPress={sendMessage}
          disabled={!session || busyAction === 'send-message'}
          variant="primary"
        />
      </Section>
    );
  }

  function renderEarnings() {
    return (
      <Section title="Earnings">
        <View style={styles.dashboardGrid}>
          <Metric label="Payout" value={formatMoney(payoutTotal)} />
          <Metric label="Payments" value={payments.length} />
          <Metric label="Completed" value={completedCount} />
        </View>
        <View style={styles.cardList}>
          {payments.map((payment) => (
            <View key={payment.id} style={styles.rowCard}>
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>{formatMoney(payment.providerPayout)}</Text>
                <Text style={styles.mutedText}>
                  Booking {payment.bookingId.slice(0, 8)} · Fee{' '}
                  {formatMoney(payment.platformFee)}
                </Text>
              </View>
              <StatusChip
                label={payment.status}
                tone={payment.status === 'paid' ? 'success' : 'warning'}
              />
            </View>
          ))}
          {!payments.length ? (
            <EmptyState text="No payment records yet." action="Payments appear after jobs" />
          ) : null}
        </View>
      </Section>
    );
  }

  function renderProfile() {
    return (
      <>
        <Section
          title="Account"
          action={
            session ? (
              <ActionButton label="Sign out" onPress={signOut} variant="secondary" />
            ) : null
          }
        >
          {!session ? (
            <>
              <View style={styles.inlineFields}>
                <Field
                  label="API URL"
                  value={apiBaseUrl}
                  onChangeText={setApiBaseUrl}
                  autoCapitalize="none"
                />
                <Field
                  label="Supabase URL"
                  value={supabaseUrl}
                  onChangeText={setSupabaseUrl}
                  autoCapitalize="none"
                />
              </View>
              <Field
                label="Publishable key"
                value={publishableKey}
                onChangeText={setPublishableKey}
                autoCapitalize="none"
              />
              <Field
                label="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <Field
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <ActionButton
                label="Sign in"
                onPress={signIn}
                disabled={busyAction === 'sign-in'}
                variant="primary"
              />
            </>
          ) : (
            <View style={styles.detailPanel}>
              <Text style={styles.detailTitle}>
                {profile?.user.fullName ?? profile?.user.email}
              </Text>
              <Text style={styles.mutedText}>
                {roleLabel(role)} · {profile?.user.status}
              </Text>
              <Text style={styles.bodyText}>
                {profile?.customerProfile?.address ??
                  profile?.providerProfile?.businessName ??
                  'Profile ready'}
              </Text>
              {profile?.providerProfile ? (
                <Text style={styles.mutedText}>
                  {profile.providerProfile.averageRating.toFixed(1)} rating ·{' '}
                  {profile.providerProfile.reviewCount} reviews ·{' '}
                  {profile.providerProfile.verificationStatus}
                </Text>
              ) : null}
            </View>
          )}
        </Section>

        <Section title="Support">
          <Field
            label="Support subject"
            value={supportSubject}
            onChangeText={setSupportSubject}
          />
          <Field
            label="Support message"
            value={supportMessage}
            onChangeText={setSupportMessage}
            multiline
          />
          <ActionButton
            label="Open support ticket"
            onPress={submitSupportTicket}
            disabled={!session || busyAction === 'support'}
            variant="secondary"
          />
          <View style={styles.cardList}>
            {supportTickets.slice(0, 3).map((ticket) => (
              <View key={ticket.id} style={styles.rowCard}>
                <View style={styles.flex}>
                  <Text style={styles.cardTitle}>{ticket.subject}</Text>
                  <Text style={styles.mutedText}>
                    {ticket.message ?? ticket.category ?? 'Support ticket'}
                  </Text>
                </View>
                <StatusChip
                  label={ticket.status.replace('_', ' ')}
                  tone={ticket.status === 'resolved' ? 'success' : 'warning'}
                />
              </View>
            ))}
          </View>
        </Section>

        <Section title="Notifications">
          <View style={styles.cardList}>
            {notifications.slice(0, 6).map((notification) => (
              <View key={notification.id} style={styles.rowCard}>
                <View style={styles.flex}>
                  <Text style={styles.cardTitle}>
                    {notification.title ?? notification.type}
                  </Text>
                  <Text style={styles.mutedText}>{notification.body}</Text>
                </View>
                {!notification.isRead ? (
                  <ActionButton
                    label="Read"
                    onPress={() => void markRead(notification.id)}
                    variant="secondary"
                  />
                ) : (
                  <StatusChip label="read" tone="neutral" />
                )}
              </View>
            ))}
            {!notifications.length ? (
              <EmptyState text="No notifications loaded." action="Refresh workspace" />
            ) : null}
          </View>
        </Section>
      </>
    );
  }

  function renderPaymentsAndReviews() {
    return (
      <Section title="Payments And Reviews">
        <View style={styles.cardList}>
          {payments.map((payment) => (
            <View key={payment.id} style={styles.rowCard}>
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>{formatMoney(payment.amount)}</Text>
                <Text style={styles.mutedText}>
                  Payout {formatMoney(payment.providerPayout)} · Fee{' '}
                  {formatMoney(payment.platformFee)}
                </Text>
              </View>
              <StatusChip
                label={payment.status}
                tone={payment.status === 'paid' ? 'success' : 'warning'}
              />
            </View>
          ))}
          {!payments.length ? <EmptyState text="No payments yet." action="Create payment" /> : null}
        </View>
        <View style={styles.inlineFields}>
          <Field
            label="Rating"
            value={rating}
            onChangeText={setRating}
            keyboardType="number-pad"
          />
          <Field label="Review" value={reviewText} onChangeText={setReviewText} multiline />
        </View>
        <ActionButton
          label="Submit review"
          onPress={submitReview}
          disabled={!session || selectedBooking?.status !== 'completed'}
          variant="secondary"
        />
        {reviews.slice(0, 2).map((review) => (
          <View key={review.id} style={styles.rowCard}>
            <Text style={styles.cardTitle}>{review.rating}/5 rating</Text>
            <Text style={styles.mutedText}>{review.reviewText ?? 'No review text'}</Text>
          </View>
        ))}
      </Section>
    );
  }

  function renderActiveTab() {
    if (activeTab === 'search') {
      return (
        <Page
          title="Find trusted help"
          subtitle="Browse verified providers, compare prices, and create a booking without leaving this page."
        >
          {renderMarketplace()}
        </Page>
      );
    }

    if (activeTab === 'bookings') {
      return (
        <Page
          title="Bookings"
          subtitle="Track active work, payments, messages, and completed service history."
        >
          {renderBookings('My Bookings')}
          {renderPaymentsAndReviews()}
        </Page>
      );
    }

    if (activeTab === 'jobs') {
      return (
        <Page
          title="Provider jobs"
          subtitle="Review requests, start confirmed work, and complete active jobs."
        >
          {renderBookings('Provider Jobs')}
        </Page>
      );
    }

    if (activeTab === 'calendar') {
      return (
        <Page
          title="Availability"
          subtitle="Set weekly service windows and block off dates before customers book."
        >
          {renderCalendar()}
        </Page>
      );
    }

    if (activeTab === 'messages') {
      return (
        <Page
          title="Messages"
          subtitle="Keep customer and provider coordination attached to each booking."
        >
          {renderMessages()}
        </Page>
      );
    }

    if (activeTab === 'earnings') {
      return (
        <Page
          title="Earnings"
          subtitle="Review payment status, provider payout, and completed job totals."
        >
          {renderEarnings()}
        </Page>
      );
    }

    return (
      <Page
        title={session ? 'Profile' : 'Account'}
        subtitle={
          session
            ? 'Manage account context, support requests, and notifications.'
            : 'Sign in with the seeded customer or provider account to test live data.'
        }
      >
        {renderProfile()}
      </Page>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.topChrome}>
        <View style={styles.header}>
          <View style={styles.logoMark}>
            <Image source={require('./assets/icon.png')} style={styles.logo} />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.kicker}>ServEase</Text>
            <Text style={styles.title}>
              {session ? `${roleLabel(role)} workspace` : 'Service marketplace'}
            </Text>
            <Text style={styles.subtitle} numberOfLines={2}>
              {session
                ? profile?.user.fullName ?? profile?.user.email
                : 'Browse, book, message, and manage trusted local service work.'}
            </Text>
          </View>
        </View>

        <View style={styles.dashboardGrid}>
          <Metric label="Active" value={activeCount} />
          <Metric label="Unread" value={unreadCount} />
          <Metric
            label={role === 'provider' ? 'Payout' : 'Payments'}
            value={role === 'provider' ? formatMoney(payoutTotal) : payments.length}
          />
        </View>

        <View style={styles.noticeRow} accessibilityLiveRegion="polite">
          <Text style={styles.noticeText}>{notice}</Text>
          {busyAction ? <ActivityIndicator color={colors.brand} /> : null}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {renderActiveTab()}
      </ScrollView>

      <TabBar tabs={activeTabs} activeTab={activeTab} onChange={setActiveTab} />
    </SafeAreaView>
  );
}

function buildTabs(isSignedIn: boolean, role: string, unreadCount: number) {
  if (!isSignedIn) {
    return [
      { key: 'search' as const, label: 'Search' },
      { key: 'profile' as const, label: 'Account' },
    ];
  }

  if (role === 'provider') {
    return [
      { key: 'jobs' as const, label: 'Jobs' },
      { key: 'calendar' as const, label: 'Calendar' },
      { key: 'messages' as const, label: 'Messages', badge: unreadCount },
      { key: 'earnings' as const, label: 'Earnings' },
      { key: 'profile' as const, label: 'Profile' },
    ];
  }

  return [
    { key: 'search' as const, label: 'Search' },
    { key: 'bookings' as const, label: 'Bookings' },
    { key: 'messages' as const, label: 'Messages', badge: unreadCount },
    { key: 'profile' as const, label: 'Profile' },
  ];
}

function readError(error: unknown): string {
  return error instanceof Error ? error.message : 'Unexpected mobile error.';
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  topChrome: {
    backgroundColor: colors.canvas,
    borderBottomColor: colors.borderSoft,
    borderBottomWidth: 1,
    gap: spacing.md,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    paddingBottom: spacing.base,
  },
  content: {
    backgroundColor: colors.surface,
    flexGrow: 1,
    gap: spacing.lg,
    padding: spacing.base,
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  logoMark: {
    alignItems: 'center',
    backgroundColor: colors.night,
    borderRadius: radius.md,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  logo: {
    borderRadius: radius.xs,
    height: 32,
    width: 32,
  },
  headerCopy: {
    flex: 1,
  },
  kicker: {
    ...typography.caption,
    color: colors.brand,
    fontWeight: '500',
  },
  title: {
    ...typography.title,
    color: colors.ink,
  },
  subtitle: {
    ...typography.body,
    color: colors.muted,
  },
  dashboardGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  noticeRow: {
    alignItems: 'center',
    backgroundColor: colors.brandSoft,
    borderColor: colors.borderSoft,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  noticeText: {
    ...typography.body,
    color: colors.ink,
    flex: 1,
  },
  searchInput: {
    ...typography.body,
    backgroundColor: colors.card,
    borderColor: colors.borderSoft,
    borderRadius: radius.sm,
    borderWidth: 1,
    color: colors.body,
    minHeight: 46,
    paddingHorizontal: spacing.base,
  },
  inlineFields: {
    gap: spacing.md,
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cardList: {
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.borderSoft,
    borderRadius: radius.sm,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.base,
  },
  rowCard: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.borderSoft,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 68,
    padding: spacing.base,
  },
  selectedCard: {
    borderColor: colors.brand,
    borderWidth: 1,
    shadowColor: colors.brand,
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  cardTitle: {
    ...typography.body,
    color: colors.ink,
    fontWeight: '500',
  },
  detailTitle: {
    ...typography.title,
    color: colors.ink,
  },
  bodyText: {
    ...typography.body,
    color: colors.body,
  },
  mutedText: {
    ...typography.caption,
    color: colors.muted,
  },
  metaStrong: {
    ...typography.action,
    color: colors.ink,
  },
  cardMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  detailPanel: {
    backgroundColor: colors.card,
    borderColor: colors.borderSoft,
    borderRadius: radius.sm,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  summaryBand: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.borderSoft,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  messagePanel: {
    backgroundColor: colors.card,
    borderColor: colors.borderSoft,
    borderRadius: radius.sm,
    borderWidth: 1,
    gap: spacing.sm,
    minHeight: 112,
    padding: spacing.md,
  },
  messageBubble: {
    backgroundColor: colors.canvas,
    borderColor: colors.borderSoft,
    borderRadius: radius.sm,
    borderWidth: 1,
    padding: spacing.sm,
  },
  flex: {
    flex: 1,
  },
});
