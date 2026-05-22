import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCustomerReservePaymentViewModel } from './useCustomerReservePaymentViewModel';
import type {
  CustomerPaymentMethodSummary,
  PaymentSummary,
} from '../../../shared/models/types';

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

const gcashMethod: CustomerPaymentMethodSummary = {
  id: 'method-gcash',
  customerId: 'customer-1',
  methodType: 'gcash',
  label: 'Old wallet label',
  brand: 'GCash',
  last4: null,
  isDefault: false,
  createdAt: null,
};

const pendingOnlinePayment: PaymentSummary = {
  id: 'payment-1',
  bookingId: 'booking-1',
  customerId: 'customer-1',
  providerId: 'provider-1',
  amount: 1000,
  platformFee: 150,
  providerPayout: 850,
  status: 'pending',
  paymentMethod: 'gcash',
  paidAt: null,
  createdAt: null,
};

test('customer reserve payment treats wallet choices as secure checkout methods', () => {
  const model = buildCustomerReservePaymentViewModel({
    customerPaymentMethods: [cashMethod, gcashMethod],
    selectedMethodId: 'method-gcash',
    selectedPayment: null,
    promotionValidation: null,
    promoCode: '',
    busyAction: null,
  });

  assert.equal(model.data.paymentMethods[1]?.label, 'GCash checkout');
  assert.equal(model.data.confirmLabel, 'Open secure checkout');
  assert.match(model.data.statusNotice, /APICenter/);
});

test('customer reserve payment offers status check for pending online payments', () => {
  const model = buildCustomerReservePaymentViewModel({
    customerPaymentMethods: [cashMethod, gcashMethod],
    selectedMethodId: 'method-gcash',
    selectedPayment: pendingOnlinePayment,
    promotionValidation: null,
    promoCode: '',
    busyAction: null,
  });

  assert.equal(model.data.confirmLabel, 'Check payment status');
  assert.equal(model.data.confirmDisabled, false);
  assert.match(model.data.statusNotice, /pending/);
});

test('customer reserve payment loading is explicit and not inferred from empty data', () => {
  const empty = buildCustomerReservePaymentViewModel({
    customerPaymentMethods: [],
    selectedMethodId: null,
    selectedPayment: null,
    promotionValidation: null,
    promoCode: '',
    busyAction: null,
  });
  const loading = buildCustomerReservePaymentViewModel({
    customerPaymentMethods: [],
    selectedMethodId: null,
    selectedPayment: null,
    promotionValidation: null,
    promoCode: '',
    busyAction: null,
    isLoading: true,
  });

  assert.equal(empty.isLoading, false);
  assert.equal(empty.data.hasPaymentMethods, false);
  assert.equal(loading.isLoading, true);
});
