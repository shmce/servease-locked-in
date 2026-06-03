import { ReactNode } from 'react';
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
  ProviderButton,
  ProviderCard,
  ProviderContent,
  ProviderHeader,
  ProviderIconBlock,
  ProviderMetricCard,
  ProviderScreen,
  ProviderSection,
  providerText,
} from '../../../shared/components/ProviderUI';
import {
  BookingSummary,
  ProviderDashboardSummary,
} from '../../../shared/models/types';
import { palette, spacing } from '../../../theme/serveaseDesign';
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
    <ProviderScreen>
      <ProviderContent>
        <ProviderHeader
          title="Insights"
          subtitle="How your business is performing"
          onBack={onBack}
          right={
            <ProviderButton
              label="Refresh"
              variant="secondary"
              onPress={() => void refreshWorkspace()}
            />
          }
        />

        <ProviderCard style={styles.earningsCard}>
          <ProviderIconBlock>
            <TrendingUp color={palette.mintDeep} size={24} strokeWidth={2.3} />
          </ProviderIconBlock>
          <View style={styles.flex}>
            <Text style={styles.earningsLabel}>Total Earnings</Text>
            <Text style={styles.earningsValue}>{insights.data.totalEarnings}</Text>
            <Text style={styles.earningsSub}>
              Today: {insights.data.todayEarnings}
            </Text>
          </View>
        </ProviderCard>

        <View style={styles.metricGrid}>
          <ProviderMetricCard
            label="Rating"
            value={insights.data.overallRating}
            meta={`${insights.data.totalReviews} reviews`}
          />
          <ProviderMetricCard
            label="Bookings"
            value={insights.data.totalBookings}
            meta={`${insights.data.todayBookings} today`}
          />
        </View>

        <ProviderCard style={styles.statStrip}>
          <StatCell
            icon={<Star color="#FFC107" fill="#FFC107" size={18} />}
            value={insights.data.overallRating}
            label="Rating"
          />
          <View style={styles.verticalDivider} />
          <StatCell
            icon={<Users color={palette.mintDeep} size={18} strokeWidth={2.2} />}
            value={insights.data.totalReviews}
            label="Reviews"
          />
          <View style={styles.verticalDivider} />
          <StatCell
            icon={<BarChart2 color={palette.mintDeep} size={18} strokeWidth={2.2} />}
            value={insights.data.totalBookings}
            label="Bookings"
          />
        </ProviderCard>

        <ProviderSection title="Service Performance">
          <ProviderCard>
            <MetricRow
              icon={<CheckCircle2 color={palette.mintDeep} size={15} strokeWidth={2.2} />}
              label="Acceptance rate"
              value={insights.data.acceptanceRateLabel}
            />
            <View style={styles.divider} />
            <MetricRow
              icon={<CheckCircle2 color="#C96B00" size={15} strokeWidth={2.2} />}
              label="Completion rate"
              value={insights.data.completionRateLabel}
            />
            <View style={styles.divider} />
            <MetricRow
              icon={<Clock color="#6D7480" size={15} strokeWidth={2.2} />}
              label="Avg. response time"
              value={insights.data.responseTimeLabel}
            />
          </ProviderCard>
        </ProviderSection>

        <ProviderSection title="Booking Activity">
          <ProviderCard style={styles.statStrip}>
            <StatCell value={insights.data.completedCount} label="Completed" />
            <View style={styles.verticalDivider} />
            <StatCell value={insights.data.cancelledCount} label="Cancelled" />
            <View style={styles.verticalDivider} />
            <StatCell value={insights.data.todayBookings} label="Today" />
          </ProviderCard>

          <ProviderCard>
            <MetricRow
              label="Repeat customers"
              value={insights.data.repeatCustomers}
            />
            <View style={styles.divider} />
            <MetricRow
              label="New booking requests"
              value={insights.data.newRequests}
            />
          </ProviderCard>
        </ProviderSection>

        <ProviderSection title="Tips To Grow">
          {insights.data.growthTips.map((tip) => (
            <ProviderCard key={tip} style={styles.tipCard}>
              <TrendingUp color={palette.mintDeep} size={16} strokeWidth={2.4} />
              <Text style={styles.tipText}>{tip}</Text>
            </ProviderCard>
          ))}
        </ProviderSection>
      </ProviderContent>
    </ProviderScreen>
  );
}

function StatCell({
  icon,
  value,
  label,
}: {
  icon?: ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <View style={styles.statCell}>
      {icon}
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MetricRow({
  icon,
  label,
  value,
}: {
  icon?: ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <View style={styles.metricRow}>
      {icon ? <ProviderIconBlock compact>{icon}</ProviderIconBlock> : null}
      <Text style={styles.metricName}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  earningsCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.base,
  },
  earningsLabel: {
    ...providerText.meta,
  },
  earningsValue: {
    color: '#202733',
    fontSize: 30,
    fontWeight: '600',
    lineHeight: 36,
    marginTop: spacing.xs,
  },
  earningsSub: {
    ...providerText.meta,
    marginTop: 2,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statStrip: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 0,
    paddingHorizontal: 0,
  },
  statCell: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
  },
  verticalDivider: {
    backgroundColor: '#EEF0F2',
    height: 44,
    width: 1,
  },
  statValue: {
    color: '#202733',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 25,
  },
  statLabel: {
    ...providerText.meta,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  metricRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 48,
  },
  divider: {
    backgroundColor: '#EEF0F2',
    height: 1,
  },
  metricName: {
    ...providerText.body,
    flex: 1,
  },
  metricValue: {
    color: '#202733',
    fontSize: 14,
    fontWeight: '600',
  },
  tipCard: {
    alignItems: 'flex-start',
    backgroundColor: palette.mintSoft,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tipText: {
    color: palette.mintDeep,
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
  },
});
