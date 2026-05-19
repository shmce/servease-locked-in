// Theme discipline: only palette.mint*, palette.alert, and palette.{ink,body,muted,faint,line,lineSoft,input,white,surface,cream} are allowed.
// Spacing/radius/type must use the exported theme tokens.
import { ReactNode, useMemo } from 'react';
import {
  Bell,
  CalendarOff,
  ChevronRight,
  MessageCircle,
  Navigation,
  Play,
  Share2,
  Star,
  Wallet,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { formatMoney } from '../domain/booking';
import { AppRole, AppScreen } from '../navigation/types';
import { homeTokens, palette, radius, spacing, type } from '../theme/serveaseDesign';
import {
  buildProviderHomeViewModel,
  ProviderHomeActiveBooking,
  ProviderHomeHero,
} from './ProviderHomeModel';
import {
  BookingSummary,
  CurrentUserProfile,
  PaymentSummary,
  ProviderDashboardSummary,
} from '../../services/serveaseApi';

const EXISTING_MINIMUM_PAYOUT_AMOUNT = 1;

type ProviderHomeScreenProps = {
  profile: CurrentUserProfile | null;
  bookings: BookingSummary[];
  payments: PaymentSummary[];
  providerDashboard: ProviderDashboardSummary | null;
  payoutTotal: number;
  unreadCount: number;
  navigate: (screen: AppScreen, role: AppRole) => void;
  openBooking: (booking: BookingSummary, screen: AppScreen) => void;
  renderProviderApplicationBanner: () => ReactNode;
  now?: Date;
  minimumPayoutAmount?: number;
};

export function ProviderHomeScreen({
  profile,
  bookings,
  payments,
  providerDashboard,
  payoutTotal,
  unreadCount,
  navigate,
  openBooking,
  renderProviderApplicationBanner,
  now = new Date(),
  minimumPayoutAmount = EXISTING_MINIMUM_PAYOUT_AMOUNT,
}: ProviderHomeScreenProps) {
  const model = useMemo(
    () =>
      buildProviderHomeViewModel({
        bookings,
        payments,
        payoutTotal,
        minimumPayoutAmount,
        now,
      }),
    [bookings, payments, payoutTotal, minimumPayoutAmount, now],
  );
  const businessName =
    profile?.providerProfile?.businessName ??
    profile?.user.fullName ??
    'Service Provider';
  const todayLabel = now.toLocaleDateString('en-PH', { weekday: 'long' });
  const rating = providerDashboard?.summary.overallRating ??
    profile?.providerProfile?.averageRating ??
    0;

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
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.content}>
        <View style={styles.topBar}>
          <View style={styles.flex}>
            <Text style={styles.eyebrow}>Today, {todayLabel}</Text>
            <Text style={styles.topTitle} numberOfLines={1}>
              Hi, {businessName}
            </Text>
          </View>
          <Pressable
            style={styles.iconButton}
            onPress={() => navigate('providerNotifications', 'provider')}
            accessibilityRole="button"
            accessibilityLabel={
              unreadCount > 0
                ? `Notifications, ${unreadCount} unread`
                : 'Notifications'
            }
          >
            <Bell color={palette.ink} size={spacing.lg} strokeWidth={2.2} />
            {unreadCount > 0 ? <View style={styles.unreadDot} /> : null}
          </Pressable>
        </View>

        <ActionHero hero={model.hero} onOpen={openHeroAction} />

        <View style={styles.quickRow}>
          <HomePill
            icon={<Wallet color={model.payoutAction.disabled ? palette.faint : palette.mint} size={spacing.lg} />}
            label="Request Payout"
            detail={model.payoutAction.helperLabel}
            disabled={model.payoutAction.disabled}
            accessibilityLabel={model.payoutAction.accessibilityLabel}
            onPress={() => navigate('providerRequestPayout', 'provider')}
          />
          <HomePill
            icon={<CalendarOff color={palette.mint} size={spacing.lg} />}
            label="Block Time"
            detail="Calendar"
            onPress={() => navigate('calendar', 'provider')}
          />
          <HomePill
            icon={<MessageCircle color={palette.mint} size={spacing.lg} />}
            label="Messages"
            detail={unreadCount > 0 ? `${unreadCount} unread` : 'Inbox'}
            badge={unreadCount}
            onPress={() => navigate('messages', 'provider')}
          />
        </View>

        <Pressable
          style={styles.earningsStrip}
          onPress={() => navigate('providerEarnings', 'provider')}
          accessibilityRole="button"
          accessibilityLabel="Open provider earnings"
        >
          <StatItem label="Today" value={formatMoney(model.todayEarnings)} />
          <StatItem label="This week" value={formatMoney(model.weekEarnings)} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Rating</Text>
            <View style={styles.ratingRow}>
              <Star color={palette.mint} fill={palette.mint} size={spacing.base} />
              <Text style={styles.statValue}>{rating.toFixed(1)}</Text>
            </View>
          </View>
        </Pressable>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active</Text>
            <Text style={styles.linkText} onPress={() => navigate('bookings', 'provider')}>
              View all
            </Text>
          </View>
          {model.activeBookings.map((booking) => (
            <ActiveBookingRow
              key={booking.id}
              item={booking}
              onPress={() => openBooking(booking.booking, 'providerBookingDetail')}
            />
          ))}
          {!model.activeBookings.length ? (
            <View style={styles.emptyBlock}>
              <Text style={styles.emptyTitle}>No active bookings</Text>
              <Text style={styles.emptyCopy}>
                Confirmed and in-progress jobs appear here.
              </Text>
            </View>
          ) : null}
        </View>

        {renderProviderApplicationBanner()}
      </View>
    </ScrollView>
  );
}

