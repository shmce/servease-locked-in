import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CheckCircle, Wallet } from 'lucide-react-native';
import {
  EmptyState,
  Field,
  PrimaryButton,
  TopBar,
} from '../../../components/DesignKit';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import {
  PayoutAccountSummary,
  PayoutMethodSummary,
} from '../../../shared/models/types';
import {
  ScreenContent,
  ScreenScroll,
  StickyFooter,
} from '../../../shared/components/ScreenLayout';
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
        subtitle="Withdraw your available earnings"
        onBack={onBack}
      />
      <ScreenScroll>
        <ScreenContent>

          {/* Balance hero */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceValue}>{data.availableBalanceLabel}</Text>
          </View>

          {/* Amount + fee breakdown */}
          <View style={styles.amountPanel}>
            <Field
              label="Withdrawal Amount"
              value={requestPayoutAmount}
              onChangeText={onAmountChange}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Processing fee</Text>
              <Text style={styles.feeValue}>{data.processingFeeLabel}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>You receive</Text>
              <Text style={styles.totalValue}>{data.netAmountLabel}</Text>
            </View>
          </View>

          {/* Payout method selection */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Send To</Text>
            {data.hasPayoutMethods ? (
              data.payoutMethodRows.map((method) => (
                <Pressable
                  key={method.id}
                  style={[
                    styles.methodCard,
                    method.isSelected && styles.methodCardSelected,
                  ]}
                  onPress={() => onSelectPayoutMethod(method.id)}
                  accessibilityRole="button"
                >
                  <View style={[
                    styles.methodIcon,
                    method.isSelected && styles.methodIconSelected,
                  ]}>
                    <Wallet
                      color={method.isSelected ? palette.mint : palette.muted}
                      size={18}
                      strokeWidth={2.2}
                    />
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.methodName}>{method.accountLabel}</Text>
                    <Text style={styles.methodMeta}>{method.methodLabel}</Text>
                  </View>
                  {method.isSelected ? (
                    <CheckCircle color={palette.mint} size={20} strokeWidth={2.2} />
                  ) : null}
                </Pressable>
              ))
            ) : (
              <EmptyState
                title="No payout method"
                body="Set up a payout method in Payouts before requesting funds."
              />
            )}
          </View>

        </ScreenContent>
      </ScreenScroll>
      <StickyFooter>
        <PrimaryButton
          label={data.submitLabel}
          onPress={onSubmitPayoutRequest}
          disabled={!data.canSubmit}
        />
        <Text style={styles.backLink} onPress={onBack}>
          Back to payouts
        </Text>
      </StickyFooter>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  balanceCard: {
    alignItems: 'center',
    backgroundColor: palette.mint,
    borderRadius: radius.lg,
    gap: spacing.xs,
    paddingVertical: spacing.lg,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '500',
  },
  balanceValue: {
    color: palette.white,
    fontSize: 36,
    fontWeight: '900',
  },

  amountPanel: {
    gap: spacing.md,
  },

  feeRow: {
    alignItems: 'center',
    borderBottomColor: palette.lineSoft,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingVertical: spacing.sm,
  },
  feeLabel: {
    color: palette.faint,
    fontSize: 13,
    fontWeight: '600',
  },
  feeValue: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  totalRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  totalLabel: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  totalValue: {
    color: palette.ink,
    fontSize: 20,
    fontWeight: '900',
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

  methodCard: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.base,
    minHeight: 64,
    paddingVertical: spacing.md,
  },
  methodCardSelected: {
    backgroundColor: palette.mintSoft,
  },
  methodIcon: {
    alignItems: 'center',
    backgroundColor: palette.lineSoft,
    borderRadius: radius.sm,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  methodIconSelected: {
    backgroundColor: palette.white,
  },
  methodName: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  methodMeta: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },

  backLink: {
    color: palette.mint,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
});
