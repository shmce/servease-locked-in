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
};

export function useCustomerReservePaymentViewModel({
  customerPaymentMethods,
  selectedMethodId,
  selectedPayment,
  promotionValidation,
  promoCode,
  busyAction,
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
      }),
    [
      busyAction,
      customerPaymentMethods,
      promoCode,
      promotionValidation,
      selectedMethodId,
      selectedPayment,
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
}: CustomerReservePaymentViewModelInput) {
  const paymentMethods = customerPaymentMethods.map((method) => ({
    method,
    meta: paymentMethodMeta(method),
    selected: selectedMethodId === method.id,
  }));
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
      confirmLabel: selectedPayment ? 'Payment reserved' : 'Confirm',
      confirmDisabled: busyAction === 'payment' || Boolean(selectedPayment),
      normalizedPromoCode: promoCode.toUpperCase(),
    },
    isLoading: paymentMethods.length === 0,
    error: null,
  };
}