function ActionHero({
  hero,
  onOpen,
}: {
  hero: ProviderHomeHero;
  onOpen: (hero: ProviderHomeHero, screen: AppScreen) => void;
}) {
  const icon =
    hero.kind === 'job' && hero.primaryActionLabel === 'Start Service' ? (
      <Play color={palette.white} fill={palette.white} size={spacing.lg} />
    ) : hero.kind === 'job' ? (
      <Navigation color={palette.white} size={spacing.lg} />
    ) : hero.kind === 'requests' ? (
      <ChevronRight color={palette.white} size={spacing.lg} />
    ) : null;

  return (
    <View style={styles.actionHero}>
      <View style={styles.heroCopy}>
        <Text style={styles.heroMeta} numberOfLines={1}>
          {hero.meta}
        </Text>
        <Text style={styles.heroTitle} numberOfLines={2}>
          {hero.title}
        </Text>
        <Text style={styles.heroSubtitle} numberOfLines={1}>
          {hero.subtitle}
        </Text>
      </View>
      {hero.kind === 'caught-up' ? (
        <View style={styles.caughtUpActions}>
          <Pressable
            style={styles.secondaryPill}
            onPress={() => onOpen(hero, hero.primaryActionScreen)}
            accessibilityRole="button"
          >
            <CalendarOff color={palette.mint} size={spacing.base} />
            <Text style={styles.secondaryPillText}>{hero.primaryActionLabel}</Text>
          </Pressable>
          <Pressable
            style={styles.secondaryPill}
            onPress={() => onOpen(hero, hero.secondaryActionScreen)}
            accessibilityRole="button"
          >
            <Share2 color={palette.mint} size={spacing.base} />
            <Text style={styles.secondaryPillText}>{hero.secondaryActionLabel}</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={styles.primaryAction}
          onPress={() => onOpen(hero, hero.primaryActionScreen)}
          accessibilityRole="button"
        >
          {icon}
          <Text style={styles.primaryActionText}>{hero.primaryActionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

function HomePill({
  icon,
  label,
  detail,
  badge = 0,
  disabled = false,
  accessibilityLabel,
  onPress,
}: {
  icon: ReactNode;
  label: string;
  detail: string;
  badge?: number;
  disabled?: boolean;
  accessibilityLabel?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.homePill, disabled && styles.homePillDisabled]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
    >
      <View style={styles.pillIconWrap}>
        {icon}
        {badge > 0 ? <View style={styles.pillBadge} /> : null}
      </View>
      <Text style={[styles.pillLabel, disabled && styles.disabledText]} numberOfLines={2}>
        {label}
      </Text>
      <Text style={styles.pillDetail} numberOfLines={2}>
        {detail}
      </Text>
    </Pressable>
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

function ActiveBookingRow({
  item,
  onPress,
}: {
  item: ProviderHomeActiveBooking;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.activeRow}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.summary}`}
    >
      <Text style={styles.activeText} numberOfLines={1}>
        {item.summary}
      </Text>
      <ChevronRight color={palette.faint} size={spacing.lg} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: palette.surface,
    flexGrow: 1,
    paddingBottom: 108,
  },
  content: {
    gap: homeTokens.sectionGap,
    padding: homeTokens.heroPadding,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: homeTokens.cardGap,
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  flex: {
    flex: 1,
  },
  eyebrow: {
    ...type.caption,
    color: palette.muted,
    textTransform: 'uppercase',
  },
  topTitle: {
    ...type.section,
    color: palette.ink,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: spacing.xxl,
    minWidth: spacing.xxl,
    position: 'relative',
  },
  unreadDot: {
    backgroundColor: palette.alert,
    borderColor: palette.white,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: spacing.sm,
    position: 'absolute',
    right: spacing.xs,
    top: spacing.xs,
    width: spacing.sm,
  },
  actionHero: {
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: radius.lg,
    borderWidth: 1,
    boxShadow: '0 8px 18px rgba(44,42,40,0.08)',
    gap: homeTokens.cardGap,
    padding: homeTokens.heroPadding,
  },
  heroCopy: {
    gap: spacing.xs,
  },
  heroMeta: {
    ...type.caption,
    color: palette.mintDark,
  },
  heroTitle: {
    ...type.title,
    color: palette.ink,
  },
  heroSubtitle: {
    ...type.body,
    color: palette.body,
  },
  primaryAction: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: palette.mint,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: spacing.xxl,
    paddingHorizontal: spacing.base,
  },
  primaryActionText: {
    ...type.action,
    color: palette.white,
  },
  caughtUpActions: {
    flexDirection: 'row',
    gap: homeTokens.pillGap,
  },
  secondaryPill: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderColor: palette.line,
    borderRadius: radius.pill,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: spacing.xxl,
    paddingHorizontal: spacing.sm,
  },
  secondaryPillText: {
    ...type.caption,
    color: palette.mintDark,
    fontWeight: '800',
  },
  quickRow: {
    flexDirection: 'row',
    gap: homeTokens.pillGap,
  },
  homePill: {
    alignItems: 'flex-start',
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xs,
    minHeight: spacing.xxl * 3,
    padding: spacing.md,
  },
  homePillDisabled: {
    backgroundColor: palette.lineSoft,
  },
  pillIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pillBadge: {
    backgroundColor: palette.alert,
    borderColor: palette.white,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: spacing.sm,
    position: 'absolute',
    right: -spacing.xs,
    top: -spacing.xs,
    width: spacing.sm,
  },
  pillLabel: {
    ...type.caption,
    color: palette.ink,
    fontWeight: '800',
    flexShrink: 1,
  },
  pillDetail: {
    ...type.caption,
    color: palette.muted,
  },
  disabledText: {
    color: palette.faint,
  },
  earningsStrip: {
    alignItems: 'center',
    borderColor: palette.line,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  statItem: {
    flex: 1,
    gap: spacing.xxs,
  },
  statLabel: {
    ...type.caption,
    color: palette.muted,
  },
  statValue: {
    ...type.section,
    color: palette.ink,
  },
  ratingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  section: {
    gap: homeTokens.cardGap,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...type.section,
    color: palette.ink,
  },
  linkText: {
    ...type.caption,
    color: palette.mintDark,
    fontWeight: '800',
  },
  activeRow: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
  activeText: {
    ...type.body,
    color: palette.body,
    flex: 1,
  },
  emptyBlock: {
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  emptyTitle: {
    ...type.section,
    color: palette.ink,
  },
  emptyCopy: {
    ...type.body,
    color: palette.muted,
  },
});
