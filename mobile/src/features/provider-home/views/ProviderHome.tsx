// Theme discipline: only palette.mint*, palette.alert, and palette.{ink,body,muted,faint,line,lineSoft,input,white,surface,cream} are allowed.
// Spacing/radius/type must use the exported theme tokens.
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MapPin,
  Navigation,
  Play,
  Search,
  Star,
  User,
  WalletCards,
} from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { AppRole, AppScreen } from '../../../navigation/types';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import { useProviderHomeViewModel } from '../viewModels/useProviderHomeViewModel';
import type {
  ProviderHomeActiveBooking,
  ProviderHomeDashboardStatus,
  ProviderHomeHero,
  ProviderHomePerformanceCard,
} from '../viewModels/providerHomeModel';
import type {
  BookingSummary,
  CurrentUserProfile,
  PaymentSummary,
  ProviderApplicationStatus,
  ProviderDashboardSummary,
} from '../../../shared/models/types';
import {
  ProviderCard,
  ProviderContent,
  ProviderHeader,
  ProviderScreen,
  ProviderSection,
  providerText,
} from '../../../shared/components/ProviderUI';
import { ProviderApplicationBanner } from './ProviderApplicationBanner';

const EXISTING_MINIMUM_PAYOUT_AMOUNT = 1;

type ProviderHomeScreenProps = {
  profile: CurrentUserProfile | null;
  bookings: BookingSummary[];
  payments: PaymentSummary[];
  providerDashboard: ProviderDashboardSummary | null;
  providerApplication: ProviderApplicationStatus | null;
  payoutTotal: number;
  unreadCount: number;
  navigate: (screen: AppScreen, role: AppRole) => void;
  openBooking: (booking: BookingSummary, screen: AppScreen) => void;
  busyAction: string | null;
  onRefreshProviderApplication: () => void | Promise<void>;
  onOpenApplicationDocuments: () => void;
  now?: Date;
  minimumPayoutAmount?: number;
};

export function ProviderHomeScreen({
  profile,
  bookings,
  payments,
  providerDashboard,
  providerApplication,
  payoutTotal,
  unreadCount,
  navigate,
  openBooking,
  busyAction,
  onRefreshProviderApplication,
  onOpenApplicationDocuments,
  now = new Date(),
  minimumPayoutAmount = EXISTING_MINIMUM_PAYOUT_AMOUNT,
}: ProviderHomeScreenProps) {
  const model = useProviderHomeViewModel({
    bookings,
    payments,
    payoutTotal,
    minimumPayoutAmount,
    now,
    profile,
    providerDashboard,
  }).data;

  function openHeroAction(hero: ProviderHomeHero, screen: AppScreen) {
    if (hero.kind === 'job') {
      const booking = bookings.find((item) => item.id === hero.bookingId);
      if (booking) {
        openBooking(booking, screen);
        return;
      }
    }

    navigate(screen, 'provider');
  }

  return (
    <ProviderScreen>
      <ProviderContent>
        <ProviderHeader
          title={`Hi, ${model.greetingName}`}
          subtitle={`Today, ${model.todayLabel}`}
          right={
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
              <Bell color={palette.body} size={21} strokeWidth={2.2} />
              {unreadCount > 0 ? <View style={styles.heroUnreadDot} /> : null}
            </Pressable>
          }
        />
        <ProviderStatusPill status={model.dashboardStatus} />
        <Pressable
          style={styles.searchBar}
          onPress={() => navigate('bookings', 'provider')}
          accessibilityRole="button"
          accessibilityLabel="Search provider bookings and requests"
        >
          <Search color={palette.faint} size={20} strokeWidth={2.1} />
          <Text style={styles.searchText}>Search bookings</Text>
        </Pressable>

        <DashboardActionCard hero={model.hero} onOpen={openHeroAction} />

        <ProviderSection
          title="Today's Agenda"
          action={
            <Pressable
              onPress={() => navigate('bookings', 'provider')}
              accessibilityRole="button"
              accessibilityLabel="View all provider bookings"
            >
              <Text style={styles.linkText}>View all</Text>
            </Pressable>
          }
        >
          {model.activeBookings.map((item) => (
            <AgendaBookingRow
              key={item.id}
              item={item}
              onPress={() => openBooking(item.booking, 'providerBookingDetail')}
            />
          ))}
          {!model.activeBookings.length ? (
            <AgendaEmptyState />
          ) : null}
        </ProviderSection>

        <ProviderSection
          title="Performance"
          action={
            <Pressable
              onPress={() => navigate('providerEarnings', 'provider')}
              accessibilityRole="button"
              accessibilityLabel="View provider earnings"
            >
              <Text style={styles.linkText}>View earnings</Text>
            </Pressable>
          }
        >
          <Pressable
            style={styles.metricGrid}
            onPress={() => navigate('providerEarnings', 'provider')}
            accessibilityRole="button"
            accessibilityLabel="Open provider earnings"
          >
            {model.performanceCards.map((card) => (
              <PerformanceMetricCard key={card.id} card={card} />
            ))}
          </Pressable>
        </ProviderSection>

        <ProviderApplicationBanner
          profile={profile}
          providerApplication={providerApplication}
          busyAction={busyAction}
          onRefreshStatus={onRefreshProviderApplication}
          onOpenApplicationDocuments={onOpenApplicationDocuments}
        />
      </ProviderContent>
    </ProviderScreen>
  );
}

