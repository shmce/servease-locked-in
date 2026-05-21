import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CheckCircle, DollarSign, TrendingUp, Wallet } from 'lucide-react-native';
import {
  Badge,
  EmptyState,
  Field,
  Pill,
  PrimaryButton,
  TopBar,
} from '../../../components/DesignKit';
import { palette, radius, spacing } from '../../../theme/serveaseDesign';
import {
  PaymentSummary,
  PayoutAccountSummary,
  PayoutMethodSummary,
  PayoutMethodType,
  PayoutSummary,
} from '../../../shared/models/types';
import {
  ScreenContent,
  ScreenScroll,
} from '../../../shared/components/ScreenLayout';
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
    <>
      <TopBar
        title="Payouts"
        subtitle="Manage earnings and payout methods"
        onBack={onBack}
        right={
          <PrimaryButton
            label="Refresh"
            variant="secondary"
            onPress={onRefresh}
          />
        }
      />
      <ScreenScroll>
        <ScreenContent>

          {/* Available payout hero */}
          <View style={styles.heroCard}>
            <DollarSign color={palette.white} size={22} strokeWidth={2.2} />
            <Text style={styles.heroLabel}>Available Payout</Text>
            <Text style={styles.heroValue}>{data.availablePayoutLabel}</Text>
            <PrimaryButton
              label="Request Payout"
              onPress={onRequestPayout}
              disabled={!data.canRequestPayout}
            />
          </View>

          {/* Summary metrics */}
          <View style={styles.metricRow}>
            {data.metricCards.map((metric) => (
              <View key={metric.label} style={styles.metricCard}>
                <TrendingUp color={palette.mint} size={16} strokeWidth={2.2} />
                <Text style={styles.metricValue}>{metric.value}</Text>
                <Text style={styles.metricLabel}>{metric.label}</Text>
              </View>
            ))}
          </View>

          {/* Payout methods */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Payout Methods</Text>
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
                body="Add a bank, GCash, or PayMaya account below to receive payouts."
              />
            )}
          </View>

          {/* Add payout method */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Add Payout Method</Text>
            <View style={styles.formPanel}>
              <Text style={styles.cardHint}>Account type</Text>
              <View style={styles.pillRow}>
                {data.payoutMethodTypeOptions.map((option) => (
                  <Pill
                    key={option.type}
                    label={option.label}
                    selected={newPayoutMethodType === option.type}
                    onPress={() => onPayoutMethodTypeChange(option.type)}
                  />
                ))}
              </View>
              <Field
                label="Account label"
                value={newPayoutAccountLabel}
                onChangeText={onPayoutAccountLabelChange}
                placeholder={data.accountPlaceholder}
              />
              <Field
                label="Account holder name"
                value={newPayoutAccountName}
                onChangeText={onPayoutAccountNameChange}
                placeholder="Full name on the account"
              />
              <Field
                label="Last 4 digits"
                value={newPayoutAccountLast4}
                onChangeText={onPayoutAccountLast4Change}
                placeholder="1234"
                keyboardType="number-pad"
              />
              <PrimaryButton
                label={
                  busyAction === 'save-payout-method' ? 'Saving...' : 'Save Payout Method'
                }
                onPress={onSavePayoutMethod}
                disabled={!data.canSavePayoutMethod}
              />
            </View>
          </View>

          {/* Monthly earnings */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Monthly Earnings</Text>
            {data.hasMonthlyEarnings ? (
              data.monthlyEarnings.map((month) => (
                <View key={month.monthKey} style={styles.listRow}>
                  <View style={styles.earningRow}>
                    <View style={styles.flex}>
                      <Text style={styles.earningMonth}>{month.monthLabel}</Text>
                      <Text style={styles.earningStatus}>{month.statusLabel}</Text>
                      <Text style={styles.earningFee}>{month.platformFeeLabel}</Text>
                    </View>
                    <Text style={styles.earningAmount}>{month.payoutLabel}</Text>
                  </View>
                </View>
              ))
            ) : (
              <EmptyState
                title="No earnings yet"
                body="Completed bookings will show up here as monthly earnings."
              />
            )}
          </View>

          {/* Payout requests */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Payout Requests</Text>
            {data.hasPayoutRequests ? (
              data.payoutRequests.map((payout) => (
                <View key={payout.id} style={styles.listRow}>
                  <View style={styles.earningRow}>
                    <View style={styles.flex}>
                      <Text style={styles.earningMonth}>{payout.amountLabel}</Text>
                      <Text style={styles.earningStatus}>{payout.metaLabel}</Text>
                      <Text style={styles.earningFee}>{payout.feeLabel}</Text>
                    </View>
                    <Badge label={payout.statusLabel} tone={payout.statusTone} />
                  </View>
                </View>
              ))
            ) : (
              <EmptyState
                title="No payout requests"
                body="Requested payouts will appear here."
              />
            )}
          </View>

        </ScreenContent>
      </ScreenScroll>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  heroCard: {
    alignItems: 'center',
    backgroundColor: palette.mint,
    borderRadius: radius.lg,
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '500',
  },
  heroValue: {
    color: palette.white,
    fontSize: 32,
    fontWeight: '900',
    marginBottom: spacing.sm,
  },

  metricRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metricCard: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  metricValue: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  metricLabel: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
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

  cardHint: {
    color: palette.faint,
    fontSize: 12,
    fontWeight: '500',
  },
  formPanel: {
    gap: spacing.md,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  earningRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.base,
    justifyContent: 'space-between',
  },
  listRow: {
    borderTopColor: palette.lineSoft,
    borderTopWidth: 1,
    paddingVertical: spacing.md,
  },
  earningMonth: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  earningStatus: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  earningFee: {
    color: palette.faint,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  earningAmount: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: '700',
  },
});
