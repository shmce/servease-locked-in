export type PaymentStatus = 'pending' | 'paid' | 'cancelled' | 'refunded';

export interface PaymentSummary {
  id: string;
  bookingId: string;
  customerId: string | null;
  providerId: string | null;
  amount: number;
  platformFee: number;
  providerPayout: number;
  status: PaymentStatus;
  paymentMethod: string | null;
  paidAt: string | null;
  createdAt: string | null;
}

export interface CreatePaymentInput {
  bookingId: string;
  paymentMethod: string;
  promoCode?: string | null;
}

export type CustomerPaymentMethodType =
  | 'cash_on_service'
  | 'card'
  | 'gcash'
  | 'paymaya';

export interface CustomerPaymentMethodSummary {
  id: string;
  customerId: string;
  methodType: CustomerPaymentMethodType;
  label: string;
  brand: string | null;
  last4: string | null;
  isDefault: boolean;
  createdAt: string | null;
}

export interface UpsertCustomerPaymentMethodInput {
  methodId?: string | null;
  methodType: CustomerPaymentMethodType;
  label: string;
  brand?: string | null;
  last4?: string | null;
  isDefault?: boolean | null;
}

interface ApiResponse<T> {
  data?: T;
  error?: {
    message?: string;
  };
}

export function createPayment(
  accessToken: string,
  input: CreatePaymentInput,
): Promise<PaymentSummary> {
  return fetchPaymentApi<PaymentSummary>('/api/payments', {
    accessToken,
    method: 'POST',
    body: input,
  });
}

export function listCustomerPaymentMethods(
  accessToken: string,
): Promise<CustomerPaymentMethodSummary[]> {
  return fetchPaymentApi<CustomerPaymentMethodSummary[]>('/api/payments/methods', {
    accessToken,
    method: 'GET',
  });
}

export function upsertCustomerPaymentMethod(
  accessToken: string,
  input: UpsertCustomerPaymentMethodInput,
): Promise<CustomerPaymentMethodSummary> {
  return fetchPaymentApi<CustomerPaymentMethodSummary>('/api/payments/methods', {
    accessToken,
    method: 'PUT',
    body: input,
  });
}

export function deleteCustomerPaymentMethod(
  accessToken: string,
  methodId: string,
): Promise<CustomerPaymentMethodSummary> {
  return fetchPaymentApi<CustomerPaymentMethodSummary>(
    `/api/payments/methods/${encodeURIComponent(methodId)}`,
    {
      accessToken,
      method: 'DELETE',
    },
  );
}

async function fetchPaymentApi<T>(
  path: string,
  options: {
    accessToken: string;
    method: 'DELETE' | 'GET' | 'POST' | 'PUT';
    body?: unknown;
  },
): Promise<T> {
  const response = await fetch(path, {
    method: options.method,
    headers: {
      authorization: `Bearer ${options.accessToken}`,
      accept: 'application/json',
      ...(options.body ? { 'content-type': 'application/json' } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  }).catch(() => null);

  if (!response) {
    throw new Error('Could not reach payments. Please try again.');
  }

  const payload = (await response.json().catch(() => null)) as
    | ApiResponse<T>
    | null;

  if (!response.ok || !payload?.data) {
    throw new Error(payload?.error?.message ?? 'Payment request failed.');
  }

  return payload.data;
}
