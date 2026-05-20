import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CheckCircle, Wallet } from 'lucide-react-native';
import {
  Badge,
  Card,
  EmptyState,
  Field,
  MetricCard,
  Pill,
  PrimaryButton,
  Section,
  TopBar,
} from '../../../components/DesignKit';
import { palette, radius, spacing, type } from '../../../theme/serveaseDesign';
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
      <ScrollView contentContainerStyle={styles.withBottomNav}>
        <View style={styles.content}>
          <MetricCard
            label="Available Payout"
            value={data.availablePayoutLabel}
            featured
          />
          <View style={styles.metricGrid}>
            {data.metricCards.map((metric) => (
              <MetricCard
                key={metric.label}
                label={metric.label}
                value={metric.value}
              />
            ))}
          </View>

          <PrimaryButton
            label="Request Payout"
            onPress={onRequestPayout}
            disabled={!data.canRequestPayout}
          />

          <Section title="Payout Methods">
            {data.payoutMethodRows.map((method) => (
              <Pressable
                key={method.id}
                style={styles.settingsRow}
                onPress={() => onSelectPayoutMethod(method.id)}
                accessibilityRole="button"
              >
                <View style={styles.settingsRowLeft}>
                  <View style={styles.quickIcon}>
                    <Wallet color={palette.mint} size={20} strokeWidth={2.5} />
                  </View>
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
                body="Add a bank, GCash, or PayMaya account below to receive payouts."
              />
            ) : null}
          </Section>

          <Section title="Add Payout Method">
            <Card>
              <Text style={styles.cardMeta}>Account type</Text>
              <View style={styles.wrap}>
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
                  busyAction === 'save-payout-method'
                    ? 'Saving...'
                    : 'Save Payout Method'
                }
                onPress={onSavePayoutMethod}
                disabled={!data.canSavePayoutMethod}
              />
            </Card>
          </Section>

          <Section title="Monthly Earnings">
            {data.monthlyEarnings.map((month) => (
              <Card key={month.monthKey}>
                <View style={styles.rowBetween}>
                  <View style={styles.flex}>
                    <Text style={styles.cardTitle}>{month.monthLabel}</Text>
                    <Text style={styles.cardMeta}>{month.statusLabel}</Text>
                    <Text style={styles.noticeText}>{month.platformFeeLabel}</Text>
                  </View>
                  <Text style={styles.totalValue}>{month.payoutLabel}</Text>
                </View>
              </Card>
            ))}
            {!data.hasMonthlyEarnings ? (
              <EmptyState
                title="No earnings yet"
                body="Completed bookings will show up here as monthly earnings."
              />
            ) : null}
          </Section>

          <Section title="Payout Requests">
            {data.payoutRequests.map((payout) => (
              <Card key={payout.id}>
                <View style={styles.rowBetween}>
                  <View style={styles.flex}>
                    <Text style={styles.cardTitle}>{payout.amountLabel}</Text>
                    <Text style={styles.cardMeta}>{payout.metaLabel}</Text>
                    <Text style={styles.noticeText}>{payout.feeLabel}</Text>
                  </View>
                  <Badge label={payout.statusLabel} tone={payout.statusTone} />
                </View>
              </Card>
            ))}
            {!data.hasPayoutRequests ? (
              <EmptyState
                title="No payout requests"
                body="Requested payouts will appear here."
              />
            ) : null}
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
    gap: spacing.sm,
  },
  settingsRow: {
    alignItems: 'center',
    borderBottomColor: palette.lineSoft,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingVertical: spacing.base,
  },
  settingsRowLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickIcon: {
    alignItems: 'center',
    backgroundColor: palette.mintSoft,
    borderRadius: radius.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  flex: {
    flex: 1,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cardTitle: {
    ...type.section,
    color: palette.ink,
  },
  cardMeta: {
    ...type.caption,
    color: palette.muted,
  },
  noticeText: {
    ...type.caption,
    color: palette.muted,
    textAlign: 'center',
  },
  totalValue: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: '900',
  },
});
