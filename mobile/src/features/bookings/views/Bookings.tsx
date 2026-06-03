import {
  Bell,
  Calendar,
  CalendarCheck,
  ChevronRight,
  Droplets,
  HandHeart,
  SprayCan,
  Sprout,
  UserRound,
  Wrench,
  Zap,
} from 'lucide-react-native';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AppRole } from '../../../navigation/types';
import { BookingSummary } from '../../../shared/models/types';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import {
  BookingCardRow,
  BookingFilter,
  useBookingsViewModel,
} from '../viewModels/useBookingsViewModel';

type BookingsScreenProps = {
  bookings: BookingSummary[];
  bookingFilter: BookingFilter;
  role: AppRole;
  busyAction: string | null;
  isLoading?: boolean;
  unreadNotificationCount: number;
  setBookingFilter: (filter: BookingFilter) => void;
  refreshWorkspace: () => Promise<void>;
  openBooking: (booking: BookingSummary) => void;
  onOpenNotifications: () => void;
};

const statusToneStyles = {
  danger: {
    badge: 'statusBadgeDanger',
    text: 'statusTextDanger',
  },
  neutral: {
    badge: 'statusBadgeNeutral',
    text: 'statusTextNeutral',
  },
  success: {
    badge: 'statusBadgeSuccess',
    text: 'statusTextSuccess',
  },
  warning: {
    badge: 'statusBadgeWarning',
    text: 'statusTextWarning',
  },
} as const;

export function BookingsScreen({
  bookings,
  bookingFilter,
  busyAction,
  isLoading = false,
  unreadNotificationCount,
  setBookingFilter,
  refreshWorkspace,
  openBooking,
  onOpenNotifications,
}: BookingsScreenProps) {
  const bookingsList = useBookingsViewModel({
    bookings,
    bookingFilter,
  });
  const { data } = bookingsList;
  const showSkeletons = isLoading && bookings.length === 0;
  const isRefreshing = busyAction === 'refresh';

  function handleRefresh() {
    void refreshWorkspace();
  }

  function handleHelperPress() {
    if (data.helperTargetBooking) {
      openBooking(data.helperTargetBooking);
    }
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            tintColor={palette.mintDeep}
            onRefresh={handleRefresh}
          />
        }
      >
        <View style={styles.content}>
          <View style={styles.headerBlock}>
            <View style={styles.header}>
              <View style={styles.headerText}>
                <Text style={styles.title}>Bookings</Text>
              </View>
              <Pressable
                style={styles.notificationButton}
                accessibilityRole="button"
                accessibilityLabel={
                  unreadNotificationCount > 0
                    ? `Notifications, ${unreadNotificationCount} unread`
                    : 'Notifications'
                }
                onPress={onOpenNotifications}
              >
                <Bell color="#626A73" size={24} strokeWidth={2.2} />
                {unreadNotificationCount > 0 ? <View style={styles.notificationDot} /> : null}
              </Pressable>
            </View>
            <Text style={styles.subtitle} numberOfLines={1}>
              Track your upcoming and past services
            </Text>
          </View>

          <View style={styles.tabRow}>
            {data.tabs.map((tab) => {
              const selected = tab.filter === bookingFilter;
              return (
                <Pressable
                  key={tab.key}
                  style={styles.tabButton}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => setBookingFilter(tab.filter)}
                >
                  <Text style={[styles.tabLabel, selected && styles.tabLabelSelected]}>
                    {tab.label}
                  </Text>
                  {selected ? <View style={styles.tabIndicator} /> : null}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.list}>
            {showSkeletons
              ? Array.from({ length: 3 }).map((_, index) => (
                  <BookingCardSkeleton key={`booking-skeleton-${index}`} />
                ))
              : data.cardRows.map((row) => (
                  <ReferenceBookingCard
                    key={row.id}
                    row={row}
                    onPress={() => openBooking(row.booking)}
                  />
                ))}

            {!showSkeletons && data.isEmpty ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>{data.emptyState.title}</Text>
                <Text style={styles.emptyBody}>{data.emptyState.body}</Text>
              </View>
            ) : null}

            {data.selectedTab === 'upcoming' ? (
              <RescheduleCard
                disabled={!data.helperTargetBooking}
                onPress={handleHelperPress}
              />
            ) : null}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function ReferenceBookingCard({
  row,
  onPress,
}: {
  row: BookingCardRow;
  onPress: () => void;
}) {
  const tone = statusToneStyles[row.statusBadge.tone];

  return (
    <Pressable
      style={styles.bookingCard}
      accessibilityRole="button"
      accessibilityLabel={`Open ${row.title} booking`}
      onPress={onPress}
    >
      <View style={styles.bookingTopRow}>
        <View style={styles.serviceIconBlock}>
          <ServiceIcon iconKey={row.iconKey} />
        </View>

        <View style={styles.bookingMain}>
          <View style={styles.titleRow}>
            <Text style={styles.bookingTitle} numberOfLines={2}>
              {row.title}
            </Text>
            <View style={[styles.statusBadge, styles[tone.badge]]}>
              <Text style={[styles.statusText, styles[tone.text]]} numberOfLines={1}>
                {row.statusBadge.label}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Calendar color="#7C8490" size={14} strokeWidth={2.1} />
            <Text style={styles.metaText} numberOfLines={1}>
              {row.dateLabel}
            </Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText} numberOfLines={1}>
              {row.timeLabel}
            </Text>
          </View>

          <View style={styles.servicePill}>
            <Text style={styles.servicePillText}>{row.serviceKindLabel}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.providerRow}>
        <View style={styles.providerIconBlock}>
          <UserRound color={palette.mintDark} size={18} strokeWidth={2.2} />
        </View>
        <View style={styles.providerCopy}>
          <Text style={styles.providerEyebrow}>Service Provider</Text>
          <Text style={styles.providerName} numberOfLines={1}>
            {row.providerLabel}
          </Text>
        </View>
        <ChevronRight color={palette.mintDark} size={24} strokeWidth={2.2} />
      </View>
    </Pressable>
  );
}