function ProviderStatusPill({ status }: { status: ProviderHomeDashboardStatus }) {
  return (
    <View
      style={styles.statusPill}
      accessible
      accessibilityRole="text"
      accessibilityLabel={status.accessibilityLabel}
    >
      <View style={styles.statusIcon}>
        <CheckCircle2 color={palette.mintDeep} size={16} strokeWidth={2.3} />
      </View>
      <View style={styles.statusCopy}>
        <Text style={styles.statusLine} numberOfLines={1}>
          <Text style={styles.statusLabel}>{status.label}</Text>
          <Text style={styles.statusHelper}> · {status.helperLabel}</Text>
        </Text>
      </View>
    </View>
  );
}

function DashboardActionCard({
  hero,
  onOpen,
}: {
  hero: ProviderHomeHero;
  onOpen: (hero: ProviderHomeHero, screen: AppScreen) => void;
}) {
  if (hero.kind === 'job') {
    const icon = hero.primaryActionLabel === 'Navigate' ? (
      <Navigation color={palette.white} size={spacing.lg} />
    ) : (
      <Play color={palette.white} fill={palette.white} size={spacing.lg} />
    );

    return (
      <ProviderCard style={styles.dashboardCard}>
        <View style={styles.dashboardTopLine}>
          <View style={styles.eyebrowRow}>
            <Clock3 color={palette.mintDeep} size={16} strokeWidth={2.3} />
            <Text style={styles.eyebrowText} numberOfLines={1}>
              {hero.eyebrow}
            </Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText} numberOfLines={1}>
              {hero.statusLabel}
            </Text>
          </View>
        </View>

        <View style={styles.dashboardCopy}>
          <Text style={styles.jobTime} numberOfLines={1}>
            {hero.timeLabel}
          </Text>
          <Text style={styles.dashboardTitle} numberOfLines={2}>
            {hero.title}
          </Text>
        </View>

        <View style={styles.detailStack}>
          <View style={styles.detailRow}>
            <User color={palette.muted} size={16} strokeWidth={2.2} />
            <Text style={styles.detailText} numberOfLines={1}>
              {hero.customerLabel}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MapPin color={palette.muted} size={16} strokeWidth={2.2} />
            <Text style={styles.detailText} numberOfLines={1}>
              {hero.meta}
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.primaryAction}
          onPress={() => onOpen(hero, hero.primaryActionScreen)}
          accessibilityRole="button"
          accessibilityLabel={`${hero.primaryActionLabel} for ${hero.title}`}
        >
          {icon}
          <Text style={styles.primaryActionText} numberOfLines={1}>
            {hero.primaryActionLabel}
          </Text>
        </Pressable>
      </ProviderCard>
    );
  }

  if (hero.kind === 'requests') {
    return (
      <ProviderCard style={styles.dashboardCard}>
        <View style={styles.dashboardTopLine}>
          <View style={styles.eyebrowRow}>
            <User color={palette.mintDeep} size={16} strokeWidth={2.3} />
            <Text style={styles.eyebrowText} numberOfLines={1}>
              {hero.eyebrow}
            </Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText} numberOfLines={1}>
              {hero.countLabel}
            </Text>
          </View>
        </View>

        <Text style={styles.dashboardTitle} numberOfLines={2}>
          {hero.title}
        </Text>
        <Text style={styles.dashboardSubtitle} numberOfLines={2}>
          {hero.subtitle}
        </Text>

        <Pressable
          style={styles.primaryAction}
          onPress={() => onOpen(hero, hero.primaryActionScreen)}
          accessibilityRole="button"
          accessibilityLabel="Review provider booking requests"
        >
          <User color={palette.white} size={spacing.lg} strokeWidth={2.2} />
          <Text style={styles.primaryActionText} numberOfLines={1}>
            {hero.primaryActionLabel}
          </Text>
        </Pressable>
      </ProviderCard>
    );
  }

  return (
    <ProviderCard style={styles.dashboardCard}>
      <View style={styles.dashboardTopLine}>
        <View style={styles.eyebrowRow}>
          <CalendarDays color={palette.mintDeep} size={16} strokeWidth={2.3} />
          <Text style={styles.eyebrowText} numberOfLines={1}>
            {hero.eyebrow}
          </Text>
        </View>
      </View>

      <Text style={styles.dashboardTitle} numberOfLines={2}>
        {hero.title}
      </Text>
      <Text style={styles.dashboardSubtitle} numberOfLines={2}>
        {hero.subtitle}
      </Text>

      <View style={styles.actionRow}>
        <Pressable
          style={[styles.primaryAction, styles.actionRowButton]}
          onPress={() => onOpen(hero, hero.primaryActionScreen)}
          accessibilityRole="button"
          accessibilityLabel={hero.primaryActionLabel}
        >
          <CalendarDays color={palette.white} size={spacing.lg} strokeWidth={2.2} />
          <Text style={styles.primaryActionText} numberOfLines={1}>
            {hero.primaryActionLabel}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.secondaryAction, styles.actionRowButton]}
          onPress={() => onOpen(hero, hero.secondaryActionScreen)}
          accessibilityRole="button"
          accessibilityLabel={hero.secondaryActionLabel}
        >
          <Text style={styles.secondaryActionText} numberOfLines={1}>
            {hero.secondaryActionLabel}
          </Text>
        </Pressable>
      </View>
    </ProviderCard>
  );
}

