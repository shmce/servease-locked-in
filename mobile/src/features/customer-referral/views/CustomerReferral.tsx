import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Copy, Gift, Users } from 'lucide-react-native';
import {
  CustomerCard,
  CustomerContent,
  CustomerHeader,
  CustomerIconBlock,
  CustomerScreen,
  CustomerSection,
  customerText,
} from '../../../shared/components/CustomerUI';
import {
  ApiOptions,
  ReferralSummary,
} from '../../../shared/models/types';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
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
    <CustomerScreen>
      <CustomerContent>
        <CustomerHeader
          title="Refer a Friend"
          subtitle="Share ServEase and track your credits"
          onBack={onBack}
        />

        <CustomerCard style={styles.introCard}>
          <CustomerIconBlock>
            <Gift color={palette.mintDeep} size={22} strokeWidth={2.1} />
          </CustomerIconBlock>
          <View style={styles.flex}>
            <Text style={styles.introTitle}>Share & Earn</Text>
            <Text style={styles.introBody}>
              Invite friends to ServEase and earn credits when they complete their first booking.
            </Text>
          </View>
        </CustomerCard>

        <CustomerSection title="Referral code">
          <CustomerCard>
            <View style={styles.codeRow}>
              <View style={styles.flex}>
                <Text style={styles.codeLabel}>Your code</Text>
                <Text style={styles.codeText} numberOfLines={1}>
                  {referral.data.referralCode}
                </Text>
              </View>
              <Pressable
                style={styles.copyButton}
                onPress={() =>
                  onNotice('Copy the referral code manually. Clipboard copy is not enabled in this build.')
                }
                accessibilityRole="button"
                accessibilityLabel="Copy referral code manually"
              >
                <Copy color={palette.mintDeep} size={17} strokeWidth={2.2} />
              </Pressable>
            </View>
            <Text style={styles.codeHint}>
              Share this code manually when friends create a ServEase account.
            </Text>
          </CustomerCard>
        </CustomerSection>

        <CustomerSection title="Referral activity">
          <CustomerCard style={styles.statsCard}>
            <View style={styles.statItem}>
              <Users color={palette.mintDeep} size={19} strokeWidth={2.1} />
              <Text style={styles.statValue}>{referral.data.completedReferrals}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Users color={palette.mintDeep} size={19} strokeWidth={2.1} />
              <Text style={styles.statValue}>{referral.data.pendingReferrals}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Gift color={palette.mintDeep} size={19} strokeWidth={2.1} />
              <Text style={styles.statValue}>{referral.data.totalRewards}</Text>
              <Text style={styles.statLabel}>Credits</Text>
            </View>
          </CustomerCard>
        </CustomerSection>

        <Pressable
          style={[styles.refreshButton, referral.isLoading && styles.refreshButtonDisabled]}
          onPress={() => void referral.refreshReferralSummary()}
          disabled={referral.isLoading}
          accessibilityRole="button"
        >
          <Text style={styles.refreshButtonText}>
            {referral.isLoading ? 'Refreshing...' : 'Refresh'}
          </Text>
        </Pressable>

        {referral.error ? (
          <Text style={styles.errorText}>{referral.error}</Text>
        ) : null}
      </CustomerContent>
    </CustomerScreen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    minWidth: 0,
  },
  introCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  introTitle: {
    ...customerText.title,
    fontSize: 17,
    lineHeight: 23,
  },
  introBody: {
    ...customerText.body,
    marginTop: 2,
  },
  codeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  codeLabel: {
    ...customerText.meta,
  },
  codeText: {
    color: '#202733',
    fontFamily: 'monospace',
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 1.5,
    lineHeight: 30,
    marginTop: 2,
  },
  copyButton: {
    alignItems: 'center',
    backgroundColor: '#F1FAF5',
    borderColor: 'rgba(0,160,85,0.22)',
    borderRadius: radius.md,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  codeHint: {
    ...customerText.body,
    borderTopColor: '#EEF0F2',
    borderTopWidth: 1,
    marginTop: spacing.sm,
    paddingTop: spacing.md,
  },
  statsCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 0,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  statDivider: {
    backgroundColor: '#EEF0F2',
    height: 52,
    width: 1,
  },
  statValue: {
    color: '#202733',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 24,
  },
  statLabel: {
    ...customerText.meta,
    textAlign: 'center',
  },
  refreshButton: {
    alignItems: 'center',
    backgroundColor: '#F1FAF5',
    borderColor: 'rgba(0,160,85,0.22)',
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: spacing.lg,
  },
  refreshButtonDisabled: {
    opacity: 0.45,
  },
  refreshButtonText: {
    color: palette.mintDeep,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 19,
  },
  errorText: {
    color: palette.red,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
    textAlign: 'center',
  },
});
