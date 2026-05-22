import assert from 'node:assert/strict';
import test from 'node:test';
import type { CustomerPaymentMethodSummary } from '../../../shared/models/types';
import { buildCustomerPaymentMethodsViewModel } from './useCustomerPaymentMethodsViewModel';

const cashMethod: CustomerPaymentMethodSummary = {
  id: 'method-cash',
  customerId: 'customer-1',
  methodType: 'cash_on_service',
  label: 'Cash on service',
  brand: null,
  last4: null,
  isDefault: true,
  createdAt: null,
};

test('customer payment methods loading is explicit and not inferred from empty data', () => {
  const empty = buildCustomerPaymentMethodsViewModel({
    customerPaymentMethods: [],
    selectedMethodId: null,
    busyAction: null,
  });
  const loading = buildCustomerPaymentMethodsViewModel({
    customerPaymentMethods: [],
    selectedMethodId: null,
    busyAction: null,
    isLoading: true,
  });

  assert.equal(empty.isLoading, false);
  assert.equal(empty.data.hasMethods, false);
  assert.equal(loading.isLoading, true);
});

test('customer payment methods still formats saved method rows', () => {
  const model = buildCustomerPaymentMethodsViewModel({
    customerPaymentMethods: [cashMethod],
    selectedMethodId: 'method-cash',
    busyAction: null,
  });

  assert.equal(model.data.hasMethods, true);
  assert.equal(model.data.methods[0]?.label, 'Cash on service');
  assert.equal(model.data.methods[0]?.selected, true);
  assert.equal(model.data.methods[0]?.canDelete, false);
});
