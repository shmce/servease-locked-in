import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Gift } from 'lucide-react-native';
import {
  Card,
  MetricCard,
  PrimaryButton,
  TopBar,
} from '../../../components/DesignKit';
import {
  ApiOptions,
  ReferralSummary,
} from '../../../shared/models/types';
import { AppScreen } from '../../../navigation/types';
import { palette, spacing } from '../../../theme/serveaseDesign';
import { useCustomerReferralViewModel } from '../viewModels/useCustomerReferralViewModel';

type CustomerReferralScreenProps = {
  apiOptions: ApiOptions;
  referralSummary: ReferralSummary | null;
  navigate: (screen: AppScreen, nextRole?: 'customer') => void;
  onReferralSummaryLoaded: (summary: ReferralSummary) => void;
  onNotice: (notice: string) => void;
  readError: (error: unknown) => string;
};

export function CustomerReferralScreen({
  apiOptions,
  referralSummary,
  navigate,
  onReferralSummaryLoaded,
  onNotice,
  readError,
}: CustomerReferralScreenProps) {
  const referral = useCustomerReferralViewModel({
    apiOptions,
    referralSummary,
    onReferralSummaryLoaded,
    onNotice,
    readError,
  });

  return (
    <>
      <TopBar title="Refer a Friend" onBack={() => navigate('more', 'customer')} />
      <ScrollView contentContainerStyle={styles.withBottomNav}>
        <View style={styles.content}>
          <Card>
            <View style={styles.providerSummaryRow}>
              <View style={styles.quickIcon}>
                <Gift color={palette.mint} size={22} strokeWidth={2.5} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>Your referral code</Text>
                <Text style={styles.detailTitle}>{referral.data.referralCode}</Text>
                <Text style={styles.cardMeta}>
                  Share this code with people creating a ServEase account.
                </Text>
              </View>
            </View>
          </Card>
          <View style={styles.metricGrid}>
            <MetricCard label="Completed" value={referral.data.completedReferrals} />
            <MetricCard label="Pending" value={referral.data.pendingReferrals} />
          </View>
          <Card>
            <Text style={styles.cardTitle}>Rewards</Text>
            <Text style={styles.detailTitle}>{referral.data.totalRewards}</Text>
            <Text style={styles.cardMeta}>Earned referral credits</Text>
          </Card>
          <PrimaryButton
            label={referral.isLoading ? 'Refreshing...' : 'Refresh'}
            variant="secondary"
            onPress={() => void referral.refreshReferralSummary()}
            disabled={referral.isLoading}
          />
          {referral.error ? <Text style={styles.cardMeta}>{referral.error}</Text> : null}
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
    gap: spacing.lg,
    padding: spacing.xl,
  },
  providerSummaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.base,
  },
  quickIcon: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  flex: {
    flex: 1,
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  detailTitle: {
    color: palette.ink,
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
  },
  cardMeta: {
    color: palette.faint,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
