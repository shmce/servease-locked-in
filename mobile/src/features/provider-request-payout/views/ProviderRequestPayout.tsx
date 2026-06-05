import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CheckCircle, Wallet } from 'lucide-react-native';
import {
  ProviderButton,
  ProviderCard,
  ProviderContent,
  ProviderEmptyState,
  ProviderHeader,
  ProviderIconBlock,
  ProviderScreen,
  ProviderSection,
  ProviderStickyFooter,
  ProviderTextField,
  providerText,
} from '../../../shared/components/ProviderUI';
import { palette, spacing } from '../../../theme/serveaseDesign';
import {
  PayoutAccountSummary,
  PayoutMethodSummary,
} from '../../../shared/models/types';
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
      <ProviderScreen bottomInset={148}>
        <ProviderContent>
          <ProviderHeader
            title="Request Payout"
            subtitle="Withdraw your available earnings"
            onBack={onBack}
          />

          <ProviderCard style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceValue}>{data.availableBalanceLabel}</Text>
          </ProviderCard>

          <ProviderCard>
            <ProviderTextField
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
          </ProviderCard>

          <ProviderSection title="Send To">
            {data.hasPayoutMethods ? (
              data.payoutMethodRows.map((method) => (
                <PayoutMethodRow
                  key={method.id}
                  accountLabel={method.accountLabel}
                  methodLabel={method.methodLabel}
                  selected={method.isSelected}
                  onPress={() => onSelectPayoutMethod(method.id)}
                />
              ))
            ) : (
              <ProviderEmptyState
                title="No payout method"
                body="Set up a payout method in Payouts before requesting funds."
              />
            )}
          </ProviderSection>
        </ProviderContent>
      </ProviderScreen>
      <ProviderStickyFooter>
        <ProviderButton
          label={data.submitLabel}
          onPress={onSubmitPayoutRequest}
          disabled={!data.canSubmit}
        />
        <Text style={styles.backLink} onPress={onBack}>
          Back to payouts
        </Text>
      </ProviderStickyFooter>
    </>
  );
}

function PayoutMethodRow({
  accountLabel,
  methodLabel,
  selected,
  onPress,
}: {
  accountLabel: string;
  methodLabel: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.methodCard, selected && styles.methodCardSelected]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <ProviderIconBlock compact>
        <Wallet
          color={selected ? palette.mintDeep : '#7A828D'}
          size={18}
          strokeWidth={2.2}
        />
      </ProviderIconBlock>
      <View style={styles.flex}>
        <Text style={styles.methodName}>{accountLabel}</Text>
        <Text style={styles.methodMeta}>{methodLabel}</Text>
      </View>
      {selected ? (
        <CheckCircle color={palette.mintDeep} size={20} strokeWidth={2.2} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  balanceCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  balanceLabel: {
    ...providerText.meta,
  },
  balanceValue: {
    color: '#202733',
    fontSize: 32,
    fontWeight: '600',
    lineHeight: 38,
    marginTop: spacing.xs,
  },
  feeRow: {
    alignItems: 'center',
    borderBottomColor: '#EEF0F2',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingVertical: spacing.sm,
  },
  feeLabel: {
    ...providerText.meta,
  },
  feeValue: {
    color: '#202733',
    fontSize: 13,
    fontWeight: '600',
  },
  totalRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  totalLabel: {
    color: '#202733',
    fontSize: 14,
    fontWeight: '600',
  },
  totalValue: {
    color: '#202733',
    fontSize: 22,
    fontWeight: '600',
  },
  methodCard: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: '#EEF0F2',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.base,
    minHeight: 68,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  methodCardSelected: {
    backgroundColor: palette.mintSoft,
    borderColor: '#A7E5C2',
  },
  methodName: {
    color: '#202733',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  methodMeta: {
    ...providerText.meta,
    marginTop: 2,
  },
  backLink: {
    color: palette.mintDeep,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
