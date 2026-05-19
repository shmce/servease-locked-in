import { ReactNode } from 'react';
import { Bell } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge, Card, EmptyState, MetricCard, Section } from '../components/DesignKit';
import { ProviderBookingRow, QuickAction } from '../components/AppDisplay';
import { formatMoney } from '../domain/booking';
import { AppRole, AppScreen } from '../navigation/types';
import { palette, radius, spacing, type } from '../theme/serveaseDesign';
import {
  BookingSummary,
  CurrentUserProfile,
  ProviderDashboardSummary,
  ProviderOwnedServiceSummary,
} from '../../services/serveaseApi';

type ProviderHomeScreenProps = {
  profile: CurrentUserProfile | null;
  bookings: BookingSummary[];
  providerDashboard: ProviderDashboardSummary | null;
  payoutTotal: number;
  activeCount: number;
  unreadCount: number;
  ownedServices: ProviderOwnedServiceSummary[];
  navigate: (screen: AppScreen, role: AppRole) => void;
  openBooking: (booking: BookingSummary) => void;
  renderProviderApplicationBanner: () => ReactNode;
};

export function ProviderHomeScreen({
  profile,
  bookings,
  providerDashboard,
  payoutTotal,
  activeCount,
  unreadCount,
  ownedServices,
  navigate,
  openBooking,
  renderProviderApplicationBanner,
}: ProviderHomeScreenProps) {
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
              <Text style={[styles.bannerTitle, styles.bannerTitleMuted]}>
                {"You're all caught up"}
              </Text>
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
              onPress={() => openBooking(booking)}
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

const styles = StyleSheet.create({
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
  content: {
    gap: spacing.lg,
    padding: spacing.xl,
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
  cardMeta: {
    ...type.caption,
    color: palette.muted,
  },
  linkText: {
    color: palette.mint,
    fontSize: 13,
    fontWeight: '900',
  },
  twoButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
