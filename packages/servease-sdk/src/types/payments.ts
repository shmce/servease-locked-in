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

export interface CreatePaymentRequest {
  bookingId: string;
  paymentMethod: string;
  promoCode?: string | null;
}

export type SharedPaymentMethod =
  | 'qrph'
  | 'gcash'
  | 'grab_pay'
  | 'grabpay'
  | 'paymaya'
  | 'maya'
  | 'card'
  | 'visa'
  | 'mastercard'
  | 'dob'
  | 'brankas'
  | 'direct_online_banking'
  | 'online_banking';

export interface CreateCheckoutSessionRequest {
  bookingId: string;
  successUrl: string;
  cancelUrl: string;
  promoCode?: string | null;
  paymentMethods?: SharedPaymentMethod[];
}

export interface PaymentCheckoutSessionSummary {
  checkoutId: string;
  provider: 'paymongo' | 'mock';
  providerMode?: 'test' | 'live';
  status:
    | 'created'
    | 'pending'
    | 'paid'
    | 'failed'
    | 'cancelled'
    | 'expired'
    | 'refunded'
    | 'partially_refunded';
  referenceId: string;
  redirectUrl: string;
  expiresAt?: string;
  amount?: {
    value: number;
    currency: string;
  };
  currency?: string;
  paymentMethodsAllowed?: string[];
  metadata?: Record<string, string>;
  paymentId?: string;
  bookingId?: string;
  localPaymentStatus?: PaymentStatus;
  paidAt?: string | null;
}

export interface ValidatePromotionRequest {
  bookingId: string;
  code: string;
}

export interface PromotionValidationSummary {
  code: string;
  valid: boolean;
  discountAmount: number;
  finalAmount: number;
  message: string;
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

export interface UpsertCustomerPaymentMethodRequest {
  methodId?: string | null;
  methodType: CustomerPaymentMethodType;
  label: string;
  brand?: string | null;
  last4?: string | null;
  isDefault?: boolean | null;
}

export type PayoutMethodType = 'bank' | 'gcash' | 'paymaya';
export type PayoutStatus = 'requested' | 'processing' | 'paid' | 'cancelled';

export interface PayoutAccountSummary {
  availableBalance: number;
  pendingBalance: number;
  totalPaidOut: number;
  nextPayoutDate: string | null;
}

export interface PayoutMethodSummary {
  id: string;
  providerId: string;
  methodType: PayoutMethodType;
  accountLabel: string;
  accountName: string | null;
  accountNumberLast4: string | null;
  isDefault: boolean;
  createdAt: string | null;
}

export interface UpsertPayoutMethodRequest {
  methodId?: string | null;
  methodType: PayoutMethodType;
  accountLabel: string;
  accountName?: string | null;
  accountNumberLast4?: string | null;
  isDefault?: boolean | null;
}

export interface PayoutSummary {
  id: string;
  providerId: string;
  amount: number;
  processingFee: number;
  netAmount: number;
  status: PayoutStatus;
  payoutMethodId: string | null;
  methodType: string | null;
  accountLabel: string | null;
  reference: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  requestedAt: string | null;
  paidAt: string | null;
  createdAt: string | null;
}

export interface RequestPayoutInput {
  amount: number;
  payoutMethodId: string;
}
