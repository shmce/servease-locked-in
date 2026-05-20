import { useMemo } from 'react';
import {
  CustomerPaymentMethodSummary,
  CustomerPaymentMethodType,
} from '../../../shared/models/types';
import { paymentMethodMeta } from '../../../shared/utils/paymentMethods';

type CustomerPaymentAction = {
  methodType: CustomerPaymentMethodType;
  label: string;
  busyAction: string;
};

const paymentActions: CustomerPaymentAction[] = [
  { methodType: 'gcash', label: 'Use GCash', busyAction: 'customer-payment-gcash' },
  { methodType: 'paymaya', label: 'Use Maya', busyAction: 'customer-payment-paymaya' },
  { methodType: 'card', label: 'Use Card', busyAction: 'customer-payment-card' },
];

export function useCustomerPaymentMethodsViewModel({
  customerPaymentMethods,
  selectedMethodId,
  busyAction,
}: {
  customerPaymentMethods: CustomerPaymentMethodSummary[];
  selectedMethodId: string | null;
  busyAction: string | null;
}) {
  const data = useMemo(() => {
    const methods = customerPaymentMethods.map((method) => ({
      method,
      label: paymentMethodLabel(method.methodType),
      meta: paymentMethodMeta(method),
      selected: selectedMethodId === method.id,
      canDelete: method.methodType !== 'cash_on_service',
      deleting: busyAction === `delete-customer-payment-${method.id}`,
    }));

    return {
      methods,
      hasMethods: methods.length > 0,
      actions: paymentActions.map((action) => ({
        ...action,
        disabled: busyAction === action.busyAction,
      })),
    };
  }, [busyAction, customerPaymentMethods, selectedMethodId]);

  return {
    data,
    isLoading: customerPaymentMethods.length === 0,
    error: null,
  };
}

function paymentMethodLabel(methodType: CustomerPaymentMethodType): string {
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
