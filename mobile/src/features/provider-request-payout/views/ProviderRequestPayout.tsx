import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CheckCircle, Wallet } from 'lucide-react-native';
import {
  Card,
  EmptyState,
  Field,
  MetricCard,
  PrimaryButton,
  Section,
  TopBar,
} from '../../../components/DesignKit';
import { palette, radius, spacing, type } from '../../../theme/serveaseDesign';
import {
  PayoutAccountSummary,
  PayoutMethodSummary,
} from '../../../shared/models/types';
import { StickyFooter } from '../../../shared/components/ScreenLayout';
import { useProviderRequestPayoutViewModel } from '../viewModels/useProviderRequestPayoutViewModel';

type ProviderRequestPayoutScreenProps = {
  payoutAccount: PayoutAccountSummary | null;
  payoutMethods: PayoutMethodSummary[];
  selectedPayoutMethodId: string | null;
  requestPayoutAmount: string;
  busyAction: string | null;
  onBack: () => void;
  onAmountChange: (value: string) => void;
  onSelectPayoutMethod: (methodId: string) => void;
  onSubmitPayoutRequest: () => void;
};

export function ProviderRequestPayoutScreen({
  payoutAccount,
  payoutMethods,
  selectedPayoutMethodId,
  requestPayoutAmount,
  busyAction,
  onBack,
  onAmountChange,
  onSelectPayoutMethod,
  onSubmitPayoutRequest,
}: ProviderRequestPayoutScreenProps) {
  const requestPayout = useProviderRequestPayoutViewModel({
    payoutAccount,
    payoutMethods,
    selectedPayoutMethodId,
    requestPayoutAmount,
    busyAction,
  });
  const { data } = requestPayout;

  return (
    <>
      <TopBar
        title="Request Payout"
        subtitle="Withdraw available earnings"
        onBack={onBack}
      />
      <ScrollView contentContainerStyle={styles.withStickyFooter}>
        <View style={styles.content}>
          <MetricCard
            label="Available Balance"
            value={data.availableBalanceLabel}
            featured
          />
          <Card>
            <Field
              label="Amount"
              value={requestPayoutAmount}
              onChangeText={onAmountChange}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Processing fee</Text>
              <Text style={styles.infoValue}>{data.processingFeeLabel}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>You receive</Text>
              <Text style={styles.totalValue}>{data.netAmountLabel}</Text>
            </View>
          </Card>

          <Section title="Send To">
            {data.payoutMethodRows.map((method) => (
              <Pressable
                key={method.id}
                style={[
                  styles.methodCard,
                  method.isSelected && styles.methodCardSelected,
                ]}
                onPress={() => onSelectPayoutMethod(method.id)}
                accessibilityRole="button"
              >
                <View style={styles.settingsRowLeft}>
                  <Wallet color={palette.mint} size={20} strokeWidth={2.5} />
                  <View>
                    <Text style={styles.cardTitle}>{method.accountLabel}</Text>
                    <Text style={styles.cardMeta}>{method.methodLabel}</Text>
                  </View>
                </View>
                {method.isSelected ? (
                  <CheckCircle color={palette.mint} size={20} strokeWidth={2.6} />
                ) : null}
              </Pressable>
            ))}
            {!data.hasPayoutMethods ? (
              <EmptyState
                title="No payout method"
                body="Set up a payout method before requesting funds."
              />
            ) : null}
          </Section>
        </View>
      </ScrollView>
      <StickyFooter>
        <PrimaryButton
          label={data.submitLabel}
          onPress={onSubmitPayoutRequest}
          disabled={!data.canSubmit}
        />
        <Text style={styles.footerLink} onPress={onBack}>
          Back to payouts
        </Text>
      </StickyFooter>
    </>
  );
}

const styles = StyleSheet.create({
  withStickyFooter: {
    backgroundColor: palette.white,
    flexGrow: 1,
    paddingBottom: 132,
  },
  content: {
    gap: spacing.md,
    padding: spacing.md,
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
  totalRow: {
    alignItems: 'center',
    borderTopColor: palette.lineSoft,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
  },
  totalLabel: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  totalValue: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  methodCard: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: radius.md,
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 64,
    padding: spacing.base,
  },
  methodCardSelected: {
    backgroundColor: '#F0FFF4',
    borderColor: palette.mint,
  },
  settingsRowLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  cardTitle: {
    ...type.section,
    color: palette.ink,
  },
  cardMeta: {
    ...type.caption,
    color: palette.muted,
  },
  footerLink: {
    color: palette.mint,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
});
