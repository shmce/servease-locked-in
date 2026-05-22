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
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { AppRole, AppScreen } from '../../../navigation/types';
import { palette, radius, spacing, type } from '../../../theme/serveaseDesign';
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
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.providerHero}>
        <View style={styles.heroRow}>
          <View style={styles.heroIdentity}>
            <View style={styles.heroAvatar}>
              <User color={palette.white} size={20} strokeWidth={2.4} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.heroMuted}>Today, {model.todayLabel}</Text>
              <Text style={styles.heroName} numberOfLines={1}>
                Hi, {model.businessName}
              </Text>
            </View>
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
        <Pressable
          style={styles.searchBar}
          onPress={() => navigate('bookings', 'provider')}
          accessibilityRole="button"
          accessibilityLabel="Search provider bookings"
        >
          <Search color={palette.faint} size={18} strokeWidth={2.2} />
          <Text style={styles.searchText}>Search bookings, requests...</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{"Today's Agenda"}</Text>
            <Text style={styles.linkText} onPress={() => navigate('bookings', 'provider')}>
              View all
            </Text>
          </View>
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
            <View style={styles.emptyBlock}>
              <Text style={styles.emptyTitle}>No appointments today</Text>
              <Text style={styles.emptyCopy}>
                Confirmed and in-progress jobs appear here.
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Performance</Text>
            <Text style={styles.linkText} onPress={() => navigate('providerEarnings', 'provider')}>
              View earnings
            </Text>
          </View>
          <Pressable
            style={styles.earningsStrip}
            onPress={() => navigate('providerEarnings', 'provider')}
            accessibilityRole="button"
            accessibilityLabel="Open provider earnings"
          >
            <StatItem label="Today" value={model.todayEarningsLabel} />
            <StatItem label="This week" value={model.weekEarningsLabel} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Rating</Text>
              <View style={styles.ratingRow}>
                <Star color={palette.mint} fill={palette.mint} size={spacing.base} />
                <Text style={styles.statValue}>{model.ratingLabel}</Text>
              </View>
            </View>
          </Pressable>
        </View>

        <ProviderApplicationBanner
          profile={profile}
          providerApplication={providerApplication}
          busyAction={busyAction}
          onRefreshStatus={onRefreshProviderApplication}
          onOpenApplicationDocuments={onOpenApplicationDocuments}
        />
      </View>
    </ScrollView>
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
    <View style={styles.nextAgendaRow}>
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
    </View>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
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
    <Pressable
      style={[styles.agendaRow, !isFirst && styles.agendaRowWithDivider]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.summary}`}
    >
      <View style={styles.agendaBullet} />
      <Text style={styles.agendaText} numberOfLines={2}>
        {item.summary}
      </Text>
      <ChevronRight color={palette.faint} size={18} />
    </Pressable>
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
    <Pressable
      style={styles.pendingRow}
      onPress={() => onOpen(hero, hero.primaryActionScreen)}
      accessibilityRole="button"
    >
      <View style={styles.agendaBullet} />
      <View style={styles.flex}>
        <Text style={styles.agendaTitle} numberOfLines={1}>
          {hero.title}
        </Text>
        <Text style={styles.agendaSubtitle} numberOfLines={2}>
          {hero.subtitle}
        </Text>
      </View>
      <ChevronRight color={palette.mint} size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: palette.cream,
    flexGrow: 1,
    paddingBottom: 96,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.base,
    paddingTop: spacing.lg,
  },
  flex: {
    flex: 1,
  },
  providerHero: {
    backgroundColor: palette.mint,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    gap: spacing.base,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
  },
  heroRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroIdentity: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  heroAvatar: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: radius.lg,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  heroMuted: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    fontWeight: '500',
  },
  heroName: {
    color: palette.white,
    fontSize: 20,
    fontWeight: '700',
  },
  notificationButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: radius.md,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    position: 'relative',
    width: 40,
  },
  heroUnreadDot: {
    backgroundColor: palette.alert,
    borderColor: 'rgba(86,196,144,0.8)',
    borderRadius: radius.pill,
    borderWidth: 1.5,
    height: 8,
    position: 'absolute',
    right: 8,
    top: 7,
    width: 8,
  },
  searchBar: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.base,
    boxShadow: '0 4px 14px rgba(44,90,60,0.12)',
  },
  searchText: {
    color: palette.faint,
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  nextAgendaRow: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  agendaTopLine: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  nowDot: {
    backgroundColor: palette.mint,
    borderRadius: radius.pill,
    height: 8,
    width: 8,
  },
  agendaLabel: {
    ...type.caption,
    color: palette.mintDeep,
    fontSize: 12,
    fontWeight: '700',
  },
  agendaCopy: {
    gap: spacing.xs,
  },
  agendaMeta: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
  },
  agendaTitle: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 23,
  },
  agendaSubtitle: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  primaryAction: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: palette.mint,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.base,
  },
  primaryActionText: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  earningsStrip: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  statItem: {
    flex: 1,
    gap: spacing.xxs,
  },
  statLabel: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
  },
  statValue: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  ratingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...type.section,
    color: palette.ink,
    fontWeight: '700',
  },
  linkText: {
    ...type.caption,
    color: palette.mintDark,
    fontWeight: '700',
  },
  agendaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 50,
    paddingVertical: spacing.sm,
  },
  agendaRowWithDivider: {
    borderTopColor: palette.lineSoft,
    borderTopWidth: 1,
  },
  pendingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 58,
    paddingVertical: spacing.sm,
  },
  agendaBullet: {
    backgroundColor: palette.mintSoft,
    borderColor: palette.mint,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 12,
    width: 12,
  },
  agendaText: {
    color: palette.body,
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  emptyBlock: {
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  emptyTitle: {
    ...type.section,
    color: palette.ink,
    fontWeight: '700',
  },
  emptyCopy: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
});
