import { useMemo } from 'react';
import {
  CustomerPaymentMethodSummary,
  PaymentSummary,
  PromotionValidationSummary,
} from '../../../shared/models/types';
import { formatMoney } from '../../../shared/utils/booking';
import { paymentMethodMeta } from '../../../shared/utils/paymentMethods';

type CustomerReservePaymentViewModelInput = {
  customerPaymentMethods: CustomerPaymentMethodSummary[];
  selectedMethodId: string | null;
  selectedPayment: PaymentSummary | null;
  promotionValidation: PromotionValidationSummary | null;
  promoCode: string;
  busyAction: string | null;
  isLoading?: boolean;
};

export function useCustomerReservePaymentViewModel({
  customerPaymentMethods,
  selectedMethodId,
  selectedPayment,
  promotionValidation,
  promoCode,
  busyAction,
  isLoading = false,
}: CustomerReservePaymentViewModelInput) {
  return useMemo(
    () =>
      buildCustomerReservePaymentViewModel({
        customerPaymentMethods,
        selectedMethodId,
        selectedPayment,
        promotionValidation,
        promoCode,
        busyAction,
        isLoading,
      }),
    [
      busyAction,
      customerPaymentMethods,
      promoCode,
      promotionValidation,
      selectedMethodId,
      selectedPayment,
      isLoading,
    ],
  );
}

export function buildCustomerReservePaymentViewModel({
  customerPaymentMethods,
  selectedMethodId,
  selectedPayment,
  promotionValidation,
  promoCode,
  busyAction,
  isLoading = false,
}: CustomerReservePaymentViewModelInput) {
  const paymentMethods = customerPaymentMethods.map((method) => ({
    method,
    label: paymentMethodLabel(method.methodType),
    meta: paymentMethodMeta(method),
    selected: selectedMethodId === method.id,
  }));
  const selectedMethod = paymentMethods.find((method) => method.selected)?.method;
  const isCashSelection = selectedMethod?.methodType === 'cash_on_service';
  const isOnlinePending =
    selectedPayment &&
    selectedPayment.status === 'pending' &&
    selectedPayment.paymentMethod !== 'cash_on_service';
  const isCashReserved =
    selectedPayment &&
    selectedPayment.status === 'pending' &&
    selectedPayment.paymentMethod === 'cash_on_service';
  const statusNotice = selectedPayment
    ? selectedPayment.status === 'paid'
      ? 'Payment is paid.'
      : isOnlinePending
        ? 'Online checkout is pending. Confirm the processor status before service completion.'
        : isCashReserved
          ? 'Cash is due directly to the provider after service completion.'
          : `Payment is ${selectedPayment.status}.`
    : isCashSelection
      ? 'Cash-on-service reserves this booking without collecting card or wallet details.'
      : 'APICenter will collect wallet or card details in secure checkout.';
  const promoResult = promotionValidation
    ? {
        tone: promotionValidation.valid ? 'success' : 'danger',
        title: promotionValidation.valid ? 'Promo applied' : 'Promo unavailable',
        message: promotionValidation.message,
        rows: promotionValidation.valid
          ? [
              {
                key: 'discount',
                label: 'Discount',
                value: formatMoney(promotionValidation.discountAmount),
              },
              {
                key: 'amount-due',
                label: 'Amount due',
                value: formatMoney(promotionValidation.finalAmount),
              },
            ]
          : [],
      }
    : null;

  return {
    data: {
      paymentMethods,
      hasPaymentMethods: paymentMethods.length > 0,
      promoResult,
      applyPromoLabel: busyAction === 'promo' ? 'Applying...' : 'Apply',
      applyPromoDisabled: busyAction === 'promo' || Boolean(selectedPayment),
      confirmLabel: selectedPayment
        ? isOnlinePending
          ? busyAction === 'payment-status'
            ? 'Checking...'
            : 'Check payment status'
          : selectedPayment.status === 'paid'
            ? 'Payment paid'
            : isCashReserved
              ? 'Cash due after service'
              : 'Payment status'
        : isCashSelection
          ? 'Confirm cash payment'
          : 'Open secure checkout',
      confirmDisabled:
        busyAction === 'payment' ||
        (Boolean(selectedPayment) && !isOnlinePending) ||
        busyAction === 'payment-status',
      normalizedPromoCode: promoCode.toUpperCase(),
      statusNotice,
    },
    isLoading,
    error: null,
  };
}

function paymentMethodLabel(methodType: CustomerPaymentMethodSummary['methodType']): string {
  switch (methodType) {
    case 'cash_on_service':
      return 'Cash on service';
    case 'gcash':
      return 'GCash checkout';
    case 'paymaya':
      return 'Maya checkout';
    case 'card':
      return 'Card checkout';
  }
}
