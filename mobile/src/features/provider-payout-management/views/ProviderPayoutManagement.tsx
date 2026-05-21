import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CheckCircle, DollarSign, Wallet } from 'lucide-react-native';
import {
  Badge,
  Card,
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

          {/* Available balance hero */}
          <View style={styles.heroCard}>
            <View style={styles.heroIconBg}>
              <DollarSign color={palette.white} size={20} strokeWidth={2.5} />
            </View>
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
                <Text style={styles.metricValue}>{metric.value}</Text>
                <Text style={styles.metricLabel}>{metric.label}</Text>
              </View>
            ))}
          </View>

          {/* Payout methods */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Payout Methods</Text>
            {data.hasPayoutMethods ? (
              <View style={styles.methodList}>
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
                      <Text style={styles.methodType}>{method.methodLabel}</Text>
                    </View>
                    {method.isSelected ? (
                      <CheckCircle color={palette.mint} size={20} strokeWidth={2.2} />
                    ) : null}
                  </Pressable>
                ))}
              </View>
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
            <Card>
              <Text style={styles.formHint}>Account type</Text>
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
                label={busyAction === 'save-payout-method' ? 'Saving...' : 'Save Payout Method'}
                onPress={onSavePayoutMethod}
                disabled={!data.canSavePayoutMethod}
              />
            </Card>
          </View>

          {/* Monthly earnings */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Monthly Earnings</Text>
            {data.hasMonthlyEarnings ? (
              data.monthlyEarnings.map((month) => (
                <Card key={month.monthKey}>
                  <View style={styles.listRow}>
                    <View style={styles.flex}>
                      <Text style={styles.listTitle}>{month.monthLabel}</Text>
                      <Text style={styles.listMeta}>{month.statusLabel}</Text>
                      <Text style={styles.listFee}>{month.platformFeeLabel}</Text>
                    </View>
                    <Text style={styles.listAmount}>{month.payoutLabel}</Text>
                  </View>
                </Card>
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
                <Card key={payout.id}>
                  <View style={styles.listRow}>
                    <View style={styles.flex}>
                      <Text style={styles.listTitle}>{payout.amountLabel}</Text>
                      <Text style={styles.listMeta}>{payout.metaLabel}</Text>
                      <Text style={styles.listFee}>{payout.feeLabel}</Text>
                    </View>
                    <Badge label={payout.statusLabel} tone={payout.statusTone} />
                  </View>
                </Card>
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

  /* ── Hero ── */
  heroCard: {
    alignItems: 'center',
    backgroundColor: palette.mint,
    borderRadius: radius.lg,
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xl,
  },
  heroIconBg: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.pill,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontWeight: '600',
  },
  heroValue: {
    color: palette.white,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },

  /* ── Metric strip ── */
  metricRow: {
    backgroundColor: palette.white,
    borderRadius: radius.lg,
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
    flexDirection: 'row',
  },
  metricCard: {
    alignItems: 'center',
    borderRightColor: palette.lineSoft,
    borderRightWidth: 1,
    flex: 1,
    gap: spacing.xxs,
    paddingVertical: spacing.base,
  },
  metricValue: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  metricLabel: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },

  /* ── Section blocks ── */
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

  /* ── Payout method cards ── */
  methodList: {
    gap: spacing.sm,
  },
  methodCard: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderRadius: radius.md,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.base,
    minHeight: 64,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  methodCardSelected: {
    backgroundColor: palette.mintSoft,
    borderColor: palette.mint,
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
  methodType: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },

  /* ── Add method form ── */
  formHint: {
    color: palette.faint,
    fontSize: 12,
    fontWeight: '600',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  /* ── List rows (earnings + requests) ── */
  listRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.base,
    justifyContent: 'space-between',
  },
  listTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  listMeta: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  listFee: {
    color: palette.faint,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  listAmount: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: '800',
  },
});
