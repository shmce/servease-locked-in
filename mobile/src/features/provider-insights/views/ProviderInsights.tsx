import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Card,
  MetricCard,
  PrimaryButton,
  Section,
  TopBar,
} from '../../../components/DesignKit';
import {
  BookingSummary,
  ProviderDashboardSummary,
} from '../../../shared/models/types';
import { AppScreen } from '../../../navigation/types';
import { palette, spacing } from '../../../theme/serveaseDesign';
import { useProviderInsightsViewModel } from '../viewModels/useProviderInsightsViewModel';

type ProviderInsightsScreenProps = {
  providerDashboard: ProviderDashboardSummary | null;
  bookings: BookingSummary[];
  navigate: (screen: AppScreen, nextRole?: 'provider') => void;
  refreshWorkspace: () => Promise<void>;
};

export function ProviderInsightsScreen({
  providerDashboard,
  bookings,
  navigate,
  refreshWorkspace,
}: ProviderInsightsScreenProps) {
  const insights = useProviderInsightsViewModel({
    providerDashboard,
    bookings,
  });

  return (
    <>
      <TopBar
        title="Performance Insights"
        subtitle="How your business is performing"
        onBack={() => navigate('more', 'provider')}
        right={
          <PrimaryButton
            label="Refresh"
            variant="secondary"
            onPress={() => void refreshWorkspace()}
          />
        }
      />
      <ScrollView contentContainerStyle={styles.withBottomNav}>
        <View style={styles.content}>
          <MetricCard
            label="Total Earnings"
            value={insights.data.totalEarnings}
            featured
          />
          <View style={styles.metricGrid}>
            <MetricCard
              label="Overall Rating"
              value={insights.data.overallRating}
            />
            <MetricCard
              label="Total Reviews"
              value={insights.data.totalReviews}
            />
            <MetricCard
              label="Today's Earnings"
              value={insights.data.todayEarnings}
            />
          </View>

          <Section title="Service performance">
            <Card>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Acceptance rate</Text>
                <Text style={styles.infoValue}>{insights.data.acceptanceRateLabel}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Completion rate</Text>
                <Text style={styles.infoValue}>{insights.data.completionRateLabel}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Average response time</Text>
                <Text style={styles.infoValue}>{insights.data.responseTimeLabel}</Text>
              </View>
            </Card>
          </Section>

          <Section title="Booking activity">
            <View style={styles.metricGrid}>
              <MetricCard label="Total Bookings" value={insights.data.totalBookings} />
              <MetricCard label="Completed" value={insights.data.completedCount} />
              <MetricCard label="Cancelled" value={insights.data.cancelledCount} />
            </View>
            <Card>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Repeat customers</Text>
                <Text style={styles.infoValue}>{insights.data.repeatCustomers}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>New booking requests</Text>
                <Text style={styles.infoValue}>{insights.data.newRequests}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Today&apos;s bookings</Text>
                <Text style={styles.infoValue}>{insights.data.todayBookings}</Text>
              </View>
            </Card>
          </Section>

          <Section title="Tips to grow">
            {insights.data.growthTips.map((tip) => (
              <Card key={tip}>
                <Text style={styles.cardBody}>{tip}</Text>
              </Card>
            ))}
          </Section>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  withBottomNav: {
    backgroundColor: palette.cream,
    flexGrow: 1,
    paddingBottom: 108,
  },
  content: {
    gap: spacing.md,
    padding: spacing.md,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: spacing.md,
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
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
  },
  cardBody: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
});
