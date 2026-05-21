import { StyleSheet, Text, View } from 'react-native';
import { Copy, Gift, Users } from 'lucide-react-native';
import {
  PrimaryButton,
  TopBar,
} from '../../../components/DesignKit';
import {
  ApiOptions,
  ReferralSummary,
} from '../../../shared/models/types';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import {
  ScreenContent,
  ScreenScroll,
} from '../../../shared/components/ScreenLayout';
import { useCustomerReferralViewModel } from '../viewModels/useCustomerReferralViewModel';

type CustomerReferralScreenProps = {
  apiOptions: ApiOptions;
  referralSummary: ReferralSummary | null;
  onBack: () => void;
  onReferralSummaryLoaded: (summary: ReferralSummary) => void;
  onNotice: (notice: string) => void;
  readError: (error: unknown) => string;
};

export function CustomerReferralScreen({
  apiOptions,
  referralSummary,
  onBack,
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
      <TopBar title="Refer a Friend" onBack={onBack} />
      <ScreenScroll>
        <ScreenContent>

          {/* Hero banner */}
          <View style={styles.heroBanner}>
            <View style={styles.heroIcon}>
              <Gift color={palette.white} size={28} strokeWidth={2.2} />
            </View>
            <Text style={styles.heroTitle}>Share & Earn</Text>
            <Text style={styles.heroBody}>
              Invite friends to ServEase and earn credits when they complete their first booking.
            </Text>
          </View>

          {/* Referral code card */}
          <View style={styles.codeBlock}>
            <Text style={styles.codeLabel}>Your Referral Code</Text>
            <View style={styles.codeRow}>
              <Text style={styles.codeText}>{referral.data.referralCode}</Text>
              <View style={styles.copyButton}>
                <Copy color={palette.mint} size={16} strokeWidth={2.2} />
              </View>
            </View>
            <Text style={styles.codeHint}>
              Share this code when friends create a ServEase account.
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Users color={palette.mint} size={20} strokeWidth={2.2} />
              <Text style={styles.statValue}>{referral.data.completedReferrals}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Users color={palette.mint} size={20} strokeWidth={2.2} />
              <Text style={styles.statValue}>{referral.data.pendingReferrals}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Gift color={palette.mint} size={20} strokeWidth={2.2} />
              <Text style={styles.statValue}>{referral.data.totalRewards}</Text>
              <Text style={styles.statLabel}>Credits</Text>
            </View>
          </View>

          <PrimaryButton
            label={referral.isLoading ? 'Refreshing...' : 'Refresh'}
            variant="secondary"
            onPress={() => void referral.refreshReferralSummary()}
            disabled={referral.isLoading}
          />
          {referral.error ? (
            <Text style={styles.errorText}>{referral.error}</Text>
          ) : null}

        </ScreenContent>
      </ScreenScroll>
    </>
  );
}

const styles = StyleSheet.create({
  heroBanner: {
    alignItems: 'center',
    backgroundColor: palette.mint,
    borderRadius: radius.lg,
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.pill,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  heroTitle: {
    color: palette.white,
    fontSize: 20,
    fontWeight: '700',
  },
  heroBody: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
    textAlign: 'center',
  },

  codeBlock: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  codeLabel: {
    color: palette.faint,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  codeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  codeText: {
    color: palette.ink,
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
  },
  copyButton: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.sm,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  codeHint: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },

  statsRow: {
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
    fontSize: 12,
    fontWeight: '500',
  },

  errorText: {
    color: palette.red,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
    textAlign: 'center',
  },
});
