// Theme discipline: only palette.mint*, palette.alert, and palette.{ink,body,muted,faint,line,lineSoft,input,white,surface,cream} are allowed.
// Spacing/radius/type must use the exported theme tokens.
import {
  Bell,
  ChevronRight,
  Navigation,
  Play,
  Search,
  Star,
  User,
} from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { AppRole, AppScreen } from '../../../navigation/types';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import { useProviderHomeViewModel } from '../viewModels/useProviderHomeViewModel';
import type {
  ProviderHomeActiveBooking,
  ProviderHomeHero,
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
  ProviderEmptyState,
  ProviderHeader,
  ProviderIconBlock,
  ProviderMetricCard,
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

  const agendaItems = model.hero.kind === 'job'
    ? [
        { type: 'next' as const, hero: model.hero },
        ...model.activeBookings.map((item) => ({ type: 'booking' as const, item })),
      ]
    : model.activeBookings.map((item) => ({ type: 'booking' as const, item }));

  return (
    <ProviderScreen>
      <ProviderContent>
        <ProviderHeader
          title={`Hi, ${model.businessName}`}
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
              <Bell color="#4B5563" size={21} strokeWidth={2.2} />
              {unreadCount > 0 ? <View style={styles.heroUnreadDot} /> : null}
            </Pressable>
          }
        />
        <Pressable
          style={styles.searchBar}
          onPress={() => navigate('bookings', 'provider')}
          accessibilityRole="button"
          accessibilityLabel="Search provider bookings"
        >
          <Search color="#87919D" size={20} strokeWidth={2.1} />
          <Text style={styles.searchText}>Search bookings, requests...</Text>
        </Pressable>

        <ProviderSection
          title="Today's Agenda"
          action={
            <Text style={styles.linkText} onPress={() => navigate('bookings', 'provider')}>
              View all
            </Text>
          }
        >
          {agendaItems.map((item, index) =>
            item.type === 'next' ? (
              <NextAgendaRow
                key={item.hero.bookingId}
                hero={item.hero}
                onOpen={openHeroAction}
              />
            ) : (
              <AgendaBookingRow
                key={item.item.id}
                item={item.item}
                isFirst={index === 0}
                onPress={() => openBooking(item.item.booking, 'providerBookingDetail')}
              />
            ),
          )}
          {model.hero.kind === 'requests' ? (
            <PendingRequestsRow hero={model.hero} onOpen={openHeroAction} />
          ) : null}
          {!agendaItems.length && model.hero.kind !== 'requests' ? (
            <ProviderEmptyState
              title="No appointments today"
              body="Confirmed and in-progress jobs appear here."
            />
          ) : null}
        </ProviderSection>

        <ProviderSection
          title="Performance"
          action={
            <Text
              style={styles.linkText}
              onPress={() => navigate('providerEarnings', 'provider')}
            >
              View earnings
            </Text>
          }
        >
          <Pressable
            style={styles.metricGrid}
            onPress={() => navigate('providerEarnings', 'provider')}
            accessibilityRole="button"
            accessibilityLabel="Open provider earnings"
          >
            <ProviderMetricCard label="Today" value={model.todayEarningsLabel} />
            <ProviderMetricCard label="This week" value={model.weekEarningsLabel} />
            <ProviderCard style={styles.ratingCard}>
              <View style={styles.ratingLine}>
                <Star color={palette.mintDeep} fill={palette.mintDeep} size={16} />
                <Text style={styles.metricValue} numberOfLines={1}>
                  {model.ratingLabel}
                </Text>
              </View>
              <Text style={styles.metricLabel}>Rating</Text>
            </ProviderCard>
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

function NextAgendaRow({
  hero,
  onOpen,
}: {
  hero: Extract<ProviderHomeHero, { kind: 'job' }>;
  onOpen: (hero: ProviderHomeHero, screen: AppScreen) => void;
}) {
  const icon = hero.primaryActionLabel === 'Start Service' ? (
    <Play color={palette.white} fill={palette.white} size={spacing.lg} />
  ) : (
    <Navigation color={palette.white} size={spacing.lg} />
  );

  return (
    <ProviderCard style={styles.nextAgendaRow}>
      <View style={styles.agendaTopLine}>
        <View style={styles.nowDot} />
        <Text style={styles.agendaLabel}>Next appointment</Text>
      </View>
      <View style={styles.agendaCopy}>
        <Text style={styles.agendaMeta} numberOfLines={1}>
          {hero.meta}
        </Text>
        <Text style={styles.agendaTitle} numberOfLines={2}>
          {hero.title}
        </Text>
        <Text style={styles.agendaSubtitle} numberOfLines={1}>
          {hero.subtitle}
        </Text>
      </View>
      <Pressable
        style={styles.primaryAction}
        onPress={() => onOpen(hero, hero.primaryActionScreen)}
        accessibilityRole="button"
      >
        {icon}
        <Text style={styles.primaryActionText}>{hero.primaryActionLabel}</Text>
      </Pressable>
    </ProviderCard>
  );
}

function AgendaBookingRow({
  item,
  isFirst,
  onPress,
}: {
  item: ProviderHomeActiveBooking;
  isFirst: boolean;
  onPress: () => void;
}) {
  return (
    <ProviderCard
      style={[styles.agendaRow, !isFirst && styles.agendaRowWithDivider]}
      onPress={onPress}
      accessibilityLabel={`Open ${item.summary}`}
    >
      <View style={styles.agendaBullet} />
      <Text style={styles.agendaText} numberOfLines={2}>
        {item.summary}
      </Text>
      <ChevronRight color={palette.mintDeep} size={18} />
    </ProviderCard>
  );
}

function PendingRequestsRow({
  hero,
  onOpen,
}: {
  hero: Extract<ProviderHomeHero, { kind: 'requests' }>;
  onOpen: (hero: ProviderHomeHero, screen: AppScreen) => void;
}) {
  return (
    <ProviderCard
      style={styles.pendingRow}
      onPress={() => onOpen(hero, hero.primaryActionScreen)}
      accessibilityLabel={hero.title}
    >
      <ProviderIconBlock compact>
        <User color={palette.mintDeep} size={20} strokeWidth={2.2} />
      </ProviderIconBlock>
      <View style={styles.flex}>
        <Text style={styles.agendaTitle} numberOfLines={1}>
          {hero.title}
        </Text>
        <Text style={styles.agendaSubtitle} numberOfLines={2}>
          {hero.subtitle}
        </Text>
      </View>
      <ChevronRight color={palette.mintDeep} size={18} />
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
    borderColor: '#EEF0F2',
    borderRadius: radius.md,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    position: 'relative',
    width: 48,
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
    borderColor: '#EEF0F2',
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 58,
    paddingHorizontal: spacing.base,
  },
  searchText: {
    color: '#8B95A1',
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 20,
  },
  nextAgendaRow: {
    gap: spacing.md,
  },
  agendaTopLine: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  nowDot: {
    backgroundColor: palette.mintDeep,
    borderRadius: radius.pill,
    height: 8,
    width: 8,
  },
  agendaLabel: {
    color: palette.mintDeep,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 18,
  },
  agendaCopy: {
    gap: spacing.xs,
  },
  agendaMeta: {
    ...providerText.meta,
  },
  agendaTitle: {
    ...providerText.title,
  },
  agendaSubtitle: {
    ...providerText.meta,
  },
  primaryAction: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: palette.mintDeep,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.base,
  },
  primaryActionText: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  ratingCard: {
    flex: 1,
    minHeight: 94,
  },
  ratingLine: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  metricValue: {
    color: '#202733',
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 28,
  },
  metricLabel: {
    color: '#6D7480',
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 18,
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
  agendaRowWithDivider: {
    borderTopColor: palette.lineSoft,
    borderTopWidth: 1,
  },
  pendingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 72,
  },
  agendaBullet: {
    backgroundColor: palette.mintSoft,
    borderColor: '#A7E5C2',
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 12,
    width: 12,
  },
  agendaText: {
    ...providerText.body,
    flex: 1,
  },
});
