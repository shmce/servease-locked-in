import { CustomerPaymentMethodSummary } from '../models/types';

export function paymentMethodMeta(method: CustomerPaymentMethodSummary): string {
  if (method.methodType === 'cash_on_service') {
    return method.isDefault ? 'Default method' : 'Available method';
  }

  const suffix = method.last4 ? ` ending ${method.last4}` : '';
  const label = method.brand ?? method.methodType.toUpperCase();
  return `${label}${suffix}${method.isDefault ? ' · Default' : ''}`;
}