function AgendaBookingRow({
  item,
  onPress,
}: {
  item: ProviderHomeActiveBooking;
  onPress: () => void;
}) {
  return (
    <ProviderCard
      style={styles.agendaRow}
      onPress={onPress}
      accessibilityLabel={`Open ${item.summary}`}
    >
      <View style={styles.timePill}>
        <Text style={styles.timePillText} numberOfLines={1}>
          {item.timeLabel}
        </Text>
      </View>
      <View style={styles.agendaCopy}>
        <Text style={styles.agendaTitle} numberOfLines={1}>
          {item.serviceLabel}
        </Text>
        <Text style={styles.agendaSubtitle} numberOfLines={1}>
          {item.customerLabel}
        </Text>
      </View>
      <ChevronRight color={palette.mintDeep} size={18} />
    </ProviderCard>
  );
}

function AgendaEmptyState() {
  return (
    <View style={styles.agendaEmpty}>
      <Text style={styles.agendaEmptyTitle} numberOfLines={1}>
        No appointments today
      </Text>
      <Text style={styles.agendaEmptyBody} numberOfLines={2}>
        Confirmed jobs will appear here.
      </Text>
    </View>
  );
}

function PerformanceMetricCard({ card }: { card: ProviderHomePerformanceCard }) {
  const isRating = card.id === 'rating';
  const icon = card.id === 'rating' ? (
    <Star color={palette.mintDeep} fill={palette.mintDeep} size={16} />
  ) : (
    <WalletCards color={palette.mintDeep} size={16} strokeWidth={2.2} />
  );

  if (isRating) {
    return (
      <ProviderCard
        style={[styles.metricCard, styles.ratingMetricCard]}
        accessibilityLabel={card.accessibilityLabel}
      >
        <View style={styles.ratingMetricRow}>
          <View style={styles.metricHeader}>
            {icon}
            <View style={styles.ratingCopy}>
              <Text style={styles.metricLabel} numberOfLines={1}>
                {card.label}
              </Text>
              <Text style={styles.metricMeta} numberOfLines={1}>
                {card.meta}
              </Text>
            </View>
          </View>
          <Text style={styles.ratingMetricValue} numberOfLines={1}>
            {card.value}
          </Text>
        </View>
      </ProviderCard>
    );
  }

  return (
    <ProviderCard style={styles.metricCard} accessibilityLabel={card.accessibilityLabel}>
      <View style={styles.metricHeader}>
        {icon}
        <Text style={styles.metricLabel} numberOfLines={1}>
          {card.label}
        </Text>
      </View>
      <Text
        style={styles.metricValue}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.72}
      >
        {card.value}
      </Text>
      <Text style={styles.metricMeta} numberOfLines={1}>
        {card.meta}
      </Text>
    </ProviderCard>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  notificationButton: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.lineSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    height: 46,
    justifyContent: 'center',
    position: 'relative',
    width: 46,
  },
  heroUnreadDot: {
    backgroundColor: palette.alert,
    borderColor: palette.white,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    height: 10,
    position: 'absolute',
    right: 10,
    top: 9,
    width: 10,
  },
  searchBar: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.lineSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 50,
    paddingHorizontal: spacing.md,
  },
  searchText: {
    color: palette.faint,
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 20,
  },
  statusPill: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: palette.mintSoft,
    borderColor: palette.lineSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 42,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  statusIcon: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderRadius: radius.pill,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  statusCopy: {
    flex: 1,
    minWidth: 0,
  },
  statusLine: {
    color: palette.body,
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 19,
  },
  statusLabel: {
    color: palette.mintDeep,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 19,
  },
  statusHelper: {
    color: palette.body,
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 19,
  },
  dashboardCard: {
    borderRadius: radius.md,
    gap: spacing.sm,
    padding: spacing.base,
  },
  dashboardTopLine: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  eyebrowRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    minWidth: 0,
  },
  eyebrowText: {
    color: palette.mintDeep,
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 18,
  },
  statusBadge: {
    backgroundColor: palette.mintSoft,
    borderRadius: radius.pill,
    flexShrink: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statusBadgeText: {
    color: palette.mintDeep,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 16,
  },
  dashboardCopy: {
    gap: spacing.xxs,
  },
  jobTime: {
    color: palette.ink,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 33,
  },
  dashboardTitle: {
    color: palette.ink,
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 24,
  },
  dashboardSubtitle: {
    ...providerText.body,
  },
  detailStack: {
    gap: spacing.xs,
  },
  detailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minWidth: 0,
  },
  detailText: {
    ...providerText.meta,
    flex: 1,
    minWidth: 0,
  },
  primaryAction: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: palette.mintDeep,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 46,
    minWidth: 0,
    paddingHorizontal: spacing.base,
  },
  primaryActionText: {
    color: palette.white,
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 20,
  },
  secondaryAction: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 46,
    minWidth: 0,
    paddingHorizontal: spacing.base,
  },
  secondaryActionText: {
    color: palette.ink,
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    minWidth: 0,
  },
  actionRowButton: {
    flex: 1,
  },
  linkText: {
    ...providerText.action,
  },
  agendaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 62,
  },
  timePill: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.pill,
    flexShrink: 0,
    justifyContent: 'center',
    minHeight: 34,
    minWidth: 74,
    paddingHorizontal: spacing.sm,
  },
  timePillText: {
    color: palette.mintDeep,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 18,
  },
  agendaCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  agendaTitle: {
    ...providerText.title,
    fontSize: 15,
    lineHeight: 20,
  },
  agendaSubtitle: {
    ...providerText.meta,
  },
  agendaEmpty: {
    backgroundColor: palette.surface,
    borderColor: palette.lineSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    minHeight: 86,
    padding: spacing.base,
  },
  agendaEmptyTitle: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 21,
    textAlign: 'center',
  },
  agendaEmptyBody: {
    color: palette.muted,
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 19,
    textAlign: 'center',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metricCard: {
    borderRadius: radius.sm,
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 98,
    minWidth: 148,
    padding: spacing.md,
  },
  ratingMetricCard: {
    flexBasis: '100%',
    minHeight: 64,
  },
  metricHeader: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    minWidth: 0,
  },
  metricValue: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 23,
    minWidth: 0,
  },
  metricLabel: {
    color: palette.body,
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 18,
  },
  metricMeta: {
    ...providerText.meta,
    minWidth: 0,
  },
  ratingMetricRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    minWidth: 0,
  },
  ratingCopy: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  ratingMetricValue: {
    color: palette.ink,
    flexShrink: 0,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 28,
  },
});
