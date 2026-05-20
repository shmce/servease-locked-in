import { useMemo } from 'react';
import {
  PayoutAccountSummary,
  PayoutMethodSummary,
} from '../../../shared/models/types';
import { formatMoney } from '../../../shared/utils/booking';

type ProviderRequestPayoutViewModelInput = {
  payoutAccount: PayoutAccountSummary | null;
  payoutMethods: PayoutMethodSummary[];
  selectedPayoutMethodId: string | null;
  requestPayoutAmount: string;
  busyAction: string | null;
};

const PROVIDER_PAYOUT_RAIL_FEE = 10;

export function useProviderRequestPayoutViewModel({
  payoutAccount,
  payoutMethods,
  selectedPayoutMethodId,
  requestPayoutAmount,
  busyAction,
}: ProviderRequestPayoutViewModelInput) {
  return useMemo(
    () =>
      buildProviderRequestPayoutViewModel({
        payoutAccount,
        payoutMethods,
        selectedPayoutMethodId,
        requestPayoutAmount,
        busyAction,
      }),
    [
      busyAction,
      payoutAccount,
      payoutMethods,
      requestPayoutAmount,
      selectedPayoutMethodId,
    ],
  );
}

export function buildProviderRequestPayoutViewModel({
  payoutAccount,
  payoutMethods,
  selectedPayoutMethodId,
  requestPayoutAmount,
  busyAction,
}: ProviderRequestPayoutViewModelInput) {
  const amount = Number(requestPayoutAmount);
  const selectedMethod =
    payoutMethods.find((method) => method.id === selectedPayoutMethodId) ??
    payoutMethods.find((method) => method.isDefault) ??
    payoutMethods[0] ??
    null;
  const isValidPositiveAmount = Number.isFinite(amount) && amount > 0;
  const fee = isValidPositiveAmount
    ? Math.min(amount, PROVIDER_PAYOUT_RAIL_FEE)
    : 0;
  const netAmount = isValidPositiveAmount ? Math.max(amount - fee, 0) : 0;
  const availableBalance = payoutAccount?.availableBalance ?? 0;
  const canSubmit =
    Boolean(selectedMethod) &&
    isValidPositiveAmount &&
    amount <= availableBalance &&
    busyAction !== 'provider-payout';
  const payoutMethodRows = payoutMethods.map((method) => ({
    id: method.id,
    accountLabel: method.accountLabel,
    methodLabel: method.methodType.toUpperCase(),
    isSelected: selectedMethod?.id === method.id,
  }));

  return {
    data: {
      selectedMethod,
      availableBalanceLabel: formatMoney(availableBalance),
      processingFeeLabel: formatMoney(fee),
      netAmountLabel: formatMoney(netAmount),
      payoutMethodRows,
      canSubmit,
      hasPayoutMethods: payoutMethods.length > 0,
      submitLabel:
        busyAction === 'provider-payout'
          ? 'Requesting...'
          : 'Submit Payout Request',
    },
    isLoading: false,
    error: null,
  };
}