function ServiceIcon({ iconKey }: { iconKey: BookingCardRow['iconKey'] }) {
  const iconProps = {
    color: palette.mintDark,
    size: 26,
    strokeWidth: 2.2,
  };

  switch (iconKey) {
    case 'electrical':
      return <Zap {...iconProps} />;
    case 'garden':
      return <Sprout {...iconProps} />;
    case 'home-care':
      return <HandHeart {...iconProps} />;
    case 'plumbing':
      return <Droplets {...iconProps} />;
    case 'repair':
      return <Wrench {...iconProps} />;
    case 'cleaning':
    default:
      return <SprayCan {...iconProps} />;
  }
}

function RescheduleCard({
  disabled,
  onPress,
}: {
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.rescheduleCard, disabled && styles.rescheduleCardDisabled]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={disabled ? undefined : onPress}
    >
      <View style={styles.rescheduleIconBlock}>
        <CalendarCheck color={palette.mintDark} size={26} strokeWidth={2.2} />
      </View>
      <View style={styles.rescheduleCopy}>
        <Text style={styles.rescheduleTitle}>Need to reschedule?</Text>
        <Text style={styles.rescheduleBody}>
          You can reschedule or cancel your booking up to 24 hours before the service.
        </Text>
      </View>
      <ChevronRight color={palette.mintDark} size={24} strokeWidth={2.2} />
    </Pressable>
  );
}

