import assert from 'node:assert/strict';
import test from 'node:test';
import { buildProviderRequestPayoutViewModel } from './useProviderRequestPayoutViewModel';
import type {
  PayoutAccountSummary,
  PayoutMethodSummary,
} from '../../../shared/models/types';

const payoutAccount: PayoutAccountSummary = {
  availableBalance: 1000,
  pendingBalance: 0,
  totalPaidOut: 0,
  nextPayoutDate: null,
};

const payoutMethod: PayoutMethodSummary = {
  id: 'method-1',
  providerId: 'provider-1',
  methodType: 'gcash',
  accountLabel: 'GCash 09171234567',
  accountName: 'Demo Provider',
  accountNumberLast4: '4567',
  isDefault: true,
  createdAt: '2026-05-20T00:00:00.000Z',
};

test('provider payout request estimates the fixed payout rail fee', () => {
  const model = buildProviderRequestPayoutViewModel({
    payoutAccount,
    payoutMethods: [payoutMethod],
    selectedPayoutMethodId: 'method-1',
    requestPayoutAmount: '1000',
    busyAction: null,
  });

  assert.equal(model.data.processingFeeLabel, 'PHP 10');
  assert.equal(model.data.netAmountLabel, 'PHP 990');
  assert.equal(model.data.canSubmit, true);
});

test('provider payout request caps fee deduction for tiny payouts', () => {
  const model = buildProviderRequestPayoutViewModel({
    payoutAccount,
    payoutMethods: [payoutMethod],
    selectedPayoutMethodId: 'method-1',
    requestPayoutAmount: '8',
    busyAction: null,
  });

  assert.equal(model.data.processingFeeLabel, 'PHP 8');
  assert.equal(model.data.netAmountLabel, 'PHP 0');
  assert.equal(model.data.canSubmit, true);
});
