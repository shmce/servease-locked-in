import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CheckCircle, DollarSign, Wallet } from 'lucide-react-native';
import {
  ProviderBadge,
  ProviderButton,
  ProviderCard,
  ProviderContent,
  ProviderEmptyState,
  ProviderHeader,
  ProviderIconBlock,
  ProviderMetricCard,
  ProviderPill,
  ProviderScreen,
  ProviderSection,
  ProviderTextField,
  providerText,
} from '../../../shared/components/ProviderUI';
import { palette, spacing } from '../../../theme/serveaseDesign';
import {
  PaymentSummary,
  PayoutAccountSummary,
  PayoutMethodSummary,
  PayoutMethodType,
  PayoutSummary,
} from '../../../shared/models/types';
import { useProviderPayoutManagementViewModel } from '../viewModels/useProviderPayoutManagementViewModel';

type ProviderPayoutManagementScreenProps = {
  payoutAccount: PayoutAccountSummary | null;
  payoutTotal: number;
  payoutMethods: PayoutMethodSummary[];
  providerPayouts: PayoutSummary[];
  payments: PaymentSummary[];
  selectedPayoutMethodId: string | null;
  newPayoutMethodType: PayoutMethodType;
  newPayoutAccountLabel: string;
  newPayoutAccountName: string;
  newPayoutAccountLast4: string;
  busyAction: string | null;
  onBack: () => void;
  onRefresh: () => void;
  onRequestPayout: () => void;
  onSelectPayoutMethod: (methodId: string) => void;
  onPayoutMethodTypeChange: (methodType: PayoutMethodType) => void;
  onPayoutAccountLabelChange: (value: string) => void;
  onPayoutAccountNameChange: (value: string) => void;
  onPayoutAccountLast4Change: (value: string) => void;
  onSavePayoutMethod: () => void;
};

export function ProviderPayoutManagementScreen({
  payoutAccount,
  payoutTotal,
  payoutMethods,
  providerPayouts,
  payments,
  selectedPayoutMethodId,
  newPayoutMethodType,
  newPayoutAccountLabel,
  newPayoutAccountName,
  newPayoutAccountLast4,
  busyAction,
  onBack,
  onRefresh,
  onRequestPayout,
  onSelectPayoutMethod,
  onPayoutMethodTypeChange,
  onPayoutAccountLabelChange,
  onPayoutAccountNameChange,
  onPayoutAccountLast4Change,
  onSavePayoutMethod,
}: ProviderPayoutManagementScreenProps) {
  const payoutManagement = useProviderPayoutManagementViewModel({
    payoutAccount,
    payoutTotal,
    payoutMethods,
    providerPayouts,
    payments,
    selectedPayoutMethodId,
    newPayoutMethodType,
    newPayoutAccountLabel,
    busyAction,
  });
  const { data } = payoutManagement;

  return (
    <ProviderScreen>
      <ProviderContent>
        <ProviderHeader
          title="Payouts"
          subtitle="Manage earnings and payout methods"
          onBack={onBack}
          right={
            <ProviderButton
              label="Refresh"
              variant="secondary"
              onPress={onRefresh}
            />
          }
        />

        <ProviderCard style={styles.balanceCard}>
          <ProviderIconBlock>
            <DollarSign color={palette.mintDeep} size={24} strokeWidth={2.3} />
          </ProviderIconBlock>
          <View style={styles.flex}>
            <Text style={styles.balanceLabel}>Available Payout</Text>
            <Text style={styles.balanceValue}>{data.availablePayoutLabel}</Text>
          </View>
          <ProviderButton
            label="Request"
            onPress={onRequestPayout}
            disabled={!data.canRequestPayout}
          />
        </ProviderCard>

        <View style={styles.metricGrid}>
          {data.metricCards.map((metric) => (
            <ProviderMetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
            />
          ))}
        </View>

        <ProviderSection title="Payout Methods">
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
              body="Add a bank, GCash, or PayMaya account below to receive payouts."
            />
          )}
        </ProviderSection>

        <ProviderSection title="Add Payout Method">
          <ProviderCard>
            <Text style={styles.formHint}>Account type</Text>
            <View style={styles.pillRow}>
              {data.payoutMethodTypeOptions.map((option) => (
                <ProviderPill
                  key={option.type}
                  label={option.label}
                  selected={newPayoutMethodType === option.type}
                  onPress={() => onPayoutMethodTypeChange(option.type)}
                />
              ))}
            </View>
            <ProviderTextField
              label="Account label"
              value={newPayoutAccountLabel}
              onChangeText={onPayoutAccountLabelChange}
              placeholder={data.accountPlaceholder}
            />
            <ProviderTextField
              label="Account holder name"
              value={newPayoutAccountName}
              onChangeText={onPayoutAccountNameChange}
              placeholder="Full name on the account"
            />
            <ProviderTextField
              label="Last 4 digits"
              value={newPayoutAccountLast4}
              onChangeText={onPayoutAccountLast4Change}
              placeholder="1234"
              keyboardType="number-pad"
            />
            <ProviderButton
              label={
                busyAction === 'save-payout-method'
                  ? 'Saving...'
                  : 'Save Payout Method'
              }
              onPress={onSavePayoutMethod}
              disabled={!data.canSavePayoutMethod}
            />
          </ProviderCard>
        </ProviderSection>

        <ProviderSection title="Monthly Earnings">
          {data.hasMonthlyEarnings ? (
            data.monthlyEarnings.map((month) => (
              <ProviderCard key={month.monthKey}>
                <View style={styles.listRow}>
                  <View style={styles.flex}>
                    <Text style={styles.listTitle}>{month.monthLabel}</Text>
                    <Text style={styles.listMeta}>{month.statusLabel}</Text>
                    <Text style={styles.listFee}>{month.platformFeeLabel}</Text>
                  </View>
                  <Text style={styles.listAmount}>{month.payoutLabel}</Text>
                </View>
              </ProviderCard>
            ))
          ) : (
            <ProviderEmptyState
              title="No earnings yet"
              body="Completed bookings will show up here as monthly earnings."
            />
          )}
        </ProviderSection>

        <ProviderSection title="Payout Requests">
          {data.hasPayoutRequests ? (
            data.payoutRequests.map((payout) => (
              <ProviderCard key={payout.id}>
                <View style={styles.listRow}>
                  <View style={styles.flex}>
                    <Text style={styles.listTitle}>{payout.amountLabel}</Text>
                    <Text style={styles.listMeta}>{payout.metaLabel}</Text>
                    <Text style={styles.listFee}>{payout.feeLabel}</Text>
                  </View>
                  <ProviderBadge label={payout.statusLabel} tone={payout.statusTone} />
                </View>
              </ProviderCard>
            ))
          ) : (
            <ProviderEmptyState
              title="No payout requests"
              body="Requested payouts will appear here."
            />
          )}
        </ProviderSection>
      </ProviderContent>
    </ProviderScreen>
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
        <Text style={styles.methodType}>{methodLabel}</Text>
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
    flexDirection: 'row',
    gap: spacing.base,
  },
  balanceLabel: {
    ...providerText.meta,
  },
  balanceValue: {
    color: '#202733',
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 34,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
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
  methodType: {
    ...providerText.meta,
    marginTop: 2,
  },
  formHint: {
    ...providerText.meta,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  listRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.base,
  },
  listTitle: {
    color: '#202733',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  listMeta: {
    ...providerText.meta,
    marginTop: 2,
  },
  listFee: {
    color: '#8B949F',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 17,
    marginTop: 2,
  },
  listAmount: {
    color: '#202733',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
});
