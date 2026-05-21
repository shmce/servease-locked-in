import { StyleSheet, Text, View } from 'react-native';
import {
  BarChart2,
  CheckCircle2,
  Clock,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react-native';
import {
  PrimaryButton,
  TopBar,
} from '../../../components/DesignKit';
import {
  BookingSummary,
  ProviderDashboardSummary,
} from '../../../shared/models/types';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import {
  ScreenContent,
  ScreenScroll,
} from '../../../shared/components/ScreenLayout';
import { useProviderInsightsViewModel } from '../viewModels/useProviderInsightsViewModel';

type ProviderInsightsScreenProps = {
  providerDashboard: ProviderDashboardSummary | null;
  bookings: BookingSummary[];
  onBack: () => void;
  refreshWorkspace: () => Promise<void>;
};

export function ProviderInsightsScreen({
  providerDashboard,
  bookings,
  onBack,
  refreshWorkspace,
}: ProviderInsightsScreenProps) {
  const insights = useProviderInsightsViewModel({ providerDashboard, bookings });

  return (
    <>
      <TopBar
        title="Insights"
        subtitle="How your business is performing"
        onBack={onBack}
        right={
          <PrimaryButton
            label="Refresh"
            variant="secondary"
            onPress={() => void refreshWorkspace()}
          />
        }
      />
      <ScreenScroll>
        <ScreenContent>

          {/* Featured earnings */}
          <View style={styles.featuredCard}>
            <TrendingUp color={palette.white} size={22} strokeWidth={2.2} />
            <Text style={styles.featuredLabel}>Total Earnings</Text>
            <Text style={styles.featuredValue}>{insights.data.totalEarnings}</Text>
            <Text style={styles.featuredSub}>Today: {insights.data.todayEarnings}</Text>
          </View>

          {/* Rating + Reviews */}
          <View style={styles.statRow}>
            <View style={styles.statCard}>
            <Star color={palette.mint} fill={palette.mint} size={20} />
              <Text style={styles.statValue}>{insights.data.overallRating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Users color={palette.mint} size={20} strokeWidth={2.2} />
              <Text style={styles.statValue}>{insights.data.totalReviews}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <BarChart2 color={palette.mint} size={20} strokeWidth={2.2} />
              <Text style={styles.statValue}>{insights.data.totalBookings}</Text>
              <Text style={styles.statLabel}>Bookings</Text>
            </View>
          </View>

          {/* Service performance */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Service Performance</Text>
            <View style={styles.metricPanel}>
              <View style={styles.metricRow}>
                <View style={styles.metricIcon}>
                  <CheckCircle2 color={palette.mint} size={16} strokeWidth={2.2} />
                </View>
                <Text style={styles.metricName}>Acceptance rate</Text>
                <Text style={styles.metricValue}>{insights.data.acceptanceRateLabel}</Text>
              </View>
              <View style={[styles.metricRow, styles.metricRowDivider]}>
                <View style={styles.metricIcon}>
                  <CheckCircle2 color={palette.mint} size={16} strokeWidth={2.2} />
                </View>
                <Text style={styles.metricName}>Completion rate</Text>
                <Text style={styles.metricValue}>{insights.data.completionRateLabel}</Text>
              </View>
              <View style={[styles.metricRow, styles.metricRowDivider]}>
                <View style={styles.metricIcon}>
                  <Clock color={palette.mint} size={16} strokeWidth={2.2} />
                </View>
                <Text style={styles.metricName}>Avg. response time</Text>
                <Text style={styles.metricValue}>{insights.data.responseTimeLabel}</Text>
              </View>
            </View>
          </View>

          {/* Booking activity */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Booking Activity</Text>
            <View style={styles.bookingRow}>
              <View style={styles.bookingCard}>
                <Text style={styles.bookingValue}>{insights.data.completedCount}</Text>
                <Text style={styles.bookingLabel}>Completed</Text>
              </View>
              <View style={styles.bookingCard}>
                <Text style={styles.bookingValue}>{insights.data.cancelledCount}</Text>
                <Text style={styles.bookingLabel}>Cancelled</Text>
              </View>
              <View style={styles.bookingCard}>
                <Text style={styles.bookingValue}>{insights.data.todayBookings}</Text>
                <Text style={styles.bookingLabel}>Today</Text>
              </View>
            </View>
            <View style={styles.metricPanel}>
              <View style={styles.metricRow}>
                <Text style={styles.metricName}>Repeat customers</Text>
                <Text style={styles.metricValue}>{insights.data.repeatCustomers}</Text>
              </View>
              <View style={[styles.metricRow, styles.metricRowDivider]}>
                <Text style={styles.metricName}>New booking requests</Text>
                <Text style={styles.metricValue}>{insights.data.newRequests}</Text>
              </View>
            </View>
          </View>

          {/* Growth tips */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Tips to Grow</Text>
            {insights.data.growthTips.map((tip) => (
              <View key={tip} style={styles.tipCard}>
                <TrendingUp color={palette.mint} size={14} strokeWidth={2.2} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>

        </ScreenContent>
      </ScreenScroll>
    </>
  );
}

const styles = StyleSheet.create({
  featuredCard: {
    alignItems: 'center',
    backgroundColor: palette.mint,
    borderRadius: radius.lg,
    gap: spacing.xs,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.base,
  },
  featuredLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '500',
  },
  featuredValue: {
    color: palette.white,
    fontSize: 32,
    fontWeight: '900',
  },
  featuredSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '500',
  },

  statRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  statDivider: {
    backgroundColor: palette.lineSoft,
    height: 48,
    width: 1,
  },
  statValue: {
    color: palette.ink,
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: '500',
  },

  sectionBlock: {
    gap: spacing.sm,
  },
  sectionLabel: {
    color: palette.faint,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    paddingHorizontal: spacing.xs,
    textTransform: 'uppercase',
  },

  metricRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 48,
    paddingVertical: spacing.sm,
  },
  metricPanel: {
    gap: 0,
  },
  metricRowDivider: {
    borderTopColor: palette.lineSoft,
    borderTopWidth: 1,
  },
  metricIcon: {
    alignItems: 'center',
    backgroundColor: palette.lineSoft,
    borderRadius: radius.sm,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  metricName: {
    color: palette.muted,
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  metricValue: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '700',
  },

  bookingRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bookingCard: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
    paddingVertical: spacing.base,
  },
  bookingValue: {
    color: palette.ink,
    fontSize: 22,
    fontWeight: '700',
  },
  bookingLabel: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: '500',
  },

  tipCard: {
    alignItems: 'flex-start',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.base,
  },
  tipText: {
    color: palette.mintDeep,
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
  },
});
