import { CustomerPaymentMethodSummary } from '../models/types';

export function paymentMethodMeta(method: CustomerPaymentMethodSummary): string {
  if (method.methodType === 'cash_on_service') {
    return method.isDefault ? 'Default method' : 'Available method';
  }

  const labels: Record<string, string> = {
    card: 'Card details entered in secure checkout',
    gcash: 'GCash login happens in secure checkout',
    paymaya: 'Maya login happens in secure checkout',
  };
  const label = labels[method.methodType] ?? 'Secure checkout';
  return `${label}${method.isDefault ? ' · Default' : ''}`;
}
