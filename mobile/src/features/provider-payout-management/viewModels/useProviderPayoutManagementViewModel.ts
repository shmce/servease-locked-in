import { useMemo } from 'react';
import {
  PaymentSummary,
  PayoutAccountSummary,
  PayoutMethodSummary,
  PayoutMethodType,
  PayoutSummary,
} from '../../../shared/models/types';
import {
  formatDateTime,
  formatMoney,
  summarizeMonthlyEarnings,
} from '../../../shared/utils/booking';

type ProviderPayoutManagementViewModelInput = {
  payoutAccount: PayoutAccountSummary | null;
  payoutTotal: number;
  payoutMethods: PayoutMethodSummary[];
  providerPayouts: PayoutSummary[];
  payments: PaymentSummary[];
  selectedPayoutMethodId: string | null;
  newPayoutMethodType: PayoutMethodType;
  newPayoutAccountLabel: string;
  busyAction: string | null;
};

const payoutMethodTypeOptions: { type: PayoutMethodType; label: string }[] = [
  { type: 'bank', label: 'Bank' },
  { type: 'gcash', label: 'GCash' },
  { type: 'paymaya', label: 'PayMaya' },
];

export function useProviderPayoutManagementViewModel(
  input: ProviderPayoutManagementViewModelInput,
) {
  return useMemo(() => buildProviderPayoutManagementViewModel(input), [input]);
}

export function buildProviderPayoutManagementViewModel({
  payoutAccount,
  payoutTotal,
  payoutMethods,
  providerPayouts,
  payments,
  selectedPayoutMethodId,
  newPayoutMethodType,
  newPayoutAccountLabel,
  busyAction,
}: ProviderPayoutManagementViewModelInput) {
  const nextPayoutDate = payoutAccount?.nextPayoutDate
    ? formatDateTime(payoutAccount.nextPayoutDate)
    : 'Not scheduled';
  const monthlyEarnings = summarizeMonthlyEarnings(payments)
    .slice(0, 6)
    .map((month) => ({
      monthKey: month.monthKey,
      monthLabel: month.monthLabel,
      statusLabel: `${month.paidCount} paid · ${month.pendingCount} pending`,
      platformFeeLabel: `Platform fee ${formatMoney(month.totalPlatformFee)}`,
      payoutLabel: formatMoney(month.totalPayout),
    }));
  const payoutRequests = providerPayouts.map((payout) => ({
    id: payout.id,
    amountLabel: formatMoney(payout.netAmount || payout.amount),
    metaLabel: `${payout.reference ?? payout.id.slice(0, 8)} · ${
      payout.accountLabel ?? 'Payout method'
    }`,
    feeLabel: `Fee ${formatMoney(payout.processingFee)} · Requested ${formatDateTime(
      payout.requestedAt ?? payout.createdAt,
    )}`,
    statusLabel: payout.status,
    statusTone: payout.status === 'paid' ? 'success' as const : 'warning' as const,
  }));
  const payoutMethodRows = payoutMethods.map((method) => ({
    id: method.id,
    accountLabel: method.accountLabel,
    methodLabel: `${method.methodType.toUpperCase()}${
      method.isDefault ? ' · Default' : ''
    }`,
    isSelected: selectedPayoutMethodId === method.id,
  }));
  const accountPlaceholder =
    newPayoutMethodType === 'bank'
      ? 'BPI Savings ****1234'
      : newPayoutMethodType === 'gcash'
        ? 'GCash 09171234567'
        : 'PayMaya 09171234567';

  return {
    data: {
      availablePayoutLabel: formatMoney(payoutAccount?.availableBalance ?? payoutTotal),
      metricCards: [
        {
          label: 'Pending',
          value: formatMoney(payoutAccount?.pendingBalance ?? 0),
        },
        {
          label: 'Paid Out',
          value: formatMoney(payoutAccount?.totalPaidOut ?? 0),
        },
        {
          label: 'Next',
          value: nextPayoutDate,
        },
      ],
      canRequestPayout: payoutMethods.length > 0,
      payoutMethodRows,
      payoutMethodTypeOptions,
      accountPlaceholder,
      canSavePayoutMethod:
        newPayoutAccountLabel.trim().length > 0 &&
        busyAction !== 'save-payout-method',
      monthlyEarnings,
      payoutRequests,
      hasPayoutMethods: payoutMethods.length > 0,
      hasMonthlyEarnings: monthlyEarnings.length > 0,
      hasPayoutRequests: payoutRequests.length > 0,
    },
    isLoading: false,
    error: null,
  };
}