function BookingCardSkeleton() {
  return (
    <View style={styles.bookingCard}>
      <View style={styles.bookingTopRow}>
        <View style={styles.skeletonIcon} />
        <View style={styles.skeletonMain}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonMeta} />
          <View style={styles.skeletonPill} />
        </View>
      </View>
      <View style={styles.cardDivider} />
      <View style={styles.providerRow}>
        <View style={styles.skeletonProviderIcon} />
        <View style={styles.skeletonProviderCopy}>
          <View style={styles.skeletonProviderLabel} />
          <View style={styles.skeletonProviderName} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: palette.white,
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 126,
  },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: 20,
  },
  headerBlock: {
    gap: spacing.sm,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 58,
  },
  headerText: {
    flex: 1,
    paddingRight: spacing.base,
  },
  title: {
    color: '#202733',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 34,
  },
  subtitle: {
    color: '#68717E',
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 21,
  },
  notificationButton: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: '#EEF0F2',
    borderRadius: radius.md,
    borderWidth: 1,
    height: 56,
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
    width: 56,
  },
  notificationDot: {
    backgroundColor: '#FF6A5E',
    borderColor: palette.white,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 12,
    position: 'absolute',
    right: 9,
    top: 8,
    width: 12,
  },
  tabRow: {
    borderBottomColor: '#ECEFF2',
    borderBottomWidth: 1,
    flexDirection: 'row',
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  tabButton: {
    alignItems: 'center',
    flex: 1,
    minHeight: 52,
    justifyContent: 'center',
    position: 'relative',
  },
  tabLabel: {
    color: '#6F737C',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 22,
  },
  tabLabelSelected: {
    color: palette.mintDeep,
  },
  tabIndicator: {
    backgroundColor: palette.mintDeep,
    borderRadius: radius.pill,
    bottom: -1,
    height: 2,
    left: '8%',
    position: 'absolute',
    right: '8%',
  },
  list: {
    gap: spacing.md,
  },
  bookingCard: {
    backgroundColor: palette.white,
    borderColor: '#EEF0F2',
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  bookingTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  serviceIconBlock: {
    alignItems: 'center',
    backgroundColor: '#F1FAF5',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  bookingMain: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
  },
  bookingTitle: {
    color: '#202733',
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 21,
  },
  statusBadge: {
    borderRadius: radius.sm,
    flexShrink: 0,
    maxWidth: 82,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  statusBadgeDanger: {
    backgroundColor: '#FEECEC',
  },
  statusBadgeNeutral: {
    backgroundColor: '#EEF2F6',
  },
  statusBadgeSuccess: {
    backgroundColor: palette.mintSoft,
  },
  statusBadgeWarning: {
    backgroundColor: '#FFF4DF',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 16,
  },
  statusTextDanger: {
    color: '#C2413D',
  },
  statusTextNeutral: {
    color: '#5F6671',
  },
  statusTextSuccess: {
    color: palette.mintDeep,
  },
  statusTextWarning: {
    color: '#C96B00',
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 8,
  },
  metaText: {
    color: '#737A85',
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 20,
  },
  metaDot: {
    color: '#737A85',
    fontSize: 14,
    lineHeight: 20,
  },
  servicePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F2F4F6',
    borderRadius: radius.sm,
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  servicePillText: {
    color: '#565E69',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 16,
  },
  cardDivider: {
    backgroundColor: '#ECEFF2',
    height: 1,
    marginTop: 13,
  },
  providerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 11,
    paddingTop: 12,
  },
  providerIconBlock: {
    alignItems: 'center',
    backgroundColor: '#F1FAF5',
    borderRadius: radius.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  providerCopy: {
    flex: 1,
    minWidth: 0,
  },
  providerEyebrow: {
    color: '#7A828D',
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 17,
  },
  providerName: {
    color: '#202733',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 20,
  },
  rescheduleCard: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: 10,
    flexDirection: 'row',
    gap: 11,
    padding: 14,
  },
  rescheduleCardDisabled: {
    opacity: 0.72,
  },
  rescheduleIconBlock: {
    alignItems: 'center',
    backgroundColor: '#E3F6EC',
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  rescheduleCopy: {
    flex: 1,
    minWidth: 0,
  },
  rescheduleTitle: {
    color: '#202733',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 21,
  },
  rescheduleBody: {
    color: '#606A77',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 20,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#FBFCFD',
    borderColor: '#EEF0F2',
    borderRadius: 10,
    borderWidth: 1,
    padding: spacing.xl,
  },
  emptyTitle: {
    color: '#202733',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 24,
    textAlign: 'center',
  },
  emptyBody: {
    color: '#68717E',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 21,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  skeletonIcon: {
    backgroundColor: '#EDF3F1',
    borderRadius: 10,
    height: 50,
    width: 50,
  },
  skeletonMain: {
    flex: 1,
    gap: spacing.sm,
    paddingTop: 4,
  },
  skeletonTitle: {
    backgroundColor: '#EEF0F2',
    borderRadius: radius.sm,
    height: 18,
    width: '78%',
  },
  skeletonMeta: {
    backgroundColor: '#EEF0F2',
    borderRadius: radius.sm,
    height: 14,
    width: '70%',
  },
  skeletonPill: {
    backgroundColor: '#EEF0F2',
    borderRadius: radius.sm,
    height: 20,
    width: 108,
  },
  skeletonProviderIcon: {
    backgroundColor: '#EDF3F1',
    borderRadius: radius.pill,
    height: 36,
    width: 36,
  },
  skeletonProviderCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  skeletonProviderLabel: {
    backgroundColor: '#EEF0F2',
    borderRadius: radius.sm,
    height: 12,
    width: 94,
  },
  skeletonProviderName: {
    backgroundColor: '#EEF0F2',
    borderRadius: radius.sm,
    height: 16,
    width: '64%',
  },
});
